import { Game, GameFilters, GameStatus, NewGame } from '../models/game';
import { GameRepository } from './game.repository';

/**
 * Guarda os jogos apenas em memória. Usado nos testes e como base
 * para o repositório em arquivo JSON.
 */
export class InMemoryGameRepository implements GameRepository {
  private games: Game[];
  private nextId: number;

  constructor(initialGames: Game[] = []) {
    this.games = initialGames.map((game) => ({ ...game }));
    this.nextId = this.games.reduce((max, game) => Math.max(max, game.id), 0) + 1;
  }

  async findAll(filters: GameFilters = {}): Promise<Game[]> {
    const platform = filters.platform?.trim().toLowerCase();

    return this.games
      .filter((game) => !filters.status || game.status === filters.status)
      .filter((game) => !platform || game.platform.toLowerCase() === platform)
      .map((game) => ({ ...game }));
  }

  async findById(id: number): Promise<Game | undefined> {
    const game = this.games.find((item) => item.id === id);
    return game ? { ...game } : undefined;
  }

  async create(data: NewGame): Promise<Game> {
    const game: Game = { id: this.nextId++, ...data };
    this.games.push(game);
    return { ...game };
  }

  async updateStatus(id: number, status: GameStatus): Promise<Game | undefined> {
    const game = this.games.find((item) => item.id === id);
    if (!game) return undefined;

    game.status = status;
    return { ...game };
  }
}
