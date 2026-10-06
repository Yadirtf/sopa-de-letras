import { PrismaClient } from "@prisma/client";
import { User } from "../../../domain/entities/user.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { Username } from "../../../domain/value-objects/username.vo";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email: email.value } });
    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name.value,
        age: user.age,
        email: user.email.value,
        pinHash: user.pinHash,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        isGuest: user.isGuest,
      },
    });
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name.value,
        email: user.email.value,
        pinHash: user.pinHash,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        isGuest: user.isGuest,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async createPasswordReset(userId: string, token: string, otpCode: string, expiresAt: Date): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: { userId, token, otpCode, expiresAt },
    });
  }

  async findPasswordResetByOtp(email: Email, otpCode: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const reset = await this.prisma.passwordResetToken.findFirst({
      where: {
        otpCode,
        usedAt: null,
        user: { email: email.value },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!reset) return null;
    return { userId: reset.userId, expiresAt: reset.expiresAt };
  }

  async invalidatePasswordResets(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  private mapToDomain(raw: any): User {
    return new User({
      id: raw.id,
      name: Username.create(raw.name),
      age: raw.age,
      email: Email.create(raw.email),
      pinHash: raw.pinHash,
      avatarUrl: raw.avatarUrl,
      isOnline: raw.isOnline,
      isGuest: raw.isGuest,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
