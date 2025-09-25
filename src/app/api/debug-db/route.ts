import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Check users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, name: true }
    });
    
    // Check provider profiles
    const providerProfiles = await prisma.providerProfile.findMany({
      include: { user: true, services: true }
    });
    
    // Check services
    const services = await prisma.service.findMany({
      select: { id: true, name: true, providerId: true }
    });
    
    return Response.json({
      users: users,
      providerProfiles: providerProfiles,
      services: services,
      counts: {
        users: users.length,
        providers: providerProfiles.length,
        services: services.length
      }
    });
  } catch (error) {
    console.error("Database debug error:", error);
    return Response.json({ 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
