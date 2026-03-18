import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAdminKey } from '@/lib/api';
import { getKnowledgeSources, deleteKnowledgeSource, searchKnowledge } from '@/lib/knowledge';
import { migrate } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    requireAdminKey(request);
    migrate();

    const query = request.nextUrl.searchParams.get('q');
    const category = request.nextUrl.searchParams.get('category') || undefined;

    if (query) {
      const results = searchKnowledge(query, category, 10);
      return apiSuccess({ results, count: results.length });
    }

    const sources = getKnowledgeSources();
    return apiSuccess({ sources, totalSources: sources.length });
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireAdminKey(request);
    migrate();

    const source = request.nextUrl.searchParams.get('source');
    if (!source) {
      return apiError({ message: 'Source parameter is required', code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const deleted = deleteKnowledgeSource(source);
    return apiSuccess({ message: `Deleted ${deleted} chunks from "${source}"`, deleted });
  } catch (err) {
    return apiError(err);
  }
}
