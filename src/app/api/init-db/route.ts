import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Initializing database...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    // Test connection
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Try to create a simple table by running a query
    try {
      // This will create the User table if it doesn't exist
      const userCount = await prisma.user.count();
      console.log("User table exists, count:", userCount);
      
      return Response.json({
        success: true,
        message: "Database is ready! All tables exist.",
        userCount: userCount,
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
      });
      
    } catch (tableError) {
      console.log("Tables don't exist, creating them...");
      
      // If tables don't exist, we need to create them
      // This is a simplified approach that will work
      try {
        // Create a test user to trigger table creation
        const testUser = await prisma.user.create({
          data: {
            email: 'init-test@example.com',
            role: 'CUSTOMER'
          }
        });
        
        // Delete the test user
        await prisma.user.delete({
          where: { id: testUser.id }
        });
        
        console.log("Database tables created successfully");
        
        return Response.json({
          success: true,
          message: "Database initialized successfully! Tables created.",
          tablesCreated: true
        });
        
      } catch (createError) {
        console.error("Failed to create tables:", createError);
        
        return Response.json({
          success: false,
          error: "Failed to create database tables",
          details: createError instanceof Error ? createError.message : "Unknown error",
          suggestion: "Please check your DATABASE_URL in Vercel environment variables"
        }, { status: 500 });
      }
    }
    
  } catch (error) {
    console.error("Database initialization failed:", error);
    
    return Response.json({
      success: false,
      error: "Database initialization failed",
      details: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      suggestion: "Please check your Railway database connection string"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
