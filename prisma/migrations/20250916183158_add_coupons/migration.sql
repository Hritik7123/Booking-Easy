-- CreateTable
CREATE TABLE "public"."Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER,
    "amountOffCents" INTEGER,
    "maxRedemptions" INTEGER,
    "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
    "redeemBy" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "public"."Coupon"("code");
