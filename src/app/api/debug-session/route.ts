import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return Response.json({
      session,
      hasSession: !!session,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email,
      role: session?.user?.role,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug session error:", error);
    return Response.json({ 
      error: "Failed to get session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
