import { describe, it, expect } from "vitest";
import { BattleLobbyService } from "../../../src/games/battle/application/battle-lobby.service";
import { BattleLock } from "../../../src/games/battle/application/battle-lock";
import { BattleReactionEvent, BattleReactionsService, REACTION_COOLDOWN_MS } from "../../../src/games/battle/application/battle-reactions.service";
import { InMemoryBattleMatchStore } from "../../../src/games/battle/infrastructure/redis-battle-match.store";

const smallArmy = { cols: 8, rows: 8, terrain: "SKY", army: { paratrooper: 1, balloon: 1 } };

function setup(chance = 0) {
  const store = new InMemoryBattleMatchStore();
  const lobby = new BattleLobbyService(store, new BattleLock());
  const delivered: BattleReactionEvent[] = [];
  const tasks: Array<() => Promise<void>> = [];
  let now = 10_000;
  const service = new BattleReactionsService(
    store,
    { deliver: (e) => delivered.push(e) },
    { after: (_ms, task) => tasks.push(task) },
    () => now,
    () => chance
  );
  return { lobby, service, delivered, tasks, advance: (ms: number) => (now += ms) };
}

describe("Reacciones en la batalla", () => {
  it("la reaccion le llega solo al rival", async () => {
    const { lobby, service, delivered } = setup();
    const match = await lobby.create({ id: "ana", name: "Ana" }, smallArmy);
    await lobby.join(match.code, { id: "beto", name: "Beto" });

    await service.send(match.code, "ana", "boom");
    expect(delivered).toEqual([{ code: match.code, fromUserId: "ana", toUserId: "beto", reaction: "boom" }]);
  });

  it("rechaza ids inventados, a quien no juega y la sala sin rival", async () => {
    const { lobby, service } = setup();
    const match = await lobby.create({ id: "ana", name: "Ana" }, smallArmy);
    await expect(service.send(match.code, "ana", "boom")).rejects.toMatchObject({ code: "FASE_INCORRECTA" });
    await lobby.join(match.code, { id: "beto", name: "Beto" });
    await expect(service.send(match.code, "ana", "😀")).rejects.toMatchObject({ code: "REACCION_INVALIDA" });
    await expect(service.send(match.code, "zoe", "boom")).rejects.toMatchObject({ code: "NO_ERES_JUGADOR" });
  });

  it("no deja mandar reacciones en rafaga", async () => {
    const { lobby, service, delivered, advance } = setup();
    const match = await lobby.create({ id: "ana", name: "Ana" }, smallArmy);
    await lobby.join(match.code, { id: "beto", name: "Beto" });
    await service.send(match.code, "ana", "boom");
    await expect(service.send(match.code, "ana", "alert")).rejects.toMatchObject({ code: "REACCION_MUY_SEGUIDA" });
    advance(REACTION_COOLDOWN_MS);
    await service.send(match.code, "ana", "alert");
    expect(delivered).toHaveLength(2);
  });

  it("la Abejita contesta despues de pensarlo", async () => {
    const { lobby, service, delivered, tasks } = setup(0.1);
    const match = await lobby.create({ id: "ana", name: "Ana" }, { ...smallArmy, opponent: "BOT" });
    await service.send(match.code, "ana", "surrender");
    expect(delivered).toHaveLength(0);
    await tasks[0]();
    expect(delivered[0]).toMatchObject({ toUserId: "ana", reaction: "winning" });
  });
});
