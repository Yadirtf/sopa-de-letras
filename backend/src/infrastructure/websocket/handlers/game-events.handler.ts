import { Server, Socket } from "socket.io";
import { RoomManagerService } from "../../../application/services/room-manager.service";
import { FinishGameUseCase } from "../../../application/use-cases/finish-game.use-case";
import { RoomRematchService } from "../../../application/services/room-rematch.service";
import { RoomLifecycleService } from "../../../application/services/room-lifecycle.service";
import { emitRoomError } from "./room-error.emitter";

export class GameEventsHandler {
  constructor(
    private readonly roomManager: RoomManagerService,
    private readonly finishGame: FinishGameUseCase,
    private readonly rematchService: RoomRematchService,
    private readonly roomLifecycle: RoomLifecycleService
  ) {}

  private async launchGame(io: Server, upperCode: string): Promise<void> {
    try {
      const state = await this.roomLifecycle.startPlaying(upperCode);
      if (!state) return;

      io.to(`room:${upperCode}`).emit("game:started", {
        startedAt: state.startedAt,
        endsAt: state.endsAt,
        grid: state.grid,
        words: state.words,
      });

      // Temporizador de la partida (solo si tiene limite de tiempo)
      if (state.timeLimitSeconds && state.timeLimitSeconds > 0) {
        const startedAt = state.startedAt;
        setTimeout(() => void this.finishIfRunning(io, upperCode, startedAt), state.timeLimitSeconds * 1000);
      }
    } catch {
      // La sala desaparecio durante la cuenta atras.
    }
  }

  /** startedAt evita que el reloj de una partida vieja corte una revancha. */
  private async finishIfRunning(io: Server, upperCode: string, startedAt?: number | null): Promise<void> {
    try {
      const endingState = await this.roomManager.getRoom(upperCode);
      if (endingState?.status === "IN_PROGRESS" && endingState.startedAt === startedAt) {
        const result = await this.finishGame.execute(upperCode);
        io.to(`room:${upperCode}`).emit("game:ended", result);
      }
    } catch {
      // La sala ya fue cerrada.
    }
  }

  public register(io: Server, socket: Socket): void {
    socket.on("game:start", async (payload: { roomCode: string; userId: string }) => {
      try {
        const upperCode = payload.roomCode.toUpperCase();
        const { state, countdownSeconds } = await this.roomLifecycle.beginCountdown(upperCode, payload.userId);

        io.to(`room:${upperCode}`).emit("game:countdown", {
          countdownSeconds,
          serverTime: Date.now(),
          startTime: state.countdownStartTime,
        });

        setTimeout(() => void this.launchGame(io, upperCode), countdownSeconds * 1000);
      } catch (err) {
        emitRoomError(socket, err);
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
      } catch (err) {
        emitRoomError(socket, err);
      }
    });
  }
}
