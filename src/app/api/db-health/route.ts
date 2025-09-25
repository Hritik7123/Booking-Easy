import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Database health check started");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 10));
    
    // Test basic connection
    await prisma.$connect();
    console.log("Database connection successful");
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log("Database query successful, user count:", userCount);
    
    return Response.json({
      status: "healthy",
      message: "Database connection successful",
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return Response.json({
      status: "unhealthy",
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      environment: process.env.NODE_ENV
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
