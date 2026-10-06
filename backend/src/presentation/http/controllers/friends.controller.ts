import { FastifyReply, FastifyRequest } from "fastify";
import { SearchPlayersUseCase } from "../../../application/use-cases/search-players.use-case";
import { SendFriendRequestUseCase } from "../../../application/use-cases/send-friend-request.use-case";
import { RespondFriendRequestUseCase } from "../../../application/use-cases/respond-friend-request.use-case";
import { GetFriendsUseCase } from "../../../application/use-cases/get-friends.use-case";
import { GetFriendRequestsUseCase } from "../../../application/use-cases/get-friend-requests.use-case";
import { RemoveFriendUseCase } from "../../../application/use-cases/remove-friend.use-case";
import { InviteFriendToRoomUseCase } from "../../../application/use-cases/invite-friend-to-room.use-case";
import { parseOrReply, sendResult } from "./result-reply.helper";
import {
  requestIdParamSchema,
  respondFriendRequestSchema,
  roomInviteSchema,
  searchPlayersSchema,
  sendFriendRequestSchema,
  userIdParamSchema,
} from "../schemas/social.schemas";

export interface FriendsUseCases {
  search: SearchPlayersUseCase;
  sendRequest: SendFriendRequestUseCase;
  respondRequest: RespondFriendRequestUseCase;
  getFriends: GetFriendsUseCase;
  getRequests: GetFriendRequestsUseCase;
  removeFriend: RemoveFriendUseCase;
  inviteToRoom: InviteFriendToRoomUseCase;
}

/** Endpoints `/api/v1/friends` (US-22, US-23, US-24). */
export class FriendsController {
  constructor(private readonly useCases: FriendsUseCases) {}

  list = async (req: FastifyRequest, reply: FastifyReply) =>
    sendResult(reply, await this.useCases.getFriends.execute(req.user!.userId));

  search = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseOrReply(reply, searchPlayersSchema, req.query);
    if (!query) return;
    return sendResult(reply, await this.useCases.search.execute(req.user!.userId, query.q));
  };

  requests = async (req: FastifyRequest, reply: FastifyReply) =>
    sendResult(reply, await this.useCases.getRequests.execute(req.user!.userId));

  sendRequest = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseOrReply(reply, sendFriendRequestSchema, req.body);
    if (!body) return;
    return sendResult(reply, await this.useCases.sendRequest.execute(req.user!.userId, body.userId), 201);
  };

  respondRequest = async (req: FastifyRequest, reply: FastifyReply) => {
    const params = parseOrReply(reply, requestIdParamSchema, req.params);
    const body = params && parseOrReply(reply, respondFriendRequestSchema, req.body);
    if (!params || !body) return;
    const result = await this.useCases.respondRequest.execute(req.user!.userId, params.requestId, body.action);
    return sendResult(reply, result);
  };

  remove = async (req: FastifyRequest, reply: FastifyReply) => {
    const params = parseOrReply(reply, userIdParamSchema, req.params);
    if (!params) return;
    return sendResult(reply, await this.useCases.removeFriend.execute(req.user!.userId, params.userId));
  };

  invite = async (req: FastifyRequest, reply: FastifyReply) => {
    const params = parseOrReply(reply, userIdParamSchema, req.params);
    const body = params && parseOrReply(reply, roomInviteSchema, req.body);
    if (!params || !body) return;
    const result = await this.useCases.inviteToRoom.execute(req.user!.userId, params.userId, body.roomCode);
    return sendResult(reply, result, 201);
  };
}
