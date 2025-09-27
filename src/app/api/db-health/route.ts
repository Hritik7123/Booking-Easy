import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Database health check started");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 10));
    
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return Response.json({
        status: "unhealthy",
        error: "DATABASE_URL not configured",
        message: "Please add DATABASE_URL to your Vercel environment variables",
        setupInstructions: {
          step1: "Go to Vercel Dashboard → Your Project → Settings",
          step2: "Go to Environment Variables",
          step3: "Add DATABASE_URL with your PostgreSQL connection string",
          step4: "Redeploy your application",
          step5: "Visit /api/init-database to create tables"
        },
        quickSetup: "Visit: https://your-app.vercel.app/api/init-database",
        alternatives: [
          "Vercel Postgres (free tier)",
          "Railway (free PostgreSQL)",
          "Neon (free tier)",
          "Supabase (free PostgreSQL)"
        ]
      }, { status: 500 });
    }
    
    // Test basic connection
    await prisma.$connect();
    console.log("Database connection successful");
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log("Database query successful, user count:", userCount);
    
    // Check if tables exist by trying to query each main table
    const tableChecks = {
      users: await prisma.user.count(),
      providers: await prisma.providerProfile.count(),
      services: await prisma.service.count(),
      bookings: await prisma.booking.count()
    };
    
    return Response.json({
      status: "healthy",
      message: "Database connection successful",
      userCount: userCount,
      tableChecks: tableChecks,
      databaseUrl: "Configured",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("Database health check failed:", error);
    
    // Provide specific error messages based on the error type
    let errorMessage = "Database connection failed";
    let setupInstructions = null;
    
    if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
      errorMessage = "Database tables don't exist";
      setupInstructions = {
        step1: "Visit /api/init-database to create tables",
        step2: "This will run 'npx prisma db push' to set up your schema"
      };
    } else if (error.message?.includes('connect')) {
      errorMessage = "Cannot connect to database";
      setupInstructions = {
        step1: "Check your DATABASE_URL in Vercel environment variables",
        step2: "Make sure the database server is accessible",
        step3: "Verify your database credentials are correct"
      };
    } else if (error.message?.includes('authentication')) {
      errorMessage = "Database authentication failed";
      setupInstructions = {
        step1: "Check your database username and password",
        step2: "Make sure the database user has proper permissions"
      };
    }
    
    return Response.json({
      status: "unhealthy",
      error: errorMessage,
      details: error.message,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      environment: process.env.NODE_ENV,
      setupInstructions: setupInstructions,
      quickSetup: "Visit: https://your-app.vercel.app/api/init-database"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
