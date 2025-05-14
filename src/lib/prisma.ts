import { PrismaClient } from '@prisma/client';

// Configuración para evitar que Prisma intente crear un directorio local
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// PrismaClient con opciones simplificadas para evitar crear directorios locales
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  }
});

// Solo asignamos a global en desarrollo para evitar múltiples conexiones
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
