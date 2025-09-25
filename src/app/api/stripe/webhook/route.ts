import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-08-27.basil",
  });

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const bookingId = session.metadata?.bookingId as string | undefined;
      if (bookingId) {
        // Mark payment and booking as successful
        const [{ prisma }, { sendEmail, buildICS }] = await Promise.all([
          import("@/lib/prisma"),
          import("@/lib/email"),
        ]);
        const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await tx.payment.update({
            where: { bookingId },
            data: {
              status: "SUCCEEDED",
              stripePaymentIntentId: (session.payment_intent as string) || undefined,
            },
          });
          // Increment coupon redemption if used
          const couponCode = session.metadata?.couponCode as string | undefined;
          if (couponCode) {
            await tx.coupon.updateMany({
              where: { code: couponCode },
              data: { timesRedeemed: { increment: 1 } },
            });
          }
          return tx.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" },
            include: { timeSlot: true, customer: true, provider: { include: { user: true } }, service: true },
          });
        });
        const ics = buildICS({
          uid: booking.id,
          title: booking.service.name,
          start: booking.timeSlot.start,
          end: booking.timeSlot.end,
          description: "Booking confirmation",
        });
        await Promise.all([
          sendEmail({ to: booking.customer.email, subject: "Booking confirmed", html: "Your booking is confirmed.", icsAttachmentContent: ics, icsFilename: "booking.ics" }),
          booking.provider.user?.email
            ? sendEmail({ to: booking.provider.user.email, subject: "New booking", html: `New booking at ${booking.timeSlot.start.toLocaleString()}.`, icsAttachmentContent: ics, icsFilename: "booking.ics" })
            : Promise.resolve(),
          // Enqueue reminders 24h and 2h before
          prisma.notification.create({ data: { bookingId: booking.id, targetEmail: booking.customer.email, type: "REMINDER_24H", scheduledAt: new Date(booking.timeSlot.start.getTime() - 24 * 60 * 60 * 1000) } }),
          prisma.notification.create({ data: { bookingId: booking.id, targetEmail: booking.customer.email, type: "REMINDER_2H", scheduledAt: new Date(booking.timeSlot.start.getTime() - 2 * 60 * 60 * 1000) } }),
        ]);
      }
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
    case "payment_intent.payment_failed": {
      const session = event.data.object as any;
      const bookingId = session.metadata?.bookingId as string | undefined;
      if (bookingId) {
        await import("@/lib/prisma").then(async ({ prisma }) => {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { bookingId },
              data: { status: "CANCELED" },
            });
            // Release slot and cancel booking
            const bk = await tx.booking.update({ where: { id: bookingId }, data: { status: "CANCELED" } });
            await tx.timeSlot.update({ where: { id: bk.timeSlotId }, data: { isBooked: false } });
          });
        });
      }
      break;
    }
    default:
      break;
  }

  // Subscription events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    if (session.mode === "subscription") {
      const userId = session.metadata?.userId as string | undefined;
      const planId = session.metadata?.planId as string | undefined;
      const subscriptionId = session.subscription as string | undefined;
      const customerId = session.customer as string | undefined;
      if (userId && planId && subscriptionId) {
        const { prisma } = await import("@/lib/prisma");
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (plan) {
          const now = new Date();
          const periodEnd = new Date(now);
          if (plan.interval === "WEEK") periodEnd.setDate(now.getDate() + 7);
          else periodEnd.setMonth(now.getMonth() + 1);

          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: {
              userId,
              planId,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              creditsRemaining: plan.creditsPerCycle,
              stripeCustomerId: customerId || undefined,
            },
            create: {
              userId,
              planId,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              creditsRemaining: plan.creditsPerCycle,
              stripeCustomerId: customerId || undefined,
              stripeSubscriptionId: subscriptionId,
            },
          });

          await prisma.creditLedger.create({
            data: { subscriptionId, delta: plan.creditsPerCycle, reason: "Cycle start" },
          });
        }
      }
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription as string | undefined;
    if (subscriptionId) {
      const { prisma } = await import("@/lib/prisma");
      const sub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId }, include: { plan: true } });
      if (sub && sub.plan) {
        const now = new Date();
        const nextEnd = new Date(now);
        if (sub.plan.interval === "WEEK") nextEnd.setDate(now.getDate() + 7);
        else nextEnd.setMonth(now.getMonth() + 1);

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: nextEnd,
            creditsRemaining: sub.plan.creditsPerCycle,
          },
        });
        await prisma.creditLedger.create({ data: { subscriptionId: sub.id, delta: sub.plan.creditsPerCycle, reason: "Renewal" } });
      }
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription as string | undefined;
    if (subscriptionId) {
      const { prisma } = await import("@/lib/prisma");
      const sub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
      if (sub) {
        await prisma.subscription.update({ where: { id: sub.id }, data: { status: "PAST_DUE" } });
      }
    }
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";



