import { Username } from "../../domain/value-objects/username.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { UserNotFoundError, DomainError } from "../../domain/errors/auth.errors";
import { UpdateProfileDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: UpdateProfileDto): Promise<Result<{ id: string; name: string; avatarUrl: string | null }, DomainError>> {
    try {
      const user = await this.userRepo.findById(dto.userId);
      if (!user) {
        return fail(new UserNotFoundError());
      }

      const updatedName = dto.name ? Username.create(dto.name) : user.name;
      const updatedAvatar = dto.avatarUrl !== undefined ? dto.avatarUrl : user.avatarUrl;

      user.updateProfile(updatedName, updatedAvatar);
      await this.userRepo.update(user);

      return ok({
        id: user.id,
        name: user.name.value,
        avatarUrl: user.avatarUrl,
      });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
