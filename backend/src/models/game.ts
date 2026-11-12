/**
 * Status de progresso de um jogo na biblioteca do jogador.
 */
export const GameStatus = {
  /** Ainda não começou. */
  BACKLOG: 'BACKLOG',
  /** Está jogando. */
  PLAYING: 'PLAYING',
  /** Jogo concluído. */
  COMPLETED: 'COMPLETED',
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export const GAME_STATUSES: readonly GameStatus[] = Object.values(GameStatus);

/** Descrição em português de cada status, usada nas respostas da API. */
export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  BACKLOG: 'Ainda não começou',
  PLAYING: 'Jogando',
  COMPLETED: 'Concluído',
};

export function isGameStatus(value: unknown): value is GameStatus {
  return typeof value === 'string' && (GAME_STATUSES as readonly string[]).includes(value);
}

/** Um jogo cadastrado na biblioteca. */
export interface Game {
  /** Identificador interno do SavePoint. */
  id: number;
  /** Identificador do jogo na IGDB. */
  externalId: number;
  /** Nome do jogo. */
  title: string;
  /** Gênero (ex.: RPG, Ação). */
  genre: string;
  /** Plataforma onde o jogador tem o jogo (ex.: PC, PS5). */
  platform: string;
  /** Progresso atual. */
  status: GameStatus;
  /** Horas jogadas. */
  hoursPlayed: number;
  /** Endereço da imagem de capa. */
  coverUrl: string;
}

/** Dados de um jogo antes de receber um id. */
export type NewGame = Omit<Game, 'id'>;

/** Critérios de busca ao listar jogos. Todos opcionais. */
export interface GameFilters {
  status?: GameStatus;
  platform?: string;
}
