import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Game, GameFilters, GameStatus, NewGame } from '../models/game';
import { GameRepository } from './game.repository';
import { InMemoryGameRepository } from './in-memory-game.repository';

/**
 * Armazenamento local: mantém os jogos em memória e grava tudo em um
 * arquivo JSON a cada alteração. Suficiente enquanto não há banco de dados.
 */
export class JsonFileGameRepository implements GameRepository {
  private store?: Promise<InMemoryGameRepository>;
  private pendingWrite: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async findAll(filters?: GameFilters): Promise<Game[]> {
    return (await this.load()).findAll(filters);
  }

  async findById(id: number): Promise<Game | undefined> {
    return (await this.load()).findById(id);
  }

  async create(data: NewGame): Promise<Game> {
    const store = await this.load();
    const game = await store.create(data);
    await this.persist(store);
    return game;
  }

  async updateStatus(id: number, status: GameStatus): Promise<Game | undefined> {
    const store = await this.load();
    const game = await store.updateStatus(id, status);
    if (game) await this.persist(store);
    return game;
  }

  private load(): Promise<InMemoryGameRepository> {
    this.store ??= this.readFromDisk().then((games) => new InMemoryGameRepository(games));
    return this.store;
  }

  private async readFromDisk(): Promise<Game[]> {
    try {
      const content = await readFile(this.filePath, 'utf-8');
      return content.trim() ? (JSON.parse(content) as Game[]) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  /** Grava em fila para que escritas simultâneas não se sobreponham. */
  private persist(store: InMemoryGameRepository): Promise<void> {
    const write = this.pendingWrite.then(async () => {
      const games = await store.findAll();
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, JSON.stringify(games, null, 2), 'utf-8');
    });
    this.pendingWrite = write.catch(() => undefined);
    return write;
  }
}
