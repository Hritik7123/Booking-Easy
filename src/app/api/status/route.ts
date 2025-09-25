import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'SUCCESS',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
  });
}
