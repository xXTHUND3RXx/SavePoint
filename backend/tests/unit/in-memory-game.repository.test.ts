import { GameStatus } from '../../src/models/game';
import { InMemoryGameRepository } from '../../src/repositories/in-memory-game.repository';
import { makeGame } from '../helpers/fakes';

describe('InMemoryGameRepository', () => {
  const library = [
    makeGame({ id: 1, title: 'Hades', platform: 'Switch', status: GameStatus.COMPLETED }),
    makeGame({ id: 2, title: 'Elden Ring', platform: 'PC', status: GameStatus.PLAYING }),
    makeGame({ id: 3, title: 'Celeste', platform: 'PC', status: GameStatus.BACKLOG }),
  ];

  it('gera ids sequenciais a partir do maior id existente', async () => {
    const repository = new InMemoryGameRepository(library);
    const { id: _id, ...data } = makeGame();

    const created = await repository.create(data);

    expect(created.id).toBe(4);
  });

  it('começa do id 1 quando está vazio', async () => {
    const { id: _id, ...data } = makeGame();
    const created = await new InMemoryGameRepository().create(data);
    expect(created.id).toBe(1);
  });

  it('lista todos os jogos sem filtro', async () => {
    const games = await new InMemoryGameRepository(library).findAll();
    expect(games.map((g) => g.title)).toEqual(['Hades', 'Elden Ring', 'Celeste']);
  });

  it('filtra por status', async () => {
    const games = await new InMemoryGameRepository(library).findAll({ status: GameStatus.PLAYING });
    expect(games.map((g) => g.title)).toEqual(['Elden Ring']);
  });

  it('filtra por plataforma sem diferenciar maiúsculas', async () => {
    const games = await new InMemoryGameRepository(library).findAll({ platform: 'pc' });
    expect(games.map((g) => g.title)).toEqual(['Elden Ring', 'Celeste']);
  });

  it('combina filtros de status e plataforma', async () => {
    const games = await new InMemoryGameRepository(library).findAll({
      platform: 'PC',
      status: GameStatus.BACKLOG,
    });
    expect(games.map((g) => g.title)).toEqual(['Celeste']);
  });

  it('atualiza o status de um jogo existente', async () => {
    const repository = new InMemoryGameRepository(library);

    const updated = await repository.updateStatus(3, GameStatus.PLAYING);

    expect(updated?.status).toBe(GameStatus.PLAYING);
    expect((await repository.findById(3))?.status).toBe(GameStatus.PLAYING);
  });

  it('devolve undefined ao atualizar jogo inexistente', async () => {
    const repository = new InMemoryGameRepository(library);
    expect(await repository.updateStatus(99, GameStatus.PLAYING)).toBeUndefined();
  });

  it('não deixa alterações externas vazarem para o armazenamento', async () => {
    const repository = new InMemoryGameRepository(library);

    const [first] = await repository.findAll();
    first.title = 'Alterado por fora';

    expect((await repository.findById(1))?.title).toBe('Hades');
    expect(library[0].title).toBe('Hades');
  });
});
