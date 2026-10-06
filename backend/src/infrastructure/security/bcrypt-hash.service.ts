import bcrypt from "bcrypt";
import { IHashService } from "../../domain/services/hash.service.interface";

/**
 * Servicio de hash usando bcrypt con factor de costo 12 (RNF-10).
 */
export class BcryptHashService implements IHashService {
  private static readonly SALT_ROUNDS = 12;

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, BcryptHashService.SALT_ROUNDS);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
