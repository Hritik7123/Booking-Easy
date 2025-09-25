import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    };

    // Test database connection
    let dbStatus = 'Unknown';
    try {
      await prisma.$connect();
      const userCount = await prisma.user.count();
      dbStatus = `Connected - ${userCount} users found`;
    } catch (dbError) {
      dbStatus = `Error: ${dbError.message}`;
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({
      status: 'Debug Info',
      environment: envCheck,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Error',
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
