import { User } from "../../domain/entities/user.entity";

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

/**
 * Forma unica del perfil que viaja al cliente. GET y PATCH /users/me devuelven
 * lo mismo, asi la app puede reemplazar su copia local sin perder campos.
 */
export function toUserProfile(user: User): UserProfileResponse {
  return {
    id: user.id,
    name: user.name.value,
    age: user.age,
    email: user.email.value,
    avatarUrl: user.avatarUrl,
    isGuest: user.isGuest,
    isOnline: user.isOnline,
    createdAt: user.createdAt,
  };
}
