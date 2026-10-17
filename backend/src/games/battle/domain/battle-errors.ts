/** Error de la batalla con codigo estable (para la app) y texto amable (para el jugador). */
export class BattleError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "BattleError";
  }
}

export const battleErrors = {
  notFound: () => new BattleError("SALA_NO_ENCONTRADA", "Esa sala de batalla no existe o ya cerró."),
  full: () => new BattleError("SALA_LLENA", "Esta batalla ya tiene sus dos jugadores."),
  notPlayer: () => new BattleError("NO_ERES_JUGADOR", "No estás en esta batalla."),
  wrongPhase: () => new BattleError("FASE_INCORRECTA", "Eso no se puede hacer en este momento de la batalla."),
  notYourTurn: () => new BattleError("NO_ES_TU_TURNO", "Espera, todavía es el turno de tu rival."),
  outOfArena: () => new BattleError("FUERA_DE_LA_ARENA", "Esa casilla está fuera de la arena."),
  alreadyShot: () => new BattleError("CASILLA_REPETIDA", "Ya disparaste a esa casilla. Elige otra."),
  noAmmo: () => new BattleError("SIN_MUNICION", "Ya no te quedan usos de esa arma."),
  badPlacement: (why: string) => new BattleError("POSICION_INVALIDA", why),
  armyDoesNotFit: () =>
    new BattleError("EJERCITO_NO_CABE", "Tu ejército no cabe en esa arena. Agranda la arena o quita figuras."),
  emptyArmy: () => new BattleError("EJERCITO_VACIO", "Elige al menos una figura para tu ejército."),
};
