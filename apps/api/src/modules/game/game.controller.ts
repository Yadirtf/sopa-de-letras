import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../auth/auth.middleware';
import { GameService } from './game.service';

export const gameRouter = Router();

const createSessionSchema = z.object({
  puzzleId: z.string().min(1, 'ID de sopa de letras requerido')
});

gameRouter.post('/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createSessionSchema.parse(req.body);
    const session = await GameService.createSession(data.puzzleId, req.userId!);
    // Convert BigInt to string for JSON serialization
    res.status(201).json({
      ...session,
      startedAt: session.startedAt.toString()
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

gameRouter.get('/sessions/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const session = await GameService.getSession(req.params.id as string);
    if (!session) {
      res.status(404).json({ message: 'Sesión no encontrada' });
      return;
    }
    
    res.json({
      ...session,
      startedAt: session.startedAt.toString(),
      completedAt: session.completedAt?.toString(),
      elapsedMs: session.elapsedMs?.toString()
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

const moveSchema = z.object({
  cells: z.array(z.object({
    row: z.number(),
    col: z.number()
  })).min(1)
});

gameRouter.post('/sessions/:id/move', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = moveSchema.parse(req.body);
    const result = await GameService.processMove(req.params.id as string, data.cells);
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

