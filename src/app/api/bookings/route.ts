import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { customerEmail, providerId, serviceId, timeSlotId } = await req.json();
  if (!customerEmail || !providerId || !serviceId || !timeSlotId) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: { email: customerEmail },
  });

  const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
  if (!slot || slot.isBooked) {
    return Response.json({ error: "Slot unavailable" }, { status: 409 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return Response.json({ error: "Service not found" }, { status: 404 });

  const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedSlot = await tx.timeSlot.update({
      where: { id: timeSlotId },
      data: { isBooked: true },
    });

    const created = await tx.booking.create({
      data: {
        customerId: user.id,
        providerId,
        serviceId,
        timeSlotId: updatedSlot.id,
        priceCents: service.priceCents,
        status: "CONFIRMED",
      },
    });
    return created;
  });

  return Response.json({ booking });
}

export const dynamic = "force-dynamic";


