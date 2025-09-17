import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

async function requireProvider() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "PROVIDER") return null;
  const profile = await prisma.providerProfile.findUnique({ where: { userId: user.id } });
  return profile;
}

export async function GET() {
  const profile = await requireProvider();
  if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rules = await prisma.availabilityRule.findMany({ where: { providerId: profile.id }, orderBy: [{ weekday: "asc" }, { startMinutes: "asc" }] });
  return Response.json({ providerId: profile.id, rules });
}

export async function POST(req: NextRequest) {
  const profile = await requireProvider();
  if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { weekday, startMinutes, endMinutes, timezone } = body as { weekday: number; startMinutes: number; endMinutes: number; timezone?: string };
  if (weekday == null || startMinutes == null || endMinutes == null) return Response.json({ error: "Missing fields" }, { status: 400 });
  const rule = await prisma.availabilityRule.create({
    data: { providerId: profile.id, weekday, startMinutes, endMinutes, timezone: timezone || "UTC" },
  });
  return Response.json({ rule });
}

export async function DELETE(req: NextRequest) {
  const profile = await requireProvider();
  if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.availabilityRule.delete({ where: { id } });
  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";


