import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, duration, category } = body;

    // Get the current user and their provider profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return Response.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Create new service
    const service = await prisma.service.create({
      data: {
        providerId: user.providerProfile.id,
        name,
        description,
        priceCents: Math.round(parseFloat(price) * 100), // Convert to cents
        durationMin: parseInt(duration),
        category,
      },
    });

    return Response.json({ success: true, service });

  } catch (error) {
    console.error("Error creating service:", error);
    return Response.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
