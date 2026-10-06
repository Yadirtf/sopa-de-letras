import { FastifyReply, FastifyRequest } from "fastify";
import { ListNotificationsUseCase } from "../../../application/use-cases/list-notifications.use-case";
import { MarkNotificationsReadUseCase } from "../../../application/use-cases/mark-notifications-read.use-case";
import { parseOrReply, sendResult } from "./result-reply.helper";
import { listNotificationsSchema, notificationIdParamSchema } from "../schemas/social.schemas";

/** Endpoints `/api/v1/notifications` (US-25). */
export class NotificationsController {
  constructor(
    private readonly listUseCase: ListNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationsReadUseCase
  ) {}

  list = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseOrReply(reply, listNotificationsSchema, req.query);
    if (!query) return;
    return sendResult(reply, await this.listUseCase.execute(req.user!.userId, query.limit, query.cursor));
  };

  markRead = async (req: FastifyRequest, reply: FastifyReply) => {
    const params = parseOrReply(reply, notificationIdParamSchema, req.params);
    if (!params) return;
    return sendResult(reply, await this.markReadUseCase.markOne(req.user!.userId, params.id));
  };

  markAllRead = async (req: FastifyRequest, reply: FastifyReply) =>
    sendResult(reply, await this.markReadUseCase.markAll(req.user!.userId));
}
