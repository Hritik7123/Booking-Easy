-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."PlanInterval" AS ENUM ('MONTH', 'WEEK');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'REQUIRES_ACTION', 'PROCESSING', 'SUCCEEDED', 'CANCELED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "headline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stripeProductId" TEXT,
    "stripePriceId" TEXT,
    "creditsPerCycle" INTEGER NOT NULL DEFAULT 0,
    "interval" "public"."PlanInterval" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "creditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CreditLedger" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AvailabilityRule" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Blackout" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "Blackout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimeSlot" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "refundId" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "public"."ProviderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "public"."Plan"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "public"."Plan"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "public"."Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "TimeSlot_providerId_start_idx" ON "public"."TimeSlot"("providerId", "start");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_timeSlotId_key" ON "public"."Booking"("timeSlotId");

-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "public"."Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_providerId_idx" ON "public"."Booking"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeChargeId_key" ON "public"."Payment"("stripeChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "public"."Review"("bookingId");

-- AddForeignKey
ALTER TABLE "public"."ProviderProfile" ADD CONSTRAINT "ProviderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProviderProfile" ADD CONSTRAINT "ProviderProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CreditLedger" ADD CONSTRAINT "CreditLedger_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Blackout" ADD CONSTRAINT "Blackout_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeSlot" ADD CONSTRAINT "TimeSlot_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "public"."TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
