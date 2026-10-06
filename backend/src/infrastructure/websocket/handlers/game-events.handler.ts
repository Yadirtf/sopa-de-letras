import { Server, Socket } from "socket.io";
import { RoomManagerService } from "../../../application/services/room-manager.service";
import { FinishGameUseCase } from "../../../application/use-cases/finish-game.use-case";
import { RoomRematchService } from "../../../application/services/room-rematch.service";

export class GameEventsHandler {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly finishGame: FinishGameUseCase,
    private readonly rematchService: RoomRematchService
  ) {}

  public register(io: Server, socket: Socket): void {
    socket.on("game:start", async (payload: { roomCode: string; userId: string }) => {
      try {
        const { roomCode, userId } = payload;
        const upperCode = roomCode.toUpperCase();
        const state = await this.roomManager.getRoom(upperCode);
        if (!state || state.hostUserId !== userId) return;

        state.status = 'COUNTDOWN';
        const now = Date.now();
        const countdownSeconds = 3;
        const startTime = now + countdownSeconds * 1000;
        state.countdownStartTime = startTime;

        io.to(`room:${upperCode}`).emit("game:countdown", {
          countdownSeconds,
          serverTime: now,
          startTime,
        });

        setTimeout(async () => {
          const currentState = await this.roomManager.getRoom(upperCode);
          if (!currentState || currentState.status !== 'COUNTDOWN') return;

          currentState.status = 'IN_PROGRESS';
          currentState.startedAt = Date.now();
          currentState.endsAt = currentState.timeLimitSeconds && currentState.timeLimitSeconds > 0
            ? currentState.startedAt + currentState.timeLimitSeconds * 1000
            : null;

          io.to(`room:${upperCode}`).emit("game:started", {
            startedAt: currentState.startedAt,
            endsAt: currentState.endsAt,
            grid: currentState.grid,
            words: currentState.words,
          });

          // Timer for game duration (solo si tiene limite de tiempo)
          if (currentState.timeLimitSeconds && currentState.timeLimitSeconds > 0) {
            setTimeout(async () => {
              const endingState = await this.roomManager.getRoom(upperCode);
              if (endingState && endingState.status === 'IN_PROGRESS') {
                const result = await this.finishGame.execute(upperCode);
                io.to(`room:${upperCode}`).emit("game:ended", result);
              }
            }, currentState.timeLimitSeconds * 1000);
          }
        }, countdownSeconds * 1000);
      } catch (err: any) {
        socket.emit("room:error", { message: err.message });
      }
    });

    socket.on("word:submit", async (payload: any, ack) => {
      try {
        const { roomCode, userId, word, coordinates } = payload;
        const upperCode = roomCode.toUpperCase();
        const { wordFound, allCompleted, updatedState } = await this.roomManager.submitWord(
          upperCode,
          userId,
          word,
          coordinates
        );

        io.to(`room:${upperCode}`).emit("word:found", wordFound);

        const leaderboard = this.roomManager.getLeaderboard(updatedState);
        io.to(`room:${upperCode}`).emit("leaderboard:update", { leaderboard });

        if (typeof ack === "function") ack({ success: true, wordFound });

        if (allCompleted) {
          const endResult = await this.finishGame.execute(upperCode);
          io.to(`room:${upperCode}`).emit("game:ended", endResult);
        }
      } catch (err: any) {
        if (typeof ack === "function") ack({ success: false, error: err.message });
      }
    });

    socket.on("room:rematch_vote", async (payload: { roomCode: string; userId: string }) => {
      try {
        const { roomCode, userId } = payload;
        const upperCode = roomCode.toUpperCase();
        const voteResult = await this.rematchService.vote(upperCode, userId);
        io.to(`room:${upperCode}`).emit("room:rematch_update", voteResult);

        if (voteResult.hasQuorum) {
          const newState = await this.rematchService.resetForRematch(upperCode);
          io.to(`room:${upperCode}`).emit("room:rematch_started", {
            roomCode: upperCode,
            grid: newState.grid,
            words: newState.words,
            players: newState.players,
          });
        }
      } catch (err: any) {
        socket.emit("room:error", { message: err.message });
      }
    });
  }
}
