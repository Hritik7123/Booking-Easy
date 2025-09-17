import { addDays, addMinutes, isBefore, isEqual, isAfter, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return isBefore(aStart, bEnd) && isAfter(aEnd, bStart);
}

export async function generateTimeSlotsForProvider(params: {
  providerId: string;
  days?: number;
  slotMinutes?: number;
}): Promise<number> {
  const { providerId } = params;
  const days = params.days ?? 21;
  const slotMinutes = params.slotMinutes ?? 60;

  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: { availability: true, blackouts: true },
  });
  if (!provider) return 0;

  const now = new Date();
  const start = startOfDay(now);
  const end = addDays(start, days);

  const createdIds: string[] = [];

  for (const rule of provider.availability) {
    // Walk each day in range
    for (let d = new Date(start); isBefore(d, end); d = addDays(d, 1)) {
      if (d.getDay() !== rule.weekday) continue;

      const windowStart = new Date(d);
      windowStart.setUTCHours(0, rule.startMinutes, 0, 0);
      const windowEnd = new Date(d);
      windowEnd.setUTCHours(0, rule.endMinutes, 0, 0);

      // Skip if within blackouts
      const blocked = provider.blackouts.some((b) => rangesOverlap(windowStart, windowEnd, b.start, b.end));
      if (blocked) continue;

      for (let s = new Date(windowStart); isBefore(addMinutes(s, slotMinutes), windowEnd) || isEqual(addMinutes(s, slotMinutes), windowEnd); s = addMinutes(s, slotMinutes)) {
        const e = addMinutes(s, slotMinutes);

        // Skip if overlapping an existing slot
        const existing = await prisma.timeSlot.findFirst({
          where: { providerId, start: s, end: e },
          select: { id: true },
        });
        if (existing) continue;

        const created = await prisma.timeSlot.create({
          data: { providerId, start: s, end: e },
          select: { id: true },
        });
        createdIds.push(created.id);
      }
    }
  }

  return createdIds.length;
}


