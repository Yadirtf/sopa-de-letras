import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.controller';
import { puzzleRouter } from './modules/puzzles/puzzle.controller';
import { roomRouter } from './modules/rooms/room.controller';
import { gameRouter } from './modules/game/game.controller';

const app: Express = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/puzzles', puzzleRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/game', gameRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    errors: err.errors || undefined
  });
});

export { app };
