import { FastifyReply, FastifyRequest } from "fastify";
import { ListNotificationsUseCase } from "../../../application/use-cases/list-notifications.use-case";
import { MarkNotificationsReadUseCase } from "../../../application/use-cases/mark-notifications-read.use-case";
import { ManagePushDeviceUseCase } from "../../../application/use-cases/manage-push-device.use-case";
import { parseOrReply, sendResult } from "./result-reply.helper";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
  pushDeviceSchema,
  pushDeviceTokenSchema,
} from "../schemas/social.schemas";

/** Endpoints `/api/v1/notifications` (US-25). */
export class NotificationsController {
  constructor(
    private readonly listUseCase: ListNotificationsUseCase,
    private readonly markReadUseCase: MarkNotificationsReadUseCase,
    private readonly pushDevices: ManagePushDeviceUseCase
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

  registerDevice = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseOrReply(reply, pushDeviceSchema, req.body);
    if (!body) return;
    return sendResult(reply, await this.pushDevices.register(req.user!.userId, body.token, body.platform));
  };

  unregisterDevice = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseOrReply(reply, pushDeviceTokenSchema, req.body);
    if (!body) return;
    return sendResult(reply, await this.pushDevices.unregister(req.user!.userId, body.token));
  };
}
