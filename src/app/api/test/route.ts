import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'SUCCESS',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    status: 'SUCCESS',
    message: 'POST API is working!',
    timestamp: new Date().toISOString()
  });
}