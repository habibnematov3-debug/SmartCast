import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1"
    ? null
    : (globalForPrisma.prisma ?? new PrismaClient());

if (process.env.NEXT_PUBLIC_DEMO_MODE !== "1") {
  globalForPrisma.prisma = prisma!;
}
