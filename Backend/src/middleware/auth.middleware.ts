import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

export interface TokenPayload {
  sub: number;
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
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
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
