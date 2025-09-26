import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Try to count users
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Database connection failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error.message,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 20) + '...',
      suggestion: 'Check your DATABASE_URL in Vercel environment variables'
    }, { status: 500 });
  }
}
