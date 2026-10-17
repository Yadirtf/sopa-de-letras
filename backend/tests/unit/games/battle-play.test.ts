import { describe, it, expect } from "vitest";
import { BattleLobbyService } from "../../../src/games/battle/application/battle-lobby.service";
import { BattlePlayService } from "../../../src/games/battle/application/battle-play.service";
import { BattleLock } from "../../../src/games/battle/application/battle-lock";
import { viewFor } from "../../../src/games/battle/application/battle-views";
import { InMemoryBattleMatchStore } from "../../../src/games/battle/infrastructure/redis-battle-match.store";
import { BattleMatch } from "../../../src/games/battle/domain/battle-match.types";
import { unitCells } from "../../../src/games/battle/domain/battle-board";
import { skipTurn } from "../../../src/games/battle/domain/battle-turns";

function setup() {
  const store = new InMemoryBattleMatchStore();
  const lock = new BattleLock();
  const tasks: Array<{ ms: number; task: () => Promise<void> }> = [];
  const published: BattleMatch[] = [];
  const recorded: BattleMatch[] = [];
  const play = new BattlePlayService(
    store,
    { publish: (m) => published.push(m) },
    { after: (ms, task) => tasks.push({ ms, task }) },
    { record: async (m) => void recorded.push(m) },
    lock
  );
  return { store, lobby: new BattleLobbyService(store, lock), play, tasks, published, recorded };
}

const ana = { id: "ana", name: "Ana" };
const beto = { id: "beto", name: "Beto" };
const smallArmy = { cols: 8, rows: 8, terrain: "SKY", army: { paratrooper: 1, balloon: 1 } };

describe("Batalla entre dos amigos", () => {
  it("crear, entrar, colocar y empezar con sorteo", async () => {
    const { lobby, play, store } = setup();
    const created = await lobby.create(ana, smallArmy);
    expect(created.status).toBe("WAITING");
    const joined = await lobby.join(created.code, beto);
    expect(joined.status).toBe("PLACING");

    for (const user of [ana, beto]) await play.place(created.code, user.id, await play.randomLayout(created.code, user.id));
    const match = (await store.get(created.code))!;
    expect(match.status).toBe("PLAYING");
    expect([ana.id, beto.id]).toContain(match.turnUserId);
  });

  it("acertar repite turno, fallar lo pasa y destruir todo gana", async () => {
    const { lobby, play, store, recorded } = setup();
    const { code } = await lobby.create(ana, smallArmy);
    await lobby.join(code, beto);
    for (const user of [ana, beto]) await play.place(code, user.id, await play.randomLayout(code, user.id));

    const match = (await store.get(code))!;
    const shooter = match.turnUserId!;
    const target = match.players.find((p) => p.userId !== shooter)!;
    const enemyCells = target.units.flatMap((u) => unitCells(u));
    const water = [...Array(64).keys()].map((i) => [i % 8, Math.floor(i / 8)]).find(
      ([c, r]) => !enemyCells.some(([ec, er]) => ec === c && er === r)
    )!;

    const hit = await play.shoot(code, shooter, "BULLET", enemyCells[0][0], enemyCells[0][1]);
    expect(hit.keepsTurn).toBe(true);
    await expect(play.shoot(code, shooter, "BULLET", enemyCells[0][0], enemyCells[0][1])).rejects.toThrow(/Ya disparaste/);

    const miss = await play.shoot(code, shooter, "BULLET", water[0], water[1]);
    expect(miss.keepsTurn).toBe(false);
    expect((await store.get(code))!.turnUserId).toBe(target.userId);
    await expect(play.shoot(code, shooter, "BULLET", 0, 0)).rejects.toThrow(/turno de tu rival/);

    // Le devolvemos el turno a mano y termina la batalla.
    const state = (await store.get(code))!;
    skipTurn(state, state.turnSeq, Date.now());
    await store.save(state);
    for (const [c, r] of enemyCells.slice(1)) await play.shoot(code, shooter, "BULLET", c, r);

    const end = (await store.get(code))!;
    expect(end.status).toBe("FINISHED");
    expect(end.winnerUserId).toBe(shooter);
    expect(recorded).toHaveLength(1);
    expect(viewFor(end, target.userId).enemyBoard.revealed).toHaveLength(2);
  });

  it("la vista nunca muestra donde estan las figuras del rival", async () => {
    const { lobby, play, store } = setup();
    const { code } = await lobby.create(ana, smallArmy);
    await lobby.join(code, beto);
    for (const user of [ana, beto]) await play.place(code, user.id, await play.randomLayout(code, user.id));
    const view = viewFor((await store.get(code))!, ana.id);
    expect(view.myBoard.units).toHaveLength(2);
    expect(view.enemyBoard.revealed).toHaveLength(0);
    expect(JSON.stringify(view.enemyBoard)).not.toContain("hitCells");
  });

  it("rendirse da la victoria al otro", async () => {
    const { lobby, play, store } = setup();
    const { code } = await lobby.create(ana, smallArmy);
    await lobby.join(code, beto);
    await play.leave(code, ana.id);
    const match = (await store.get(code))!;
    expect(match).toMatchObject({ status: "FINISHED", winnerUserId: beto.id, endReason: "SURRENDER" });
  });

  it("un ejercito que no cabe se rechaza al crear la sala", async () => {
    const { lobby } = setup();
    await expect(lobby.create(ana, { cols: 6, rows: 6, terrain: "SEA", army: { carrier: 3 } })).rejects.toThrow(/no cabe/);
  });
});

describe("Batalla contra la Abejita", () => {
  it("la Abejita coloca sola, dispara en su turno y la batalla termina", async () => {
    const { lobby, play, store, tasks } = setup();
    const { code } = await lobby.create(ana, { ...smallArmy, opponent: "BOT" });
    await play.place(code, ana.id, await play.randomLayout(code, ana.id));

    // Ana dispara siempre al agua o pierde turnos; la Abejita termina ganando.
    for (let guard = 0; guard < 400 && (await store.get(code))!.status === "PLAYING"; guard++) {
      const match = (await store.get(code))!;
      if (match.turnUserId === ana.id) {
        const state = match;
        skipTurn(state, state.turnSeq, Date.now());
        state.players.find((p) => p.userId === ana.id)!.missedTurns = 0;
        await store.save(state);
        await play.resume(code);
      }
      // Solo la "pensada" de la Abejita (1,2 s); los relojes de 30 s no llegan a sonar.
      const pending = tasks.splice(0).filter((t) => t.ms < 5000);
      for (const { task } of pending) await task();
    }
    const end = (await store.get(code))!;
    expect(end.status).toBe("FINISHED");
    expect(end.winnerUserId).toBe("bot:abejita");
  });
});
