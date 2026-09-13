import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../auth/auth.middleware';
import { RoomService } from './room.service';

export const roomRouter = Router();

const createRoomSchema = z.object({
  puzzleId: z.string().min(1, 'Se requiere un ID de sopa de letras')
});

roomRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createRoomSchema.parse(req.body);
    const room = await RoomService.create(req.userId!, data.puzzleId);
    res.status(201).json({ roomId: room.id, code: room.code });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

roomRouter.get('/:code', async (req: Request, res: Response) => {
  try {
    const room = await RoomService.getByCode(req.params.code as string);
    if (!room) {
      res.status(404).json({ message: 'Sala no encontrada' });
      return;
    }
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

roomRouter.get('/:code/summary', async (req: Request, res: Response) => {
  try {
    const summary = await RoomService.getRoomSummary(req.params.code as string);
    if (!summary) {
      res.status(404).json({ message: 'Sala no encontrada' });
      return;
    }
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

