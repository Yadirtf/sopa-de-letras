import { IFriendRequestRepository, FriendRequestView } from "../../domain/repositories/friend-request.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { FriendRequestDto, FriendRequestsDto } from "../dtos/social.dtos";
import { Result, ok, fail } from "../common/result";

/** Bandeja de solicitudes entrantes y salientes pendientes (US-22). */
export class GetFriendRequestsUseCase {
  constructor(private readonly requests: IFriendRequestRepository) {}

  async execute(userId: string): Promise<Result<FriendRequestsDto, DomainError>> {
    try {
      const [incoming, outgoing] = await Promise.all([
        this.requests.listIncoming(userId),
        this.requests.listOutgoing(userId),
      ]);
      return ok({ incoming: incoming.map(toDto), outgoing: outgoing.map(toDto) });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}

function toDto(view: FriendRequestView): FriendRequestDto {
  return { id: view.id, createdAt: view.createdAt.toISOString(), player: view.player };
}
