export interface TokenPayload {
  userId: string;
  email: string;
  isGuest: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Contrato para generacion y verificacion de tokens JWT.
 */
export interface ITokenService {
  generateTokens(payload: TokenPayload): AuthTokens;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
}
