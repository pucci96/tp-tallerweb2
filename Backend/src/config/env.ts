import path from 'node:path';
import dotenv from 'dotenv';

// Carga el .env de la RAÍZ del proyecto, sin importar desde qué carpeta se ejecute el servidor.
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copiá .env.example como .env en la raíz del proyecto.`
    );
  }
  return valor;
}

export const env = {
  port: Number(process.env['PORT'] ?? 3000),
  databaseUrl: requerida('DATABASE_URL'),
  jwtSecret: requerida('JWT_SECRET'),
};
