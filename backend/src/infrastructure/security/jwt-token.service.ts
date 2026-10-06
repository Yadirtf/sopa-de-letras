import jwt from "jsonwebtoken";
import {
  ITokenService,
  TokenPayload,
  AuthTokens,
} from "../../domain/services/token.service.interface";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly accessExpiry: string = "24h",
    private readonly refreshExpiry: string = "30d"
  ) {}

  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(
      { sub: payload.userId, email: payload.email, isGuest: payload.isGuest },
      this.secret,
      { expiresIn: this.accessExpiry as any }
    );

    const refreshToken = jwt.sign(
      { sub: payload.userId, isRefresh: true },
      this.secret,
      { expiresIn: this.refreshExpiry as any }
    );

    // 24 horas en segundos (86400s)
    const expiresIn = 24 * 60 * 60;

    return { accessToken, refreshToken, expiresIn };
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      if (decoded.isRefresh) return null;
      return {
        userId: decoded.sub,
        email: decoded.email,
        isGuest: decoded.isGuest ?? false,
      };
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      if (!decoded.isRefresh) return null;
      return {
        userId: decoded.sub,
        email: decoded.email ?? "",
        isGuest: false,
      };
    } catch {
      return null;
    }
  }
}
