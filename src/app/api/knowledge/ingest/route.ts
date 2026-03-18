import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAdminKey } from '@/lib/api';
import { ingestPdf } from '@/lib/knowledge';
import { migrate } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    requireAdminKey(request);
    migrate();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'general';

    if (!file) {
      return apiError({ message: 'PDF file is required', code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return apiError({ message: 'Only PDF files are accepted', code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const validCategories = ['word', 'excel', 'powerpoint', 'access', 'general'];
    if (!validCategories.includes(category)) {
      return apiError({ message: `Category must be one of: ${validCategories.join(', ')}`, code: 'VALIDATION_ERROR', statusCode: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestPdf(buffer, file.name, category as 'word' | 'excel' | 'powerpoint' | 'access' | 'general');

    return apiSuccess({
      message: `PDF "${file.name}" ingested successfully`,
      source: file.name,
      category,
      chunksCreated: result.chunksCreated,
      pages: result.pages,
      title: result.title,
    });
  } catch (err) {
    return apiError(err);
  }
}
