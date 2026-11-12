import { NotFoundError } from '../errors/app-error';
import { Game, GameFilters, GameStatus } from '../models/game';
import { GameRepository } from '../repositories/game.repository';
import { CreateGameInput } from '../validators/game.validator';
import { CoverProvider } from './cover-provider';

export interface Logger {
  warn(message: string): void;
}

/** Regras de negócio da biblioteca de jogos. */
export class GameService {
  constructor(
    private readonly repository: GameRepository,
    private readonly coverProvider: CoverProvider,
    private readonly logger: Logger = console,
  ) {}

  async create(input: CreateGameInput): Promise<Game> {
    const coverUrl = input.coverUrl ?? (await this.findCover(input.externalId));

    return this.repository.create({
      externalId: input.externalId,
      title: input.title,
      genre: input.genre,
      platform: input.platform,
      status: input.status,
      hoursPlayed: input.hoursPlayed,
      coverUrl,
    });
  }

  list(filters: GameFilters = {}): Promise<Game[]> {
    return this.repository.findAll(filters);
  }

  async updateStatus(id: number, status: GameStatus): Promise<Game> {
    const game = await this.repository.updateStatus(id, status);
    if (!game) throw new NotFoundError(`Jogo com id ${id} não encontrado.`);
    return game;
  }

  /**
   * A capa é um complemento: se a IGDB falhar, o jogo é cadastrado
   * mesmo assim, com a capa vazia.
   */
  private async findCover(externalId: number): Promise<string> {
    try {
      return (await this.coverProvider.findCoverUrl(externalId)) ?? '';
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Não foi possível buscar a capa do jogo ${externalId}: ${reason}`);
      return '';
    }
  }
}
