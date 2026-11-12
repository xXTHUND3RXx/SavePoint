import { Game, GameStatus } from '../../src/models/game';
import { CoverProvider } from '../../src/services/cover-provider';
import { Logger } from '../../src/services/game.service';

/** IGDB falsa: devolve capas a partir de um mapa externalId → url. */
export class FakeCoverProvider implements CoverProvider {
  calls: number[] = [];
  error?: Error;

  constructor(private readonly covers: Record<number, string> = {}) {}

  async findCoverUrl(externalId: number): Promise<string | null> {
    this.calls.push(externalId);
    if (this.error) throw this.error;
    return this.covers[externalId] ?? null;
  }
}

export const silentLogger: Logger = { warn: () => undefined };

export function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 1,
    externalId: 1942,
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    platform: 'PC',
    status: GameStatus.BACKLOG,
    hoursPlayed: 0,
    coverUrl: '',
    ...overrides,
  };
}

/** Corpo válido para POST /games. */
export function makeGamePayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    externalId: 1942,
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    platform: 'PC',
    ...overrides,
  };
}
