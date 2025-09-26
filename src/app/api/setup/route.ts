import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(req: NextRequest) {
  try {
    console.log('Setting up database...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL not found in environment variables',
        suggestion: 'Please add DATABASE_URL to your Vercel environment variables'
      }, { status: 500 });
    }

    console.log('DATABASE_URL found, running prisma db push...');
    
    // Run prisma db push to create tables
    execSync('npx prisma db push', {
      stdio: 'inherit',
      env: { ...process.env }
    });

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Database setup failed:', error);
    return NextResponse.json({
      error: 'Failed to setup database',
      details: error.message,
      suggestion: 'Check your DATABASE_URL in Vercel environment variables'
    }, { status: 500 });
  }
}