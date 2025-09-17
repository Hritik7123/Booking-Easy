import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { customerEmail, providerId, serviceId, start, end, priceCents } = await req.json();
  if (!customerEmail || !providerId || !serviceId || !start || !end) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.upsert({ where: { email: customerEmail }, update: {}, create: { email: customerEmail } });

  // Create or find slot
  const slot = await prisma.timeSlot.upsert({
    where: { providerId_start_end: { providerId, start: new Date(start), end: new Date(end) } as any },
    update: { isBooked: true },
    create: { providerId, start: new Date(start), end: new Date(end), isBooked: true },
  } as any);

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return Response.json({ error: "Service not found" }, { status: 404 });

  const booking = await prisma.booking.create({
    data: {
      customerId: user.id,
      providerId,
      serviceId,
      timeSlotId: slot.id,
      priceCents: priceCents ?? service.priceCents,
      status: "CONFIRMED",
    },
  });
  return Response.json({ booking });
}

export const dynamic = "force-dynamic";


