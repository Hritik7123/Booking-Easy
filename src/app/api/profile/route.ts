import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, headline, bio, location } = body;

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { providerProfile: true },
    });

    if (!user || !user.providerProfile) {
      return Response.json({ error: "Provider profile not found" }, { status: 404 });
    }

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    // Update provider profile
    await prisma.providerProfile.update({
      where: { id: user.providerProfile.id },
      data: {
        headline,
        bio,
        location,
      },
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
