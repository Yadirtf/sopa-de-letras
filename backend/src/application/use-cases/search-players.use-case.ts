import { IFriendshipRepository } from "../../domain/repositories/friendship.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { PlayerSearchResultDto } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

const MIN_TERM_LENGTH = 2;
const MAX_RESULTS = 20;

/**
 * Buscador de jugadores (US-22 / RF-25).
 * Cada resultado trae la relacion con quien busca para que el boton
 * correcto ("Agregar", "Pendiente", "Aceptar", "Amigos") aparezca sin
 * peticiones extra. Solo expone nombre y avatar: nunca email ni edad.
 */
export class SearchPlayersUseCase {
  constructor(private readonly friendships: IFriendshipRepository) {}

  async execute(userId: string, rawTerm: string): Promise<Result<PlayerSearchResultDto[], DomainError>> {
    try {
      const term = (rawTerm ?? "").trim();
      if (term.length < MIN_TERM_LENGTH) return ok([]);

      const players = await this.friendships.searchPlayers(term, userId, MAX_RESULTS);
      if (players.length === 0) return ok([]);

      const relations = await this.friendships.getRelations(userId, players.map((p) => p.id));
      return ok(players.map((p) => ({ ...p, relation: relations.get(p.id) ?? "NONE" })));
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
