/**
 * Reacciones que un jugador le manda a su rival durante la batalla.
 * Son animaciones 3D en la app (assets/battle/reactions/<id>.webp); aqui
 * solo viven los ids validos y el texto que acompaña a cada una.
 */
export const BATTLE_REACTIONS = [
  { id: "boom", label: "¡Boom!" },
  { id: "bullseye", label: "¡En el blanco!" },
  { id: "incoming", label: "¡Ahí va!" },
  { id: "blocked", label: "¡No me das!" },
  { id: "alert", label: "¡Alerta!" },
  { id: "winning", label: "¡Voy ganando!" },
  { id: "well_played", label: "¡Bien jugado!" },
  { id: "surrender", label: "¡Me rindo!" },
] as const;

export type BattleReactionId = (typeof BATTLE_REACTIONS)[number]["id"];

export function isBattleReaction(id: unknown): id is BattleReactionId {
  return BATTLE_REACTIONS.some((r) => r.id === id);
}

/** Lo que la Abejita contesta a cada reaccion (a veces no contesta). */
export const BOT_REPLIES: Record<BattleReactionId, BattleReactionId> = {
  boom: "blocked",
  bullseye: "alert",
  incoming: "blocked",
  blocked: "incoming",
  alert: "boom",
  winning: "bullseye",
  well_played: "well_played",
  surrender: "winning",
};
