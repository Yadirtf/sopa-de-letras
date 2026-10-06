import { Username } from "../../domain/value-objects/username.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { UserNotFoundError, DomainError } from "../../domain/errors/auth.errors";
import { UpdateProfileDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";
import { toUserProfile, UserProfileResponse } from "../common/user-profile.mapper";

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: UpdateProfileDto): Promise<Result<UserProfileResponse, DomainError>> {
    try {
      const user = await this.userRepo.findById(dto.userId);
      if (!user) {
        return fail(new UserNotFoundError());
      }

      const updatedName = dto.name ? Username.create(dto.name) : user.name;
      const updatedAvatar = dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl;

      user.updateProfile(updatedName, updatedAvatar);
      await this.userRepo.update(user);

      // Perfil completo: la app lo guarda tal cual como su usuario en cache.
      return ok(toUserProfile(user));
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
