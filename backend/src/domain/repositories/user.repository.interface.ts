import { User } from "../entities/user.entity";
import { Email } from "../value-objects/email.vo";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  createPasswordReset(userId: string, token: string, otpCode: string, expiresAt: Date): Promise<void>;
  findPasswordResetByOtp(email: Email, otpCode: string): Promise<{ userId: string; expiresAt: Date } | null>;
  invalidatePasswordResets(userId: string): Promise<void>;
}
