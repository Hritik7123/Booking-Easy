-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('REMINDER_24H', 'REMINDER_2H');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "targetEmail" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_scheduledAt_status_idx" ON "public"."Notification"("scheduledAt", "status");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
