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

    // Get all time slots for this provider
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        providerId: provider.id
      },
      include: {
        booking: {
          include: {
            customer: true,
            service: true
          }
        }
      },
      orderBy: {
        startTime: "asc"
      }
    });

    return Response.json({ slots: timeSlots });
  } catch (error) {
    console.error("Error fetching provider slots:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
