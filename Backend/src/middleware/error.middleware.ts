import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/http-error';

/** Responde 404 en JSON para rutas de la API que no existen. */
export const rutaNoEncontrada = (req: Request, res: Response) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

/**
 * Manejo centralizado de errores. Express 5 envía acá automáticamente
 * cualquier error lanzado (o promesa rechazada) dentro de un handler async,
 * así que los controllers no necesitan try/catch.
 */
export const manejarErrores = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // JSON mal formado en el body
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Referencia inválida a otro registro (categoría, subcategoría, etc.)' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
  }

  // Error inesperado: se loguea completo en el servidor, pero al cliente
  // no se le muestran detalles internos.
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};
