/** Telefonos donde un usuario quiere recibir avisos aunque la app este cerrada. */
export interface IPushDeviceRepository {
  /** Guarda o reasigna el token al usuario (un telefono = una cuenta activa). */
  upsert(userId: string, token: string, platform: string): Promise<void>;
  /** Borra el token solo si pertenece a ese usuario (cerrar sesion). */
  removeForUser(userId: string, token: string): Promise<void>;
  /** Limpieza de tokens que FCM ya no reconoce (app desinstalada, datos borrados). */
  removeTokens(tokens: string[]): Promise<void>;
  listTokens(userId: string): Promise<string[]>;
}
