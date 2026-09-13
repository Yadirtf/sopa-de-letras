import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../lib/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado. Token no proporcionado.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: 'No autorizado. Token inválido o expirado.' });
    return;
  }

  req.userId = payload.userId;
  req.isGuest = payload.isGuest;
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.isGuest = payload.isGuest;
    }
  }
  next();
}

export function requireRegistered(req: Request, res: Response, next: NextFunction): void {
  authMiddleware(req, res, () => {
    if (req.isGuest) {
      res.status(403).json({ message: 'Acceso denegado. Se requiere cuenta registrada.' });
      return;
    }
    next();
  });
}
