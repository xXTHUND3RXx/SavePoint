import { NotFoundError } from '../../src/errors/app-error';
import { GameStatus } from '../../src/models/game';
import { InMemoryGameRepository } from '../../src/repositories/in-memory-game.repository';
import { GameService } from '../../src/services/game.service';
import { CreateGameInput } from '../../src/validators/game.validator';
import { FakeCoverProvider, makeGame } from '../helpers/fakes';

const COVER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg';

function makeInput(overrides: Partial<CreateGameInput> = {}): CreateGameInput {
  return {
    externalId: 1942,
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG',
    platform: 'PC',
    status: GameStatus.BACKLOG,
    hoursPlayed: 0,
    ...overrides,
  };
}

describe('GameService', () => {
  let repository: InMemoryGameRepository;
  let covers: FakeCoverProvider;
  let logger: { warn: jest.Mock };
  let service: GameService;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    covers = new FakeCoverProvider({ 1942: COVER });
    logger = { warn: jest.fn() };
    service = new GameService(repository, covers, logger);
  });

  describe('create', () => {
    it('busca a capa na IGDB quando não é informada', async () => {
      const game = await service.create(makeInput());

      expect(covers.calls).toEqual([1942]);
      expect(game).toEqual({ id: 1, ...makeInput(), coverUrl: COVER });
    });

    it('usa a capa informada sem consultar a IGDB', async () => {
      const game = await service.create(makeInput({ coverUrl: 'https://exemplo.com/capa.jpg' }));

      expect(covers.calls).toEqual([]);
      expect(game.coverUrl).toBe('https://exemplo.com/capa.jpg');
    });

    it('cadastra com capa vazia quando a IGDB não tem capa', async () => {
      const game = await service.create(makeInput({ externalId: 999 }));
      expect(game.coverUrl).toBe('');
    });

    it('cadastra mesmo se a IGDB falhar, registrando um aviso', async () => {
      covers.error = new Error('timeout');

      const game = await service.create(makeInput());

      expect(game.coverUrl).toBe('');
      expect(await repository.findAll()).toHaveLength(1);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('timeout'));
    });
  });

  describe('list', () => {
    it('repassa os filtros para o repositório', async () => {
      repository = new InMemoryGameRepository([
        makeGame({ id: 1, status: GameStatus.PLAYING }),
        makeGame({ id: 2, status: GameStatus.COMPLETED }),
      ]);
      service = new GameService(repository, covers, logger);

      const games = await service.list({ status: GameStatus.COMPLETED });

      expect(games.map((g) => g.id)).toEqual([2]);
    });
  });

  describe('updateStatus', () => {
    it('altera o progresso do jogo', async () => {
      const created = await service.create(makeInput());

      const updated = await service.updateStatus(created.id, GameStatus.COMPLETED);

      expect(updated.status).toBe(GameStatus.COMPLETED);
    });

    it('lança NotFoundError para jogo inexistente', async () => {
      await expect(service.updateStatus(42, GameStatus.PLAYING)).rejects.toThrow(NotFoundError);
    });
  });
});
