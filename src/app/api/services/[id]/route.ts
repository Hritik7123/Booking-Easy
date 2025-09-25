import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Get the current user and their provider profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return Response.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Check if the service belongs to this provider
    const service = await prisma.service.findFirst({
      where: {
        id,
        providerId: user.providerProfile.id,
      },
    });

    if (!service) {
      return Response.json({ error: "Service not found" }, { status: 404 });
    }

    // Delete the service
    await prisma.service.delete({
      where: { id },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Error deleting service:", error);
    return Response.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
