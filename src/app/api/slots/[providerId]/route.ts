import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTimeSlotsForProvider } from "@/lib/slots";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;
  const body = await req.json().catch(() => ({}));
  const days = typeof body.days === "number" ? body.days : undefined;
  const slotMinutes = typeof body.slotMinutes === "number" ? body.slotMinutes : undefined;

  const created = await generateTimeSlotsForProvider({ providerId, days, slotMinutes });
  return Response.json({ created });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const { providerId } = await params;
  const slots = await prisma.timeSlot.findMany({
    where: { providerId, isBooked: false, start: { gte: new Date() } },
    orderBy: { start: "asc" },
    take: 100,
  });
  return Response.json({ slots });
}

export const dynamic = "force-dynamic";
