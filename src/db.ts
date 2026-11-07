import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client'; // Importas desde tu output personalizado
import 'dotenv/config';

// Configuramos el pool nativo de PostgreSQL
const pool = new Pool({ 
  connectionString: process.env["DATABASE_URL"]
});

const adapter = new PrismaPg(pool);

// El cliente de Prisma v7 se ejecuta de manera "Rust-free" usando este adaptador
export const prisma = new PrismaClient({ adapter });