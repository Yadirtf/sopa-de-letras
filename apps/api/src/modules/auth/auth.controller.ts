import { z } from 'zod';
import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { authMiddleware } from './auth.middleware';
import { prisma } from '../../lib/prisma';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nickname: z.string().min(2, 'El nickname debe tener al menos 2 caracteres')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
});

const guestSchema = z.object({
  nickname: z.string().min(2, 'El nickname debe tener al menos 2 caracteres')
});

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await AuthService.register(data.email, data.password, data.nickname);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstMsg = error.errors[0]?.message || 'Datos inválidos';
      res.status(400).json({ message: firstMsg, errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await AuthService.login(data.email, data.password);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(401).json({ message: error.message });
    }
  }
});

authRouter.post('/guest', async (req: Request, res: Response) => {
  try {
    const data = guestSchema.parse(req.body);
    const result = await AuthService.createGuest(data.nickname);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, nickname: true, isGuest: true, createdAt: true }
    });
    
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
