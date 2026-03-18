import { v4 as uuid } from 'uuid';
import type { ParsedDocument, DocumentSection, PowerPointContext, SlideContext } from '../types';
import { FileParseError } from '@/lib/errors';
import { logger } from '@/lib/logging';
import JSZip from 'jszip';

export async function parsePowerPointDocument(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  try {
    const context = await extractPowerPointContext(buffer);
    const sections = buildPowerPointSections(context);

    return {
      type: 'powerpoint',
      filename,
      sections,
      metadata: {
        slideCount: context.slideCount,
        hasNotes: context.slides.some((s: SlideContext) => s.notes),
      },
    };
  } catch (err) {
    logger.error('Failed to parse PowerPoint document', { filename, error: String(err) });
    throw new FileParseError(`Failed to parse PowerPoint file: ${filename}`, { filename });
  }
}

async function extractPowerPointContext(buffer: Buffer): Promise<PowerPointContext> {
  const zip = await JSZip.loadAsync(buffer);
  const slides: SlideContext[] = [];

  // Find slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0');
      return numA - numB;
    });

  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.file(slideFiles[i])?.async('text');
    if (!slideXml) continue;

    const title = extractTextFromXml(slideXml, 'title') || extractFirstText(slideXml);
    const bullets = extractBullets(slideXml);
    const placeholders = extractPlaceholders(slideXml);

    // Try to find notes
    let notes: string | null = null;
    const noteFile = `ppt/notesSlides/notesSlide${i + 1}.xml`;
    if (zip.files[noteFile]) {
      const noteXml = await zip.file(noteFile)?.async('text');
      if (noteXml) {
        notes = extractAllText(noteXml);
      }
    }

    slides.push({ index: i + 1, title, bullets, notes, placeholders });
  }

  return { slides, slideCount: slides.length };
}

function extractTextFromXml(xml: string, _type: string): string | null {
  // Extract text from <a:t> tags within title placeholders
  const titleRegex = /<p:sp>[\s\S]*?<p:nvSpPr>[\s\S]*?<p:nvPr>[\s\S]*?<p:ph type="title"[\s\S]*?<\/p:sp>/gi;
  const match = titleRegex.exec(xml);
  if (match) {
    return extractAllText(match[0]);
  }
  return null;
}

function extractFirstText(xml: string): string | null {
  const texts = extractAllTextArray(xml);
  return texts.length > 0 ? texts[0] : null;
}

function extractBullets(xml: string): string[] {
  return extractAllTextArray(xml).slice(1); // Skip title
}

function extractPlaceholders(xml: string): string[] {
  const placeholders: string[] = [];
  const phRegex = /<p:ph[^>]*type="([^"]*)"[^>]*>/gi;
  let match;
  while ((match = phRegex.exec(xml)) !== null) {
    placeholders.push(match[1]);
  }
  return placeholders;
}

function extractAllText(xml: string): string {
  return extractAllTextArray(xml).join(' ');
}

function extractAllTextArray(xml: string): string[] {
  const texts: string[] = [];
  const textRegex = /<a:t>([^<]*)<\/a:t>/gi;
  let match;
  while ((match = textRegex.exec(xml)) !== null) {
    const text = match[1].trim();
    if (text) texts.push(text);
  }
  return texts;
}

function buildPowerPointSections(context: PowerPointContext): DocumentSection[] {
  return context.slides.map((slide: SlideContext) => ({
    id: uuid(),
    type: 'slide',
    title: slide.title ?? `Slide ${slide.index}`,
    content: slideToContent(slide),
    metadata: {
      index: slide.index,
      hasNotes: !!slide.notes,
      bulletCount: slide.bullets.length,
    },
  }));
}

function slideToContent(slide: SlideContext): string {
  const parts: string[] = [];
  if (slide.title) parts.push(`Title: ${slide.title}`);
  if (slide.bullets.length > 0) {
    parts.push('Content:');
    slide.bullets.forEach((b: string) => parts.push(`  • ${b}`));
  }
  if (slide.notes) parts.push(`Notes: ${slide.notes}`);
  return parts.join('\n');
}

export function pptContextToSummary(context: PowerPointContext): string {
  return context.slides.map((s: SlideContext) => slideToContent(s)).join('\n\n---\n\n');
}
