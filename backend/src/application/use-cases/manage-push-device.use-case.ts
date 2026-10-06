import { IPushDeviceRepository } from "../../domain/repositories/push-device.repository.interface";
import { DomainError } from "../../domain/errors/auth.errors";
import { Result, ok, fail } from "../common/result";

/** Alta y baja del telefono para avisos push (la app lo llama al entrar y al salir). */
export class ManagePushDeviceUseCase {
  constructor(private readonly devices: IPushDeviceRepository) {}

  async register(userId: string, token: string, platform: string): Promise<Result<{ registered: true }, DomainError>> {
    try {
      await this.devices.upsert(userId, token, platform);
      return ok({ registered: true });
    } catch (error) {
      return fail(error as DomainError);
    }
  }

  async unregister(userId: string, token: string): Promise<Result<{ removed: true }, DomainError>> {
    try {
      await this.devices.removeForUser(userId, token);
      return ok({ removed: true });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
