import { FastifyReply, FastifyRequest } from "fastify";
import { CreateRoomUseCase } from "../../../application/use-cases/create-room.use-case";
import { GetRoomByCodeUseCase } from "../../../application/use-cases/get-room-by-code.use-case";

export class RoomController {
  constructor(
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly getRoomByCodeUseCase: GetRoomByCodeUseCase
  ) {}

  async create(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        reply.status(401).send({ error: 'No autorizado' });
        return;
      }

      const body = req.body as any;
      if (!body.wordSearchId) {
        reply.status(400).send({ error: 'El ID de la sopa de letras es obligatorio' });
        return;
      }

      const result = await this.createRoomUseCase.execute(
        { id: user.id, name: user.name || 'Anfitrión', avatarUrl: user.avatarUrl },
        {
          wordSearchId: body.wordSearchId,
          maxPlayers: body.maxPlayers,
          timeLimitSeconds: body.timeLimitSeconds,
          isPrivate: body.isPrivate,
        }
      );

      reply.status(201).send({ status: 'success', data: result });
    } catch (err: any) {
      reply.status(400).send({ error: err.message || 'Error al crear la sala' });
    }
  }

  async getByCode(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { code } = req.params as { code: string };
      if (!code) {
        reply.status(400).send({ error: 'El código de sala es obligatorio' });
        return;
      }

      const room = await this.getRoomByCodeUseCase.execute(code);
      reply.status(200).send({ status: 'success', data: room });
    } catch (err: any) {
      reply.status(404).send({ error: err.message || 'Sala no encontrada' });
    }
  }
}
