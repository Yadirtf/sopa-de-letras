import { FriendRequest } from "../entities/friend-request.entity";
import { PublicPlayerProfile } from "./friendship.repository.interface";

export interface FriendRequestView {
  id: string;
  createdAt: Date;
  player: PublicPlayerProfile;
}

export interface IFriendRequestRepository {
  findById(id: string): Promise<FriendRequest | null>;
  findBetween(senderId: string, recipientId: string): Promise<FriendRequest | null>;
  save(request: FriendRequest): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAllBetween(userAId: string, userBId: string): Promise<void>;
  /** Marca la solicitud como ACCEPTED y crea la amistad en una sola transaccion. */
  acceptAndBefriend(request: FriendRequest): Promise<void>;
  listIncoming(userId: string): Promise<FriendRequestView[]>;
  listOutgoing(userId: string): Promise<FriendRequestView[]>;
}
