import { NextRequest } from 'next/server';
import { apiSuccess, apiError, getUserId } from '@/lib/api';
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
    const {
      message,
      sessionId,
      appMode = 'general',
      language,
      fileContext,
      learningMode,
    } = body as {
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

    // Get or create session
    let session;
    if (sessionId) {
      session = sessionStore.getSession(sessionId);
      if (!session) {
        return apiError({ message: 'Session not found', code: 'NOT_FOUND', statusCode: 404 });
      }
    } else {
      session = sessionStore.createSession(userId, appMode, detectedLang);
    }

    // Persist user message
    sessionStore.addMessage(session.id, 'user', message);

    // Run agent
    const agent = new OfficePilotAgent(provider);
    const result = await agent.run({
      sessionId: session.id,
      userId,
      userMessage: message,
      appMode: (session.appMode as AppMode) || appMode,
      language: detectedLang,
      fileContext,
      learningMode: learningMode as 'doforme' | 'walkthrough' | 'beginner' | 'both' | undefined,
    });

    // Persist assistant response
    sessionStore.addMessage(session.id, 'assistant', result.content);

    return apiSuccess({
      sessionId: session.id,
      response: result.content,
      toolsUsed: result.toolsUsed,
      requiresApproval: result.requiresApproval,
      previews: result.previews,
      appMode: result.metadata.appMode,
      language: result.metadata.language,
      plan: plan.tier,
      messagesUsedToday: plan.messagesUsedToday + 1,
      dailyLimit: plan.dailyLimit,
    });
  } catch (err) {
    return apiError(err);
  }
}
