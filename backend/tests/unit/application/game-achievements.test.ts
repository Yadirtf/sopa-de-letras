import { describe, it, expect, vi } from "vitest";
import { FinishGameUseCase } from "../../../src/application/use-cases/finish-game.use-case";

const player = (userId: string, score: number) => ({
  userId,
  username: userId,
  isHost: false,
  isReady: true,
  score,
  wordsFound: ["PERRO"],
  colorHex: "#7C3AED",
});

function setup(players: ReturnType<typeof player>[]) {
  const state = { id: "r1", code: "HIVE42", wordSearchTitle: "Animales", players, words: ["PERRO"], startedAt: Date.now() - 5000 };
  const cache = { getRoom: vi.fn().mockResolvedValue(state), saveRoom: vi.fn() } as any;
  const repo = { updateStatus: vi.fn(), saveMatchResults: vi.fn() } as any;
  const notifier = { notify: vi.fn().mockResolvedValue(null) } as any;
  return { useCase: new FinishGameUseCase(repo, cache, notifier), notifier };
}

describe("Logros del podio en la campana (US-25)", () => {
  it("notifica GAME_END solo a los 3 primeros", async () => {
    const { useCase, notifier } = setup([player("a", 40), player("b", 30), player("c", 20), player("d", 10)]);
    await useCase.execute("HIVE42");

    expect(notifier.notify).toHaveBeenCalledTimes(3);
    expect(notifier.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: "a",
        type: "GAME_END",
        payload: expect.objectContaining({ rank: 1, wordSearchTitle: "Animales", totalPlayers: 4 }),
      })
    );
  });

  it("no celebra una partida en solitario", async () => {
    const { useCase, notifier } = setup([player("a", 40)]);
    await useCase.execute("HIVE42");
    expect(notifier.notify).not.toHaveBeenCalled();
  });
});
