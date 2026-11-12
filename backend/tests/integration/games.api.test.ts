import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../src/app';
import { InMemoryGameRepository } from '../../src/repositories/in-memory-game.repository';
import { FakeCoverProvider, makeGamePayload, silentLogger } from '../helpers/fakes';

const COVER = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg';

describe('API /games', () => {
  let app: Express;
  let covers: FakeCoverProvider;

  beforeEach(() => {
    covers = new FakeCoverProvider({ 1942: COVER });
    app = createApp({
      gameRepository: new InMemoryGameRepository(),
      coverProvider: covers,
      logger: silentLogger,
    });
  });

  async function createGame(overrides: Record<string, unknown> = {}) {
    const response = await request(app).post('/games').send(makeGamePayload(overrides));
    expect(response.status).toBe(201);
    return response.body.data;
  }

  describe('POST /games', () => {
    it('cadastra um jogo com capa da IGDB e valores padrão', async () => {
      const response = await request(app).post('/games').send(makeGamePayload());

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        data: {
          id: 1,
          externalId: 1942,
          title: 'The Witcher 3: Wild Hunt',
          genre: 'RPG',
          platform: 'PC',
          status: 'BACKLOG',
          statusLabel: 'Ainda não começou',
          hoursPlayed: 0,
          coverUrl: COVER,
        },
      });
    });

    it('cadastra mesmo com a IGDB fora do ar', async () => {
      covers.error = new Error('IGDB indisponível');

      const response = await request(app).post('/games').send(makeGamePayload());

      expect(response.status).toBe(201);
      expect(response.body.data.coverUrl).toBe('');
    });

    it('responde 400 com os detalhes de cada campo inválido', async () => {
      const response = await request(app).post('/games').send({ title: '', status: 'X' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Dados inválidos.');
      expect(response.body.error.details).toHaveLength(5);
    });

    it('responde 400 para JSON malformado', async () => {
      const response = await request(app)
        .post('/games')
        .set('Content-Type', 'application/json')
        .send('{"title": ');

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('JSON válido');
    });
  });

  describe('GET /games', () => {
    beforeEach(async () => {
      await createGame({ title: 'Hades', platform: 'Switch', status: 'COMPLETED' });
      await createGame({ title: 'Elden Ring', platform: 'PC', status: 'PLAYING' });
      await createGame({ title: 'Celeste', platform: 'PC' });
    });

    function titles(response: request.Response): string[] {
      return response.body.data.map((game: { title: string }) => game.title);
    }

    it('lista todos os jogos com o total', async () => {
      const response = await request(app).get('/games');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(titles(response)).toEqual(['Hades', 'Elden Ring', 'Celeste']);
    });

    it('filtra por status', async () => {
      const response = await request(app).get('/games').query({ status: 'PLAYING' });
      expect(titles(response)).toEqual(['Elden Ring']);
    });

    it('filtra por plataforma', async () => {
      const response = await request(app).get('/games').query({ platform: 'pc' });
      expect(titles(response)).toEqual(['Elden Ring', 'Celeste']);
    });

    it('combina status e plataforma', async () => {
      const response = await request(app).get('/games').query({ platform: 'PC', status: 'BACKLOG' });
      expect(titles(response)).toEqual(['Celeste']);
    });

    it('devolve lista vazia quando nada corresponde', async () => {
      const response = await request(app).get('/games').query({ platform: 'Xbox' });
      expect(response.body).toEqual({ data: [], total: 0 });
    });

    it('responde 400 para status de filtro inválido', async () => {
      const response = await request(app).get('/games').query({ status: 'ABANDONED' });
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /games/:id/status', () => {
    it('atualiza o progresso do jogo', async () => {
      const game = await createGame();

      const response = await request(app)
        .patch(`/games/${game.id}/status`)
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({ id: game.id, status: 'COMPLETED', statusLabel: 'Concluído' });

      const list = await request(app).get('/games').query({ status: 'COMPLETED' });
      expect(list.body.total).toBe(1);
    });

    it('responde 404 para jogo inexistente', async () => {
      const response = await request(app).patch('/games/99/status').send({ status: 'PLAYING' });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe('Jogo com id 99 não encontrado.');
    });

    it('responde 400 para status inválido', async () => {
      const game = await createGame();
      const response = await request(app).patch(`/games/${game.id}/status`).send({ status: 'DONE' });
      expect(response.status).toBe(400);
    });

    it('responde 400 para id inválido', async () => {
      const response = await request(app).patch('/games/abc/status').send({ status: 'PLAYING' });
      expect(response.status).toBe(400);
    });
  });

  it('responde 404 em JSON para rotas inexistentes', async () => {
    const response = await request(app).get('/nao-existe');

    expect(response.status).toBe(404);
    expect(response.body.error.message).toContain('não encontrada');
  });

  it('GET /health indica que a API está no ar', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toEqual({ status: 'ok' });
  });
});
