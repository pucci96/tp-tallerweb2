/**
 * Error con código HTTP. Lanzalo desde services/controllers para responder
 * un error "esperado" (validación, no encontrado, sin permisos...).
 * El middleware de errores lo convierte en { error: mensaje } con ese status.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Convierte un parámetro de ruta en número entero positivo o lanza 400. */
export function parseId(valor: unknown, nombre = 'id'): number {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  const id = Number(texto);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `El ${nombre} debe ser un número entero positivo`);
  }
  return id;
}
