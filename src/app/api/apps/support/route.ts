import { NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/api';

export async function GET() {
  return apiSuccess({
    apps: [
      { id: 'word', name: 'Microsoft Word', supported: true, fileTypes: ['.docx'] },
      { id: 'excel', name: 'Microsoft Excel', supported: true, fileTypes: ['.xlsx', '.xls', '.csv'] },
      { id: 'powerpoint', name: 'Microsoft PowerPoint', supported: true, fileTypes: ['.pptx'] },
      { id: 'access', name: 'Microsoft Access', supported: true, fileTypes: ['.accdb', '.mdb'] },
    ],
    languages: ['en', 'fr', 'ht'],
    learningModes: ['doforme', 'walkthrough', 'beginner', 'both'],
  });
}
