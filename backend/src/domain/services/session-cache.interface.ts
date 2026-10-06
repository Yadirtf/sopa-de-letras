/**
 * Contrato para gestion de cache distribuido de sesiones en Redis.
 */
export interface ISessionCacheService {
  setSession(userId: string, token: string, ttlSeconds: number): Promise<void>;
  getSession(userId: string): Promise<string | null>;
  deleteSession(userId: string): Promise<void>;
  incrementFailedAttempts(key: string, ttlSeconds: number): Promise<number>;
  resetFailedAttempts(key: string): Promise<void>;
  storeOtp(email: string, otpCode: string, ttlSeconds: number): Promise<void>;
  getOtp(email: string): Promise<string | null>;
  deleteOtp(email: string): Promise<void>;
}
