import { NextRequest } from 'next/server';
import { apiError, getUserId } from '@/lib/api';
import { OfficePilotAgent } from '@/lib/agents';
import { getAIProvider } from '@/lib/ai';
import { sessionStore } from '@/lib/session';
import { registerAllTools } from '@/lib/tools';
import { migrate } from '@/lib/db';
import { seedTemplates } from '@/lib/templates';
import { detectLanguage } from '@/lib/i18n';
import { getUserPlan, isWithinDailyLimit } from '@/lib/subscription';
import type { AppMode } from '@/lib/types';
import type { SupportedLanguage } from '@/lib/i18n';

let initialized = false;

function ensureInit() {
  if (!initialized) {
    migrate();
    seedTemplates();
    registerAllTools();
    initialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureInit();

    const body = await request.json();
    const { message, sessionId, appMode = 'general', language, fileContext, learningMode } = body as {
      message: string;
      sessionId?: string;
      appMode?: AppMode;
      language?: SupportedLanguage;
      fileContext?: string;
      learningMode?: string;
    };

    if (!message?.trim()) {
      return apiError({ message: 'Message is required', code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const userId = getUserId(request);

    // Check plan limits
    const plan = getUserPlan(userId);
    if (!isWithinDailyLimit(plan)) {
      return apiError({
        message: `You've reached your daily limit of ${plan.dailyLimit} messages. Upgrade to Pro for more.`,
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
      });
    }

    // Premium users get Claude, free users get Gemini
    const provider = plan.canUsePremium ? getAIProvider('claude') : getAIProvider('gemini');

    const detectedLang = language ?? detectLanguage(message);

    let session;
    if (sessionId) {
      session = sessionStore.getSession(sessionId);
      if (!session) {
        return apiError({ message: 'Session not found', code: 'NOT_FOUND', statusCode: 404 });
      }
    } else {
      session = sessionStore.createSession(userId, appMode, detectedLang);
    }

    sessionStore.addMessage(session.id, 'user', message);

    const agent = new OfficePilotAgent(provider);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          for await (const event of agent.stream({
            sessionId: session!.id,
            userId,
            userMessage: message,
            appMode: (session!.appMode as AppMode) || appMode,
            language: detectedLang,
            fileContext,
            learningMode: learningMode as 'doforme' | 'walkthrough' | 'beginner' | 'both' | undefined,
          })) {
            const line = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(line));
            if (event.type === 'content' && event.content) {
              fullContent += event.content;
            }
          }

          if (fullContent) {
            sessionStore.addMessage(session!.id, 'assistant', fullContent);
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err) {
          const errorEvent = JSON.stringify({
            type: 'error',
            error: err instanceof Error ? err.message : 'Stream failed',
          });
          controller.enqueue(encoder.encode(`data: ${errorEvent}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Session-Id': session.id,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
