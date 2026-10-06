/**
 * Entidad de Sesion Activa para gestion en memoria/Redis.
 */
export interface SessionProps {
  userId: string;
  token: string;
  isGuest: boolean;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
}

export class Session {
  readonly userId: string;
  readonly token: string;
  readonly isGuest: boolean;
  readonly ipAddress: string;
  readonly userAgent?: string;
  readonly createdAt: Date;
  readonly expiresAt: Date;

  constructor(props: SessionProps) {
    this.userId = props.userId;
    this.token = props.token;
    this.isGuest = props.isGuest;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
