import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(req: NextRequest) {
  try {
    console.log('🚀 Initializing database...');
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        message: 'Please add DATABASE_URL to your Vercel environment variables'
      }, { status: 500 });
    }

    console.log('✅ DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npx prisma generate', {
      stdio: 'inherit',
      env: { ...process.env }
    });

    // Push database schema
    console.log('🗄️ Creating database tables...');
    execSync('npx prisma db push', {
      stdio: 'inherit',
      env: { ...process.env }
    });

    return NextResponse.json({
      success: true,
      message: '✅ Database initialized successfully!',
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL.substring(0, 20) + '...'
    });

  } catch (error: any) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json({
      error: 'Database initialization failed',
      details: error.message,
      suggestion: 'Check your DATABASE_URL in Vercel environment variables'
    }, { status: 500 });
  }
}