import { PrismaClient } from "@prisma/client";

// Force SQLite database for development
const databaseUrl = "file:./prisma/dev.db";

export const prisma: PrismaClient = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});


