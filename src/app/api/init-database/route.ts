import { NextRequest } from "next/server";
import { execSync } from 'child_process';

export async function GET(req: NextRequest) {
  try {
    console.log("Initializing database on Vercel...");
    
    // Run Prisma commands to set up database
    execSync('npx prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    execSync('npx prisma db push', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log("Database initialized successfully!");
    return Response.json({ 
      success: true, 
      message: "Database initialized successfully on Vercel!",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    return Response.json({ 
      success: false, 
      message: "Failed to initialize database.", 
      error: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    }, { status: 500 });
  }
}
