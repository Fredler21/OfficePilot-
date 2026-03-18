import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api';
import { getTemplates } from '@/lib/templates';
import { migrate } from '@/lib/db';
import { seedTemplates } from '@/lib/templates';

let initialized = false;

export async function GET(request: NextRequest) {
  try {
    if (!initialized) { migrate(); seedTemplates(); initialized = true; }

    const { searchParams } = new URL(request.url);
    const appType = searchParams.get('appType') ?? undefined;
    const category = searchParams.get('category') ?? undefined;

    const templates = getTemplates(appType, category);

    return apiSuccess({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        appType: t.appType,
        category: t.category,
        description: t.description,
      })),
      total: templates.length,
    });
  } catch (err) {
    return apiError(err);
  }
}
