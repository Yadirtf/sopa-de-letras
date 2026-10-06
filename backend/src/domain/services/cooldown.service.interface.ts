/**
 * Candado temporal "una vez cada N segundos" (anti-spam de invitaciones).
 */
export interface ICooldownStore {
  /** true si se adquirio el candado; false si aun esta activo. */
  tryAcquire(key: string, ttlSeconds: number): Promise<boolean>;
}
