import { FriendPair } from "../value-objects/friend-pair.vo";

/** Perfil publico minimo que se comparte entre jugadores (nunca email ni edad). */
export interface PublicPlayerProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface FriendRecord extends PublicPlayerProfile {
  friendsSince: Date;
}

/** Relacion del usuario actual con otro jugador, vista desde el usuario actual. */
export type RelationStatus = "NONE" | "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED";

export interface IFriendshipRepository {
  searchPlayers(term: string, excludeUserId: string, limit: number): Promise<PublicPlayerProfile[]>;
  findPublicProfile(userId: string): Promise<(PublicPlayerProfile & { isGuest: boolean }) | null>;
  areFriends(pair: FriendPair): Promise<boolean>;
  deleteFriendship(pair: FriendPair): Promise<boolean>;
  listFriends(userId: string): Promise<FriendRecord[]>;
  listFriendIds(userId: string): Promise<string[]>;
  getRelations(userId: string, otherIds: string[]): Promise<Map<string, RelationStatus>>;
}
