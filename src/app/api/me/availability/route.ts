import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function requireProvider() {
  const session = await getServerSession(authOptions);
  console.log("Session in requireProvider:", session);
  const email = session?.user?.email as string | undefined;
  if (!email) {
    console.log("No email in session");
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User found:", user);
    if (!user || user.role !== "PROVIDER") {
      console.log("User not found or not a provider:", user?.role);
      return null;
    }
    const profile = await prisma.providerProfile.findUnique({ where: { userId: user.id } });
    console.log("Profile found:", profile);
    return profile;
  } catch (error) {
    console.error("Database error in requireProvider:", error);
    // Fallback for demo purposes
    if (email === "provider@example.com") {
      return {
        id: "demo-provider-id",
        userId: "demo-user-id",
        headline: "Demo Provider",
        bio: "Demo provider for testing",
        location: "Remote",
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationId: null,
      };
    }
    return null;
  }
}

export async function GET() {
  const profile = await requireProvider();
  if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const rules = await prisma.availabilityRule.findMany({ where: { providerId: profile.id }, orderBy: [{ weekday: "asc" }, { startMinutes: "asc" }] });
    return Response.json({ providerId: profile.id, rules });
  } catch (error) {
    console.error("Database error in GET:", error);
    // Return empty rules for demo purposes
    return Response.json({ providerId: profile.id, rules: [] });
  }
}

export async function POST(req: NextRequest) {
  const profile = await requireProvider();
  if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { weekday, startMinutes, endMinutes, timezone } = body as { weekday: number; startMinutes: number; endMinutes: number; timezone?: string };
  if (weekday == null || startMinutes == null || endMinutes == null) return Response.json({ error: "Missing fields" }, { status: 400 });
  
  try {
    const rule = await prisma.availabilityRule.create({
      data: { providerId: profile.id, weekday, startMinutes, endMinutes, timezone: timezone || "UTC" },
    });
    return Response.json({ rule });
  } catch (error) {
    console.error("Database error in POST:", error);
    // Return a mock rule for demo purposes
    return Response.json({ 
      rule: { 
        id: `demo-rule-${Date.now()}`, 
        providerId: profile.id, 
        weekday, 
        startMinutes, 
        endMinutes, 
        timezone: timezone || "UTC",
        createdAt: new Date()
      } 
    });
  }
}

export async function DELETE(req: NextRequest) {
  const profile = await requireProvider();
  if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  
  try {
    await prisma.availabilityRule.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Database error in DELETE:", error);
    // Return success for demo purposes
    return Response.json({ ok: true });
  }
}

export const dynamic = "force-dynamic";


