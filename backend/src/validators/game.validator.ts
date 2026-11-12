import { ValidationError } from '../errors/app-error';
import { GAME_STATUSES, GameFilters, GameStatus, isGameStatus } from '../models/game';

/** Dados aceitos no cadastro de um jogo. */
export interface CreateGameInput {
  externalId: number;
  title: string;
  genre: string;
  platform: string;
  status: GameStatus;
  hoursPlayed: number;
  /** Opcional: se não vier, a capa é buscada na IGDB. */
  coverUrl?: string;
}

const STATUS_LIST = GAME_STATUSES.join(', ');

type Body = Record<string, unknown>;

function asObject(value: unknown): Body {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(['O corpo da requisição deve ser um objeto JSON.']);
  }
  return value as Body;
}

function requiredText(body: Body, field: string, errors: string[]): string {
  const value = body[field];
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`"${field}" é obrigatório e deve ser um texto.`);
    return '';
  }
  return value.trim();
}

function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseCreateGameInput(rawBody: unknown): CreateGameInput {
  const body = asObject(rawBody);
  const errors: string[] = [];

  const { externalId, status, hoursPlayed, coverUrl } = body;

  if (typeof externalId !== 'number' || !Number.isInteger(externalId) || externalId <= 0) {
    errors.push('"externalId" é obrigatório e deve ser um número inteiro positivo (id do jogo na IGDB).');
  }

  const title = requiredText(body, 'title', errors);
  const genre = requiredText(body, 'genre', errors);
  const platform = requiredText(body, 'platform', errors);

  if (status !== undefined && !isGameStatus(status)) {
    errors.push(`"status" deve ser um destes valores: ${STATUS_LIST}.`);
  }

  if (
    hoursPlayed !== undefined &&
    (typeof hoursPlayed !== 'number' || !Number.isFinite(hoursPlayed) || hoursPlayed < 0)
  ) {
    errors.push('"hoursPlayed" deve ser um número maior ou igual a zero.');
  }

  if (coverUrl !== undefined && (typeof coverUrl !== 'string' || !isHttpUrl(coverUrl))) {
    errors.push('"coverUrl" deve ser um endereço http(s) válido.');
  }

  if (errors.length > 0) throw new ValidationError(errors);

  return {
    externalId: externalId as number,
    title,
    genre,
    platform,
    status: (status as GameStatus | undefined) ?? GameStatus.BACKLOG,
    hoursPlayed: (hoursPlayed as number | undefined) ?? 0,
    coverUrl: coverUrl as string | undefined,
  };
}

export function parseStatusUpdate(rawBody: unknown): GameStatus {
  const { status } = asObject(rawBody);
  if (!isGameStatus(status)) {
    throw new ValidationError([`"status" é obrigatório e deve ser um destes valores: ${STATUS_LIST}.`]);
  }
  return status;
}

export function parseGameId(rawId: unknown): number {
  const id = Number(rawId);
  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId) || id <= 0) {
    throw new ValidationError(['O id do jogo deve ser um número inteiro positivo.']);
  }
  return id;
}

export function parseGameFilters(query: Record<string, unknown>): GameFilters {
  const filters: GameFilters = {};
  const errors: string[] = [];
  const { status, platform } = query;

  if (status !== undefined) {
    if (isGameStatus(status)) filters.status = status;
    else errors.push(`Filtro "status" deve ser um destes valores: ${STATUS_LIST}.`);
  }

  if (platform !== undefined) {
    if (typeof platform === 'string' && platform.trim() !== '') filters.platform = platform.trim();
    else errors.push('Filtro "platform" deve ser um texto não vazio.');
  }

  if (errors.length > 0) throw new ValidationError(errors);
  return filters;
}
