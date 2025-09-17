import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { bookingId, reason } = await req.json();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { timeSlot: true, customer: true, provider: { include: { user: true } }, service: true },
  });
  if (!booking) return Response.json({ error: "Not found" }, { status: 404 });

  const hoursUntil = (booking.timeSlot.start.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) return Response.json({ error: "Inside 24h window" }, { status: 400 });

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELED", cancelAt: new Date() } });
    await tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
  });

  // Email notifications (best-effort)
  const when = booking.timeSlot.start.toLocaleString();
  await sendEmail({ to: booking.customer.email, subject: "Booking canceled", html: `Your booking for ${when} has been canceled.` });
  if (booking.provider.user?.email) {
    await sendEmail({ to: booking.provider.user.email, subject: "Booking canceled", html: `A client canceled their booking for ${when}.` });
  }

  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";


