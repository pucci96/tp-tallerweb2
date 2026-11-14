// Configuración de Prisma CLI. Al estar en la raíz, todos los comandos `npx prisma ...`
// se pueden correr desde acá sin pasar --config.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'Backend/prisma/schema.prisma',
  migrations: {
    path: 'Backend/prisma/migrations',
    seed: 'tsx Backend/prisma/seed.ts',
  },
  datasource: {
    // Se usa process.env (y no env()) para que `prisma generate` funcione
    // aunque todavía no exista el .env (por ejemplo durante el primer npm install).
    url: process.env['DATABASE_URL'],
  },
});
