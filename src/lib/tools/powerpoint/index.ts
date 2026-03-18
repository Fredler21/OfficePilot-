import type { ToolHandler, ToolResult } from '../registry';

export const generatePresentationOutline: ToolHandler = {
  name: 'generate_presentation_outline',
  description: 'Generate a structured slide outline from notes, a topic, or text content.',
  appModes: ['powerpoint', 'general'],
  parameters: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'Notes, topic, or text to convert into slides' },
      slideCount: { type: 'number', description: 'Desired number of slides' },
      audience: {
        type: 'string',
        enum: ['academic', 'business', 'investor', 'training', 'general'],
        description: 'Target audience type',
      },
      style: {
        type: 'string',
        enum: ['minimal', 'detailed', 'visual'],
        description: 'Slide content style',
      },
    },
    required: ['content'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Presentation outline generated (${args.slideCount || 'auto'} slides, ${args.audience || 'general'} audience).`,
    };
  },
};

export const compressSlideText: ToolHandler = {
  name: 'compress_slide_text',
  description: 'Reduce paragraph-heavy slide content into concise bullet points suitable for presentations.',
  appModes: ['powerpoint', 'general'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Slide text to compress' },
      maxBullets: { type: 'number', description: 'Maximum number of bullet points' },
    },
    required: ['text'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Slide text compressed to ${args.maxBullets || 5} bullet points max.`,
    };
  },
};

export const generateSpeakerNotes: ToolHandler = {
  name: 'generate_speaker_notes',
  description: 'Generate presenter/speaker notes for one or more slides based on slide content.',
  appModes: ['powerpoint', 'general'],
  parameters: {
    type: 'object',
    properties: {
      slides: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
        description: 'Slides to generate notes for',
      },
      style: {
        type: 'string',
        enum: ['conversational', 'formal', 'brief'],
        description: 'Style of speaker notes',
      },
    },
    required: ['slides'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const slides = args.slides as unknown[];
    return {
      success: true,
      data: args,
      message: `Speaker notes generated for ${slides.length} slide(s).`,
    };
  },
};

export const suggestSlideVisuals: ToolHandler = {
  name: 'suggest_slide_visuals',
  description: 'Suggest visual elements (icons, charts, images, layouts) for slide content.',
  appModes: ['powerpoint', 'general'],
  parameters: {
    type: 'object',
    properties: {
      slideContent: { type: 'string', description: 'The slide content to suggest visuals for' },
      purpose: { type: 'string', description: 'Purpose of the slide (intro, data, comparison, conclusion, etc.)' },
    },
    required: ['slideContent'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Visual suggestions generated for slide content.`,
    };
  },
};

export const powerpointTools: ToolHandler[] = [
  generatePresentationOutline,
  compressSlideText,
  generateSpeakerNotes,
  suggestSlideVisuals,
];
