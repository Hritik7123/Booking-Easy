import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting database migration...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    // Test connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Create tables by running a simple query that will trigger table creation
    try {
      // Try to create a test user to trigger table creation
      const testUser = await prisma.user.create({
        data: {
          email: 'migration-test@example.com',
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
        message: "Database migration completed successfully",
        tablesCreated: true
      });
      
    } catch (error) {
      console.error("Error during migration:", error);
      
      // If tables don't exist, we need to push the schema
      const { execSync } = require('child_process');
      try {
        execSync('npx prisma db push --force-reset', { 
          stdio: 'inherit',
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
        });
        
        return Response.json({
          success: true,
          message: "Database schema pushed successfully",
          schemaPushed: true
        });
      } catch (pushError) {
        console.error("Schema push failed:", pushError);
        return Response.json({
          success: false,
          error: "Failed to create database tables",
          error: pushError instanceof Error ? pushError.message : "Unknown error"
        }, { status: 500 });
      }
    }
    
  } catch (error) {
    console.error("Migration failed:", error);
    
    return Response.json({
      success: false,
      error: "Database migration failed",
      details: error instanceof Error ? error.message : "Unknown error",
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
