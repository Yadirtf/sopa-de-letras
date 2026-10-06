export interface RegisterUserDto {
  name: string;
  age: number;
  email: string;
  pin: string;
  avatarUrl?: string;
}

export interface LoginDto {
  email: string;
  pin: string;
}

export interface GuestLoginDto {
  name?: string;
  avatarUrl?: string;
}

export interface ForgotPinDto {
  email: string;
}

export interface ResetPinDto {
  email: string;
  otpCode: string;
  newPin: string;
}

export interface UpdatePinDto {
  userId: string;
  currentPin: string;
  newPin: string;
}

export interface UpdateProfileDto {
  userId: string;
  name?: string;
  avatarUrl?: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    name: string;
    age: number;
    email: string;
    avatarUrl: string | null;
    isGuest: boolean;
    isOnline: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}
