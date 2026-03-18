import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAdminKey } from '@/lib/api';
import { toolRegistry, registerAllTools } from '@/lib/tools';

export async function GET(request: NextRequest) {
  try {
    requireAdminKey(request);
    registerAllTools();

    const tools = toolRegistry.getAll().map((t) => ({
      name: t.name,
      description: t.description,
      appModes: t.appModes,
    }));

    return apiSuccess({ tools, count: tools.length });
  } catch (err) {
    return apiError(err);
  }
}
