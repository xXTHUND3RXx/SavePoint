import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GameStatus } from '../../src/models/game';
import { JsonFileGameRepository } from '../../src/repositories/json-file-game.repository';
import { makeGame } from '../helpers/fakes';

describe('JsonFileGameRepository', () => {
  let dir: string;
  let filePath: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'savepoint-'));
    filePath = join(dir, 'nested', 'games.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  async function readSaved() {
    return JSON.parse(await readFile(filePath, 'utf-8'));
  }

  it('começa vazio quando o arquivo não existe', async () => {
    expect(await new JsonFileGameRepository(filePath).findAll()).toEqual([]);
  });

  it('cria a pasta e grava o arquivo ao cadastrar', async () => {
    const { id: _id, ...data } = makeGame();

    const created = await new JsonFileGameRepository(filePath).create(data);

    expect(await readSaved()).toEqual([created]);
  });

  it('mantém os dados entre instâncias (simula reiniciar o servidor)', async () => {
    const { id: _id, ...data } = makeGame();
    await new JsonFileGameRepository(filePath).create(data);

    const reopened = new JsonFileGameRepository(filePath);
    const second = await reopened.create({ ...data, title: 'Hades' });

    expect(second.id).toBe(2);
    expect((await reopened.findAll()).map((g) => g.title)).toEqual([data.title, 'Hades']);
  });

  it('persiste a atualização de status', async () => {
    const { id: _id, ...data } = makeGame();
    const repository = new JsonFileGameRepository(filePath);
    const created = await repository.create(data);

    await repository.updateStatus(created.id, GameStatus.COMPLETED);

    expect((await readSaved())[0].status).toBe(GameStatus.COMPLETED);
  });

  it('não perde jogos em cadastros simultâneos', async () => {
    const { id: _id, ...data } = makeGame();
    const repository = new JsonFileGameRepository(filePath);

    await Promise.all(
      Array.from({ length: 10 }, (_, i) => repository.create({ ...data, title: `Jogo ${i}` })),
    );

    expect(await readSaved()).toHaveLength(10);
  });

  it('trata arquivo vazio como biblioteca vazia', async () => {
    await writeFile(join(dir, 'empty.json'), '');
    expect(await new JsonFileGameRepository(join(dir, 'empty.json')).findAll()).toEqual([]);
  });

  it('falha de forma explícita com arquivo corrompido', async () => {
    const corrupted = join(dir, 'corrupted.json');
    await writeFile(corrupted, '{ não é json');

    await expect(new JsonFileGameRepository(corrupted).findAll()).rejects.toThrow(SyntaxError);
  });
});
