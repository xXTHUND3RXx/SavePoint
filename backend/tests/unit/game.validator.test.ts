import { ValidationError } from '../../src/errors/app-error';
import {
  parseCreateGameInput,
  parseGameFilters,
  parseGameId,
  parseStatusUpdate,
} from '../../src/validators/game.validator';
import { makeGamePayload } from '../helpers/fakes';

function captureError(fn: () => unknown): ValidationError {
  try {
    fn();
  } catch (error) {
    if (error instanceof ValidationError) return error;
    throw error;
  }
  throw new Error('Era esperado um ValidationError.');
}

describe('parseCreateGameInput', () => {
  it('aplica valores padrão para status e horas jogadas', () => {
    const input = parseCreateGameInput(makeGamePayload());

    expect(input).toEqual({
      externalId: 1942,
      title: 'The Witcher 3: Wild Hunt',
      genre: 'RPG',
      platform: 'PC',
      status: 'BACKLOG',
      hoursPlayed: 0,
      coverUrl: undefined,
    });
  });

  it('remove espaços extras dos textos', () => {
    const input = parseCreateGameInput(makeGamePayload({ title: '  Hades  ', platform: ' Switch ' }));

    expect(input.title).toBe('Hades');
    expect(input.platform).toBe('Switch');
  });

  it('aceita status, horas e capa informados', () => {
    const input = parseCreateGameInput(
      makeGamePayload({ status: 'PLAYING', hoursPlayed: 12.5, coverUrl: 'https://exemplo.com/capa.jpg' }),
    );

    expect(input.status).toBe('PLAYING');
    expect(input.hoursPlayed).toBe(12.5);
    expect(input.coverUrl).toBe('https://exemplo.com/capa.jpg');
  });

  it('lista todos os campos obrigatórios ausentes de uma vez', () => {
    const error = captureError(() => parseCreateGameInput({}));

    expect(error.statusCode).toBe(400);
    expect(error.details).toHaveLength(4);
    expect(error.details?.join(' ')).toEqual(
      expect.stringContaining('externalId'),
    );
  });

  it.each([
    ['externalId negativo', { externalId: -1 }, 'externalId'],
    ['externalId decimal', { externalId: 1.5 }, 'externalId'],
    ['externalId como texto', { externalId: '1942' }, 'externalId'],
    ['título vazio', { title: '   ' }, 'title'],
    ['status desconhecido', { status: 'ABANDONED' }, 'status'],
    ['horas negativas', { hoursPlayed: -3 }, 'hoursPlayed'],
    ['horas como texto', { hoursPlayed: '10' }, 'hoursPlayed'],
    ['capa sem http', { coverUrl: 'ftp://capa.jpg' }, 'coverUrl'],
    ['capa inválida', { coverUrl: 'não é url' }, 'coverUrl'],
  ])('rejeita %s', (_caso, override, field) => {
    const error = captureError(() => parseCreateGameInput(makeGamePayload(override)));

    expect(error.details).toHaveLength(1);
    expect(error.details?.[0]).toContain(`"${field}"`);
  });

  it.each([null, [], 'texto', 42])('rejeita corpo que não é objeto: %p', (body) => {
    expect(() => parseCreateGameInput(body)).toThrow(ValidationError);
  });
});

describe('parseStatusUpdate', () => {
  it.each(['BACKLOG', 'PLAYING', 'COMPLETED'])('aceita %s', (status) => {
    expect(parseStatusUpdate({ status })).toBe(status);
  });

  it.each([{}, { status: 'playing' }, { status: 'FINISHED' }])('rejeita %p', (body) => {
    expect(() => parseStatusUpdate(body)).toThrow(ValidationError);
  });
});

describe('parseGameId', () => {
  it('converte o id da URL para número', () => {
    expect(parseGameId('7')).toBe(7);
  });

  it.each(['0', '-1', 'abc', '1.5', '', undefined])('rejeita %p', (id) => {
    expect(() => parseGameId(id)).toThrow(ValidationError);
  });
});

describe('parseGameFilters', () => {
  it('sem filtros devolve objeto vazio', () => {
    expect(parseGameFilters({})).toEqual({});
  });

  it('aceita status e plataforma', () => {
    expect(parseGameFilters({ status: 'COMPLETED', platform: ' PS5 ' })).toEqual({
      status: 'COMPLETED',
      platform: 'PS5',
    });
  });

  it('rejeita status inválido e plataforma vazia', () => {
    const error = captureError(() => parseGameFilters({ status: 'X', platform: '' }));
    expect(error.details).toHaveLength(2);
  });

  it('rejeita filtro repetido (?status=A&status=B)', () => {
    expect(() => parseGameFilters({ status: ['BACKLOG', 'PLAYING'] })).toThrow(ValidationError);
  });
});
