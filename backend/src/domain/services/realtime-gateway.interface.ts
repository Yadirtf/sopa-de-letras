/**
 * Puerto de salida para empujar eventos a un usuario concreto,
 * sin importar en cuantos dispositivos tenga la app abierta.
 */
export interface IRealtimeGateway {
  emitToUser(userId: string, event: string, payload: unknown): void;
  emitToUsers(userIds: string[], event: string, payload: unknown): void;
}
