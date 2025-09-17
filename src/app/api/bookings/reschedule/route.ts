import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { bookingId, newTimeSlotId } = await req.json();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { timeSlot: true, customer: true, provider: { include: { user: true } }, service: true },
  });
  if (!booking) return Response.json({ error: "Not found" }, { status: 404 });

  const hoursUntil = (booking.timeSlot.start.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) return Response.json({ error: "Inside 24h window" }, { status: 400 });

  const newSlot = await prisma.timeSlot.findUnique({ where: { id: newTimeSlotId } });
  if (!newSlot || newSlot.isBooked) return Response.json({ error: "Slot unavailable" }, { status: 409 });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
    await tx.timeSlot.update({ where: { id: newSlot.id }, data: { isBooked: true } });
    await tx.booking.update({ where: { id: booking.id }, data: { timeSlotId: newSlot.id } });
  });

  const when = newSlot.start.toLocaleString();
  await sendEmail({ to: booking.customer.email, subject: "Booking rescheduled", html: `Your booking was moved to ${when}.` });
  if (booking.provider.user?.email) {
    await sendEmail({ to: booking.provider.user.email, subject: "Booking rescheduled", html: `A client rescheduled to ${when}.` });
  }

  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";


