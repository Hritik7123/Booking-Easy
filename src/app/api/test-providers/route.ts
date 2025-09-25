import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const providers = await prisma.providerProfile.findMany({
      include: { user: true, services: true },
      take: 5,
    });
    
    return Response.json({
      success: true,
      count: providers.length,
      providers: providers,
      message: `Found ${providers.length} providers`
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return Response.json({ 
      error: "Failed to fetch providers",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
