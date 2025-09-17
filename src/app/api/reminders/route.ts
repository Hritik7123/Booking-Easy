import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildICS } from "@/lib/email";

export async function POST(_req: NextRequest) {
  const now = new Date();
  const due = await prisma.notification.findMany({
    where: { status: "PENDING", scheduledAt: { lte: now } },
    take: 50,
  });

  for (const n of due) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: n.bookingId },
        include: { timeSlot: true, service: true, provider: { include: { user: true } }, customer: true },
      });
      if (!booking) continue;
      const ics = buildICS({
        uid: booking.id,
        title: booking.service.name,
        start: booking.timeSlot.start,
        end: booking.timeSlot.end,
        description: n.type === "REMINDER_24H" ? "24h reminder" : "2h reminder",
      });
      await sendEmail({ to: n.targetEmail, subject: "Appointment reminder", html: "Reminder for your upcoming appointment.", icsAttachmentContent: ics, icsFilename: "reminder.ics" });
      await prisma.notification.update({ where: { id: n.id }, data: { status: "SENT", sentAt: new Date() } });
    } catch (e) {
      await prisma.notification.update({ where: { id: n.id }, data: { status: "FAILED" } });
    }
  }

  return Response.json({ sent: due.length });
}

export const dynamic = "force-dynamic";


