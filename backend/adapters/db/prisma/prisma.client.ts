import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Singleton del PrismaClient para evitar múltiples instancias en desarrollo
 * con hot-reload de Next.js.
 *
 * Prisma 7+ requiere un driver adapter explícito en lugar de gestionar
 * la conexión internamente.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
