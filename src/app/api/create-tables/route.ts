import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("Creating database tables...");
    
    // Connect to database
    await prisma.$connect();
    console.log("Connected to database");
    
    // Create tables by running a simple query
    // This will trigger Prisma to create the schema
    const result = await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
        "timezone" TEXT NOT NULL DEFAULT 'UTC',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log("User table created");
    
    // Create ProviderProfile table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ProviderProfile" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "organizationId" TEXT,
        "bio" TEXT,
        "location" TEXT,
        "headline" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log("ProviderProfile table created");
    
    // Create Service table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Service" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "providerId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "priceCents" INTEGER NOT NULL,
        "durationMin" INTEGER NOT NULL,
        "category" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    console.log("Service table created");
    
    return Response.json({
      success: true,
      message: "Database tables created successfully!",
      tablesCreated: ["User", "ProviderProfile", "Service"]
    });
    
  } catch (error) {
    console.error("Error creating tables:", error);
    
    return Response.json({
      success: false,
      error: "Failed to create tables",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
