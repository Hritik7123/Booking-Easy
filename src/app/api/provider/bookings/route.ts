import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the provider profile for this user
    const provider = await prisma.providerProfile.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!provider) {
      return Response.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Get all bookings for this provider
    const bookings = await prisma.booking.findMany({
      where: {
        providerId: provider.id
      },
      include: {
        service: true,
        customer: true,
        timeSlot: true,
        payment: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return Response.json({ bookings });
  } catch (error) {
    console.error("Error fetching provider bookings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
