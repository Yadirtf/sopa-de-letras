/**
 * Reacciones que un jugador le manda a su rival durante la batalla.
 * Son animaciones 3D en la app (assets/battle/reactions/<id>.webp); aqui
 * solo viven los ids validos, el texto que acompaña a cada una y su grupo:
 * "face" son las caras del soldado y "action" los objetos de guerra.
 */
export const BATTLE_REACTIONS = [
  { id: "laugh", label: "¡Jajaja!", kind: "face" },
  { id: "sly", label: "Je, je, je", kind: "face" },
  { id: "angry", label: "¡Grrr!", kind: "face" },
  { id: "sad", label: "Ay, no…", kind: "face" },
  { id: "shocked", label: "¡¿Qué?!", kind: "face" },
  { id: "cool", label: "Pan comido", kind: "face" },
  { id: "boom", label: "¡Boom!", kind: "action" },
  { id: "bullseye", label: "¡En el blanco!", kind: "action" },
  { id: "incoming", label: "¡Ahí va!", kind: "action" },
  { id: "blocked", label: "¡No me das!", kind: "action" },
  { id: "alert", label: "¡Alerta!", kind: "action" },
  { id: "winning", label: "¡Voy ganando!", kind: "action" },
  { id: "well_played", label: "¡Bien jugado!", kind: "action" },
  { id: "surrender", label: "¡Me rindo!", kind: "action" },
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
  laugh: "sly",
  sly: "angry",
  angry: "laugh",
  sad: "cool",
  shocked: "laugh",
  cool: "shocked",
};
