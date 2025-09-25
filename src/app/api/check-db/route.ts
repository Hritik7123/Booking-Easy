import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Checking database connection...");
    
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    console.log("Database connection successful!");
    return Response.json({ 
      status: "Database connected successfully",
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    return Response.json({ 
      status: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    }, { status: 500 });
  }
}
