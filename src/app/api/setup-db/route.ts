import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Setting up database...");
    
    // Test connection
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Push schema to database
    const { execSync } = require('child_process');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    return Response.json({
      success: true,
      message: "Database setup completed successfully",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    });
    
  } catch (error) {
    console.error("Database setup failed:", error);
    
    return Response.json({
      success: false,
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      instructions: "Please set DATABASE_URL in your Vercel environment variables"
    }, { status: 500 });
  }
}
