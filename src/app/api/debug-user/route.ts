import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" });
    }

    // Get the current user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        providerProfile: { 
          include: { services: true } 
        } 
      },
    });

    return NextResponse.json({
      session,
      user,
      message: "Current user data"
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
