import { Pin } from "../../domain/value-objects/pin.vo";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IHashService } from "../../domain/services/hash.service.interface";
import { IMailService } from "../../domain/services/mail.service.interface";
import {
  GuestNotAllowedError,
  SamePinError,
  UserNotFoundError,
  WrongCurrentPinError,
  DomainError,
} from "../../domain/errors/auth.errors";
import { UpdatePinDto } from "../dtos/auth.dtos";
import { Result, ok, fail } from "../common/result";

export class UpdatePinUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hashService: IHashService,
    private readonly mailService: IMailService
  ) {}

  async execute(dto: UpdatePinDto): Promise<Result<{ message: string }, DomainError>> {
    try {
      const user = await this.userRepo.findById(dto.userId);
      if (!user) {
        return fail(new UserNotFoundError());
      }

      // El invitado tiene un PIN aleatorio que nunca vio: no hay nada que cambiar.
      if (user.isGuest) {
        return fail(new GuestNotAllowedError("cambiar el PIN"));
      }

      const isCurrentPinValid = await this.hashService.compare(dto.currentPin, user.pinHash);
      if (!isCurrentPinValid) {
        return fail(new WrongCurrentPinError());
      }

      const newPin = Pin.create(dto.newPin);
      if (newPin.value === dto.currentPin.trim()) {
        return fail(new SamePinError());
      }
      const newPinHash = await this.hashService.hash(newPin.value);

      user.updatePinHash(newPinHash);
      await this.userRepo.update(user);

      this.mailService.sendPinChangedAlert(user.email, user.name.value).catch(console.error);

      return ok({ message: "PIN actualizado correctamente" });
    } catch (error) {
      return fail(error as DomainError);
    }
  }
}
