import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireRegistered, optionalAuth } from '../auth/auth.middleware';
import { PuzzleService } from './puzzle.service';

export const puzzleRouter = Router();

const createPuzzleSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  words: z.array(z.string()).min(1, 'Se requiere al menos una palabra'),
  status: z.enum(['draft', 'published']).optional(),
  config: z.object({
    size: z.number().min(5).max(30),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    allowReverse: z.boolean(),
    allowDiagonal: z.boolean(),
    allowHorizontal: z.boolean(),
    allowVertical: z.boolean()
  })
});

puzzleRouter.post('/', requireRegistered, async (req: Request, res: Response) => {
  try {
    const data = createPuzzleSchema.parse(req.body);
    const puzzle = await PuzzleService.create(req.userId!, data);
    res.status(201).json({ puzzleId: puzzle.id, code: puzzle.code });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

puzzleRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const search = (req.query.search as string) || '';
    const difficulty = (req.query.difficulty as string) || '';
    const result = await PuzzleService.getPublicPuzzles({ page, limit, search, difficulty });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

puzzleRouter.get('/mine', requireRegistered, async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const status = (req.query.status as string) || 'all';
    const search = (req.query.search as string) || '';
    const result = await PuzzleService.getMyPuzzles(req.userId!, { page, limit, status, search });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Edit, Update and Delete routes (placed BEFORE /:code to avoid param conflicts)
puzzleRouter.get('/edit/:id', requireRegistered, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const puzzle = await PuzzleService.getByIdForEdit(id, req.userId!);
    const { placements, ...safePuzzle } = puzzle;
    res.json(safePuzzle);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

puzzleRouter.put('/:id', requireRegistered, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = createPuzzleSchema.parse(req.body);
    const puzzle = await PuzzleService.update(id, req.userId!, data);
    res.json({ message: 'Sopa de letras actualizada correctamente', puzzleId: puzzle.id, code: puzzle.code });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

puzzleRouter.delete('/:id', requireRegistered, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await PuzzleService.delete(id, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

puzzleRouter.patch('/:id/publish', requireRegistered, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const puzzle = await PuzzleService.publish(id, req.userId!);
    res.json({ message: 'Publicada correctamente', code: puzzle.code, status: 'published' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

puzzleRouter.patch('/:id/unpublish', requireRegistered, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const puzzle = await PuzzleService.unpublish(id, req.userId!);
    res.json({ message: 'Cambiada a borrador correctamente', code: puzzle.code, status: 'draft' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

const setStatusSchema = z.object({
  status: z.enum(['draft', 'published'])
});

puzzleRouter.patch('/:id/status', requireRegistered, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = setStatusSchema.parse(req.body);
    const puzzle = await PuzzleService.setStatus(id, req.userId!, status);
    res.json({ message: `Estado actualizado a ${status}`, code: puzzle.code, status: puzzle.status });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

puzzleRouter.get('/:code/leaderboard', async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const leaderboard = await PuzzleService.getLeaderboard(code);
    res.json(leaderboard);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Generic code lookup (MUST be last route in router)
puzzleRouter.get('/:code', optionalAuth, async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const puzzle = await PuzzleService.getByCode(code);
    if (!puzzle) {
      res.status(404).json({ message: 'Sopa de letras no encontrada' });
      return;
    }
    res.json(puzzle);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
