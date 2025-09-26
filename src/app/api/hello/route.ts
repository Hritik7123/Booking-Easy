import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Hello! API is working!',
    timestamp: new Date().toISOString(),
    status: 'SUCCESS'
  });
}