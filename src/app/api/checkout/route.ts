import { NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  // If Stripe is not configured, create a direct booking instead of going through checkout
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe not configured, creating direct booking...");
    
    const { customerEmail, providerId, serviceId, timeSlotId, couponCode } = await req.json();
    if (!customerEmail || !providerId || !serviceId || !timeSlotId) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.upsert({ where: { email: customerEmail }, update: {}, create: { email: customerEmail } });
    const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
    if (!slot || slot.isBooked) return Response.json({ error: "Slot unavailable" }, { status: 409 });
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return Response.json({ error: "Service not found" }, { status: 404 });

    // Apply coupon if valid
    let amount = service.priceCents;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      const now = new Date();
      const valid = coupon && coupon.active && (!coupon.redeemBy || coupon.redeemBy > now) && (!coupon.maxRedemptions || coupon.timesRedeemed < coupon.maxRedemptions);
      if (valid) {
        if (coupon.percentOff) amount = Math.max(0, Math.floor((amount * (100 - coupon.percentOff)) / 100));
        if (coupon.amountOffCents) amount = Math.max(0, amount - coupon.amountOffCents);
      }
    }

    // Create a confirmed booking directly
    const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.timeSlot.update({ where: { id: timeSlotId }, data: { isBooked: true } });
      const createdBooking = await tx.booking.create({
        data: {
          customerId: user.id,
          providerId,
          serviceId,
          timeSlotId,
          priceCents: amount,
          status: "CONFIRMED",
        },
      });

             // Create a mock payment record
             await tx.payment.create({
               data: {
                 bookingId: createdBooking.id,
                 amountCents: amount,
                 status: "SUCCEEDED",
                 currency: "usd",
               },
             });

      return createdBooking;
    });

    return Response.json({ 
      success: true, 
      booking,
      message: "Booking confirmed successfully! (Demo mode - no payment required)"
    });
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" });

  const { customerEmail, providerId, serviceId, timeSlotId, couponCode } = await req.json();
  if (!customerEmail || !providerId || !serviceId || !timeSlotId) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.upsert({ where: { email: customerEmail }, update: {}, create: { email: customerEmail } });
  const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
  if (!slot || slot.isBooked) return Response.json({ error: "Slot unavailable" }, { status: 409 });
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return Response.json({ error: "Service not found" }, { status: 404 });

  // Create a pending booking and reserve the slot
  const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.timeSlot.update({ where: { id: timeSlotId }, data: { isBooked: true } });
    return tx.booking.create({
      data: {
        customerId: user.id,
        providerId,
        serviceId,
        timeSlotId,
        priceCents: service.priceCents,
        status: "PENDING",
      },
    });
  });

  // Apply coupon if valid
  let amount = service.priceCents;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    const now = new Date();
    const valid = coupon && coupon.active && (!coupon.redeemBy || coupon.redeemBy > now) && (!coupon.maxRedemptions || coupon.timesRedeemed < coupon.maxRedemptions);
    if (valid) {
      if (coupon.percentOff) amount = Math.max(0, Math.floor((amount * (100 - coupon.percentOff)) / 100));
      if (coupon.amountOffCents) amount = Math.max(0, amount - coupon.amountOffCents);
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: { name: service.name, description: service.description ?? undefined },
        },
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/providers/${providerId}?success=1`,
    cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/providers/${providerId}?canceled=1`,
    metadata: { bookingId: booking.id, providerId, serviceId, timeSlotId, couponCode: couponCode || "" },
  });

  // Create a payment placeholder
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amountCents: amount,
      status: "REQUIRES_CONFIRMATION",
      currency: "usd",
    },
  });

  return Response.json({ url: session.url });
}

export const dynamic = "force-dynamic";


