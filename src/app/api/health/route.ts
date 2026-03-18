import { NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/api';

export async function GET() {
  return apiSuccess({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
