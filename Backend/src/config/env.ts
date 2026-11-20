import path from 'node:path';
import dotenv from 'dotenv';

// Carga el .env de la RAÍZ del proyecto, sin importar desde qué carpeta se ejecute el servidor.
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Copiá .env.template como .env en la raíz del proyecto.`
    );
  }
  return valor;
}

/**
 * Orígenes (frontends) que pueden llamar a la API desde el navegador.
 * Se configuran en CORS_ORIGINS separados por coma; si no está, se permite
 * solo el frontend de Angular en desarrollo (ng serve, puerto 4200).
 */
function origenesPermitidos(): string[] {
  const valor = process.env['CORS_ORIGINS'] ?? 'http://localhost:4200';
  return valor
    .split(',')
    .map((origen) => origen.trim())
    .filter((origen) => origen.length > 0);
}

export const env = {
  port: Number(process.env['PORT'] ?? 3000),
  databaseUrl: requerida('DATABASE_URL'),
  jwtSecret: requerida('JWT_SECRET'),
  corsOrigins: origenesPermitidos(),
};
