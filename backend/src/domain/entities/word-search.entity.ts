export type WordSearchDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface WordSearchProps {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: WordSearchDifficulty;
  language: string;
  gridSize: number;
  wordCount: number;
  playCount: number;
  isPublic: boolean;
  creatorId: string;
  creatorName?: string;
  grid?: string[][] | null;
  words?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export class WordSearch {
  private constructor(private readonly props: WordSearchProps) {}

  public static create(props: WordSearchProps): WordSearch {
    if (!props.title || props.title.trim().length < 3) {
      throw new Error('El título debe tener al menos 3 caracteres');
    }
    if (props.gridSize < 8 || props.gridSize > 25) {
      throw new Error('El tamaño de cuadrícula debe estar entre 8 y 25');
    }
    return new WordSearch(props);
  }

  public get id(): string { return this.props.id; }
  public get title(): string { return this.props.title; }
  public get description(): string | null { return this.props.description; }
  public get category(): string { return this.props.category; }
  public get difficulty(): WordSearchDifficulty { return this.props.difficulty; }
  public get language(): string { return this.props.language; }
  public get gridSize(): number { return this.props.gridSize; }
  public get wordCount(): number { return this.props.wordCount; }
  public get playCount(): number { return this.props.playCount; }
  public get isPublic(): boolean { return this.props.isPublic; }
  public get creatorId(): string { return this.props.creatorId; }
  public get creatorName(): string | undefined { return this.props.creatorName; }
  public get grid(): string[][] | null | undefined { return this.props.grid; }
  public get words(): string[] | null | undefined { return this.props.words; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  public incrementPlayCount(): void {
    this.props.playCount += 1;
  }
}
