import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL);
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log("Database connection successful! User count:", userCount);
    
    return Response.json({ 
      success: true, 
      message: "Database connection successful",
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL
    });
    
  } catch (error) {
    console.error("Database error:", error);
    return Response.json({ 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL
    }, { status: 500 });
  }
}
