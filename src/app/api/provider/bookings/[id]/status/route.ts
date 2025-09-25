import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status: newStatus } = await req.json();
    const { id: bookingId } = await params;

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"];
    if (!validStatuses.includes(newStatus)) {
      return Response.json({ error: `Invalid status: ${newStatus}` }, { status: 400 });
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

    // Find the booking and verify ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        providerId: provider.id
      }
    });

    if (!booking) {
      return Response.json({ error: "Booking not found or unauthorized" }, { status: 404 });
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus }
    });

    return Response.json({ 
      success: true, 
      message: `Booking ${newStatus.toLowerCase()} successfully` 
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
