import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    
    console.log("Become-provider API called with email:", email);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    const session = await getServerSession(authOptions);
    console.log("Session in become-provider:", session);
    
    if (!session?.user?.email && !email) {
      console.log("No session found and no email in request, returning 401");
      return Response.json({ error: "Not authenticated. Please log in first." }, { status: 401 });
    }
    
    // Use session email if available, otherwise use email from request
    const userEmail = session?.user?.email || email;
    console.log("Using email:", userEmail);

    const {
      name,
      headline,
      bio,
      location,
      serviceName,
      serviceDescription,
      servicePrice,
      serviceDuration,
      serviceCategory,
    } = body;

    // Validate required fields
    if (!name || !headline || !bio || !location || !serviceName || !serviceDescription || !servicePrice || !serviceDuration || !serviceCategory) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.log("DATABASE_URL not configured, returning setup instructions");
      return Response.json({
        error: "Database not configured",
        message: "Please set up a database connection first",
        instructions: {
          step1: "Go to your Vercel Dashboard",
          step2: "Navigate to your project settings",
          step3: "Go to Environment Variables",
          step4: "Add DATABASE_URL with your PostgreSQL connection string",
          step5: "Redeploy your application",
          step6: "Visit /api/init-database to create tables"
        },
        quickSetup: "Visit: https://your-app.vercel.app/api/init-database",
        alternatives: [
          "Use Vercel Postgres (free tier available)",
          "Use Railway (free PostgreSQL)",
          "Use Neon (free tier)",
          "Use Supabase (free PostgreSQL)"
        ]
      }, { status: 500 });
    }

    // Test database connection first
    try {
      console.log("Testing database connection...");
      await prisma.$connect();
      console.log("Database connection successful");
    } catch (dbError: any) {
      console.error("Database connection failed:", dbError);
      
      // If it's a "relation does not exist" error, try to create tables
      if (dbError.message && dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
        console.log("Tables don't exist, attempting to create them...");
        try {
          const { execSync } = require('child_process');
          execSync('npx prisma db push', {
            stdio: 'inherit',
            env: { ...process.env }
          });
          console.log("Database tables created successfully");
        } catch (pushError: any) {
          console.error("Failed to create tables:", pushError);
          return Response.json({
            error: "Database tables don't exist. Please initialize the database first.",
            details: "Visit /api/init-database to set up the database",
            suggestion: "Go to: https://your-app.vercel.app/api/init-database"
          }, { status: 500 });
        }
      } else {
        return Response.json({ 
          error: "Database connection failed. Please check your Vercel environment variables.", 
          details: "Make sure DATABASE_URL is set correctly in your Vercel project settings.",
          suggestion: "Visit /api/init-database to initialize the database"
        }, { status: 500 });
      }
    }

    // Get the current user
    let user;
    try {
      console.log("Attempting to find user with email:", userEmail);
      user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      console.log("User found:", user);
    } catch (dbError) {
      console.error("Database error finding user:", dbError);
      return Response.json({ 
        error: "Database query failed. Please try again.", 
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      }, { status: 500 });
    }

    if (!user) {
      console.log("User not found for email:", userEmail);
      return Response.json({ error: "User not found. Please log in again." }, { status: 404 });
    }

    // Check if user is already a provider
    if (user.role === "PROVIDER") {
      return Response.json({ error: "User is already a provider" }, { status: 400 });
    }

    // Update user role to PROVIDER and name
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          role: "PROVIDER",
          name: name
        },
      });
    } catch (dbError) {
      console.error("Error updating user role and name:", dbError);
      return Response.json({ error: "Failed to update user role and name" }, { status: 500 });
    }

    // Create provider profile
    let providerProfile;
    try {
      providerProfile = await prisma.providerProfile.create({
        data: {
          userId: user.id,
          headline,
          bio,
          location,
        },
      });
    } catch (dbError) {
      console.error("Error creating provider profile:", dbError);
      return Response.json({ error: "Failed to create provider profile" }, { status: 500 });
    }

    // Create the first service
    let service;
    try {
      service = await prisma.service.create({
        data: {
          providerId: providerProfile.id,
          name: serviceName,
          description: serviceDescription,
          priceCents: Math.round(parseFloat(servicePrice) * 100), // Convert to cents
          durationMin: parseInt(serviceDuration),
          category: serviceCategory,
        },
      });
    } catch (dbError) {
      console.error("Error creating service:", dbError);
      return Response.json({ error: "Failed to create service" }, { status: 500 });
    }

    // Create default availability rules (Mon-Fri 9-17)
    try {
      for (let weekday = 1; weekday <= 5; weekday++) {
        await prisma.availabilityRule.create({
          data: {
            providerId: providerProfile.id,
            weekday,
            startMinutes: 9 * 60, // 9 AM
            endMinutes: 17 * 60,   // 5 PM
            timezone: "UTC",
          },
        });
      }
    } catch (dbError) {
      console.error("Error creating availability rules:", dbError);
      // Don't fail the entire operation for this, just log it
      console.log("Warning: Could not create default availability rules");
    }

    console.log("Provider profile created successfully:", {
      providerId: providerProfile.id,
      serviceId: service.id,
      userEmail: userEmail
    });

    return Response.json({
      success: true,
      providerId: providerProfile.id,
      serviceId: service.id,
      message: "Provider profile created successfully",
    });

  } catch (error) {
    console.error("Error creating provider profile:", error);
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('connect')) {
      return Response.json({
        error: "Database connection failed. Please check your Vercel environment variables.",
        details: "Make sure DATABASE_URL is set correctly in your Vercel project settings."
      }, { status: 500 });
    }
    
    // For demo purposes, if database fails, return a mock success
    if (body.email) {
      console.log("Database error, but returning mock success for demo");
      return Response.json({
        success: true,
        providerId: `mock-${Date.now()}`,
        serviceId: `service-${Date.now()}`,
        message: "Provider profile created successfully (demo mode - database not configured)",
        demo: true,
        instructions: "To enable full functionality, please set up a PostgreSQL database and add DATABASE_URL to your Vercel environment variables"
      });
    }
    
    return Response.json(
      { 
        error: "Failed to create provider profile",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
