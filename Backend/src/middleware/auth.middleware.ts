import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

export interface TokenPayload {
  sub: number;        // id de Login
  id_usuario: number; // id de Usuario (datos personales, pedidos)
  email: string;
  rol: string;
}

declare global {
  namespace Express {
    interface Request {
      usuarioToken?: TokenPayload;
    }
  }
}

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
    // Tokens emitidos antes de agregar id_usuario: se piden de nuevo (re-login).
    if (typeof payload.id_usuario !== 'number') {
      return res.status(401).json({ error: 'Sesión desactualizada, volvé a iniciar sesión' });
    }
    req.usuarioToken = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const requireRole = (rolRequerido: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.usuarioToken?.rol !== rolRequerido) {
      return res.status(403).json({ error: 'No tenés permisos para esta acción' });
    }
    next();
  };
};

/** Atajo para rutas de administración: token válido + rol ADMIN. */
export const soloAdmin = [verificarToken, requireRole('ADMIN')];

/** Devuelve el usuario del token. Usar solo en rutas protegidas con verificarToken. */
export function usuarioDelToken(req: Request): TokenPayload {
  if (!req.usuarioToken) {
    throw new Error('usuarioDelToken() usado en una ruta sin verificarToken');
  }
  return req.usuarioToken;
}
