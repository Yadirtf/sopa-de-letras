export type NotificationType =
  | "ROOM_INVITE"
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "GAME_START"
  | "GAME_END";

export type NotificationPayload = Record<string, unknown>;

export interface NotificationProps {
  id: string;
  recipientId: string;
  senderId: string | null;
  type: NotificationType;
  payload: NotificationPayload;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Notificacion in-app persistente (US-25).
 * El payload es libre pero cada tipo documenta sus llaves en NotificationDispatcher.
 */
export class Notification {
  private constructor(private props: NotificationProps) {}

  public static create(input: Omit<NotificationProps, "isRead" | "createdAt">): Notification {
    return new Notification({ ...input, isRead: false, createdAt: new Date() });
  }

  public static restore(props: NotificationProps): Notification {
    return new Notification({ ...props });
  }

  public get id(): string { return this.props.id; }
  public get recipientId(): string { return this.props.recipientId; }
  public get senderId(): string | null { return this.props.senderId; }
  public get type(): NotificationType { return this.props.type; }
  public get payload(): NotificationPayload { return this.props.payload; }
  public get isRead(): boolean { return this.props.isRead; }
  public get createdAt(): Date { return this.props.createdAt; }

  public belongsTo(userId: string): boolean {
    return this.props.recipientId === userId;
  }

  public markAsRead(): void {
    this.props.isRead = true;
  }
}
