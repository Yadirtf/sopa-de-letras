import { CannotFriendYourselfError } from "../errors/social.errors";

/**
 * Par canonico de amistad.
 *
 * Por que existe: la tabla `friendships` guarda UNA fila por amistad.
 * Si A agrega a B y B agrega a A, sin un orden canonico tendriamos
 * (A,B) y (B,A) como filas distintas. FriendPair ordena los ids
 * lexicograficamente para que la misma amistad tenga siempre la misma llave.
 */
export class FriendPair {
  private constructor(
    public readonly userAId: string,
    public readonly userBId: string
  ) {}

  public static of(oneUserId: string, otherUserId: string): FriendPair {
    if (!oneUserId || !otherUserId || oneUserId === otherUserId) {
      throw new CannotFriendYourselfError();
    }
    return oneUserId < otherUserId
      ? new FriendPair(oneUserId, otherUserId)
      : new FriendPair(otherUserId, oneUserId);
  }

  public includes(userId: string): boolean {
    return this.userAId === userId || this.userBId === userId;
  }

  public otherThan(userId: string): string {
    return this.userAId === userId ? this.userBId : this.userAId;
  }

  public get key(): string {
    return `${this.userAId}:${this.userBId}`;
  }
}
