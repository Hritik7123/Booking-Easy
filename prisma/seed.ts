import { PrismaClient, UserRole, PlanInterval } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Plans
  const monthly = await prisma.plan.upsert({
    where: { name: "Monthly 4 Sessions" },
    update: {},
    create: {
      name: "Monthly 4 Sessions",
      creditsPerCycle: 4,
      interval: PlanInterval.MONTH,
    },
  });

  // Provider
  const providerUser = await prisma.user.upsert({
    where: { email: "provider@example.com" },
    update: {},
    create: { email: "provider@example.com", role: "PROVIDER" as UserRole, name: "Alex Coach" },
  });

  const provider = await prisma.providerProfile.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      headline: "Personal Training",
      bio: "Certified trainer with 10 years experience.",
      location: "Remote",
    },
  });

  const service = await prisma.service.upsert({
    where: { id: `${provider.id}-svc` },
    update: {},
    create: {
      id: `${provider.id}-svc`,
      providerId: provider.id,
      name: "1:1 Coaching (60m)",
      durationMin: 60,
      priceCents: 5000,
      category: "Coaching",
      description: "Video session via Zoom",
    },
  });

  // Availability Mon-Fri 9-17
  for (let weekday = 1; weekday <= 5; weekday++) {
    await prisma.availabilityRule.create({
      data: {
        providerId: provider.id,
        weekday,
        startMinutes: 9 * 60,
        endMinutes: 17 * 60,
        timezone: "UTC",
      },
    });
  }

  // Customer
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: { email: "customer@example.com", role: "CUSTOMER" as UserRole, name: "Jamie Customer" },
  });

  console.log({ monthly, provider: providerUser.email, service: service.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


