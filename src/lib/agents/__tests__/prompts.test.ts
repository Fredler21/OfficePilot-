import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/agents/prompts';

describe('Agent Prompts', () => {
  it('builds system prompt with Word mode', () => {
    const prompt = buildSystemPrompt('word', 'en');
    expect(prompt).toContain('OfficePilot');
    expect(prompt).toContain('Microsoft Word');
    expect(prompt).toContain('English');
  });

  it('builds system prompt with Excel mode', () => {
    const prompt = buildSystemPrompt('excel', 'en');
    expect(prompt).toContain('Microsoft Excel');
    expect(prompt).toContain('Formula');
  });

  it('builds system prompt with PowerPoint mode', () => {
    const prompt = buildSystemPrompt('powerpoint', 'fr');
    expect(prompt).toContain('Microsoft PowerPoint');
    expect(prompt).toContain('French');
  });

  it('builds system prompt with Access mode', () => {
    const prompt = buildSystemPrompt('access', 'ht');
    expect(prompt).toContain('Microsoft Access');
    expect(prompt).toContain('Kreyòl');
  });

  it('includes file context when provided', () => {
    const prompt = buildSystemPrompt('general', 'en', 'Sheet1: Revenue data with Q1-Q4 columns');
    expect(prompt).toContain('Revenue data');
    expect(prompt).toContain('Current File Context');
  });

  it('includes learning mode directive', () => {
    const prompt = buildSystemPrompt('general', 'en', undefined, 'beginner');
    expect(prompt).toContain('Beginner');
    expect(prompt).toContain('simple language');
  });

  it('includes user preferences', () => {
    const prompt = buildSystemPrompt('general', 'en', undefined, undefined, {
      citation_format: 'APA',
      tone: 'formal',
    });
    expect(prompt).toContain('citation_format: APA');
    expect(prompt).toContain('tone: formal');
  });

  it('always includes safety rules', () => {
    const prompt = buildSystemPrompt('general', 'en');
    expect(prompt).toContain('destructive changes');
    expect(prompt).toContain('user approval');
    expect(prompt).toContain('Only assist with Microsoft Office');
  });
});
