import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { UserNotFoundError, DomainError } from "../../domain/errors/auth.errors";
import { Result, ok, fail } from "../common/result";

export interface UserProfileResponse {
  id: string;
  name: string;
  age: number;
  email: string;
  avatarUrl: string | null;
  isGuest: boolean;
  isOnline: boolean;
  createdAt: Date;
}

export class GetProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<Result<UserProfileResponse, DomainError>> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return fail(new UserNotFoundError());
      }

      return ok({
        id: user.id,
        name: user.name.value,
        age: user.age,
        email: user.email.value,
        avatarUrl: user.avatarUrl,
        isGuest: user.isGuest,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
