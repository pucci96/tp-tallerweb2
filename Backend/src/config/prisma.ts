import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('Falta DATABASE_URL en las variables de entorno');
}

const adapter = new PrismaPg({ connectionString: url });

export const prisma = new PrismaClient({ adapter });
