import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { UserNotFoundError, DomainError } from "../../domain/errors/auth.errors";
import { Result, ok, fail } from "../common/result";
import { toUserProfile, UserProfileResponse } from "../common/user-profile.mapper";

export type { UserProfileResponse } from "../common/user-profile.mapper";

export class GetProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<Result<UserProfileResponse, DomainError>> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return fail(new UserNotFoundError());
      }
      return ok(toUserProfile(user));
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
