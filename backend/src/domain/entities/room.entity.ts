export type RoomStatus = 'WAITING' | 'COUNTDOWN' | 'IN_PROGRESS' | 'FINISHED';

export interface RoomPlayerProps {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  isHost: boolean;
  isReady: boolean;
  score: number;
  wordsFound: string[];
  colorHex: string;
  rank?: number;
}

export interface RoomProps {
  id: string;
  code: string;
  wordSearchId: string;
  hostUserId: string;
  status: RoomStatus;
  maxPlayers: number;
  timeLimitSeconds: number;
  isPrivate: boolean;
  players: RoomPlayerProps[];
  startedAt?: Date | null;
  endedAt?: Date | null;
  createdAt: Date;
}

export class RoomEntity {
  private constructor(private readonly props: RoomProps) {}

  public static create(props: RoomProps): RoomEntity {
    if (!props.code || props.code.length < 4) {
      throw new Error('El código de sala debe tener al menos 4 caracteres');
    }
    if (props.maxPlayers < 2 || props.maxPlayers > 8) {
      throw new Error('La capacidad de jugadores debe estar entre 2 y 8');
    }
    return new RoomEntity(props);
  }

  public get id(): string { return this.props.id; }
  public get code(): string { return this.props.code; }
  public get wordSearchId(): string { return this.props.wordSearchId; }
  public get hostUserId(): string { return this.props.hostUserId; }
  public get status(): RoomStatus { return this.props.status; }
  public get maxPlayers(): number { return this.props.maxPlayers; }
  public get timeLimitSeconds(): number { return this.props.timeLimitSeconds; }
  public get isPrivate(): boolean { return this.props.isPrivate; }
  public get players(): RoomPlayerProps[] { return this.props.players; }
  public get startedAt(): Date | null | undefined { return this.props.startedAt; }
  public get endedAt(): Date | null | undefined { return this.props.endedAt; }
  public get createdAt(): Date { return this.props.createdAt; }

  public isFull(): boolean {
    return this.props.players.length >= this.props.maxPlayers;
  }

  public canJoin(): boolean {
    return this.props.status === 'WAITING' && !this.isFull();
  }

  public isHost(userId: string): boolean {
    return this.props.hostUserId === userId;
  }

  public start(): void {
    if (this.props.status !== 'WAITING' && this.props.status !== 'COUNTDOWN') {
      throw new Error('La partida no puede iniciarse en el estado actual');
    }
    this.props.status = 'IN_PROGRESS';
    this.props.startedAt = new Date();
  }

  public finish(): void {
    this.props.status = 'FINISHED';
    this.props.endedAt = new Date();
  }

  public toProps(): RoomProps {
    return { ...this.props };
  }
}
