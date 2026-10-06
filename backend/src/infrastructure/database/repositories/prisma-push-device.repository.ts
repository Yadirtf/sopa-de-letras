import { PrismaClient } from "@prisma/client";
import { IPushDeviceRepository } from "../../../domain/repositories/push-device.repository.interface";

export class PrismaPushDeviceRepository implements IPushDeviceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsert(userId: string, token: string, platform: string): Promise<void> {
    await this.prisma.pushDevice.upsert({
      where: { token },
      create: { token, userId, platform },
      update: { userId, platform },
    });
  }

  async removeForUser(userId: string, token: string): Promise<void> {
    await this.prisma.pushDevice.deleteMany({ where: { token, userId } });
  }

  async removeTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;
    await this.prisma.pushDevice.deleteMany({ where: { token: { in: tokens } } });
  }

  async listTokens(userId: string): Promise<string[]> {
    const rows = await this.prisma.pushDevice.findMany({ where: { userId }, select: { token: true } });
    return rows.map((r) => r.token);
  }
}
