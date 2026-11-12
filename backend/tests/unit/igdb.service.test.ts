import {
  IGDB_GAMES_URL,
  IGDB_IMAGE_BASE_URL,
  IgdbError,
  IgdbService,
  TWITCH_TOKEN_URL,
} from '../../src/services/igdb.service';

const credentials = { clientId: 'client-id', clientSecret: 'client-secret' };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** fetch falso que responde ao token da Twitch e às consultas da IGDB. */
function makeFetch(igdbResponses: Array<() => Response>, tokenStatus = 200) {
  let igdbCall = 0;
  const fetchMock = jest.fn(async (input: string | URL | Request) => {
    const url = String(input);
    if (url.startsWith(TWITCH_TOKEN_URL)) {
      return jsonResponse({ access_token: 'token-123', expires_in: 3600 }, tokenStatus);
    }
    if (url === IGDB_GAMES_URL) return igdbResponses[igdbCall++]();
    throw new Error(`URL inesperada: ${url}`);
  });
  return fetchMock;
}

function tokenCalls(fetchMock: jest.Mock): number {
  return fetchMock.mock.calls.filter(([url]) => String(url).startsWith(TWITCH_TOKEN_URL)).length;
}

describe('IgdbService', () => {
  it('monta a URL da capa a partir do image_id', async () => {
    const fetchMock = makeFetch([() => jsonResponse([{ id: 1942, cover: { image_id: 'co1wyy' } }])]);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch);

    const url = await service.findCoverUrl(1942);

    expect(url).toBe(`${IGDB_IMAGE_BASE_URL}/co1wyy.jpg`);
  });

  it('envia credenciais e consulta corretas para a IGDB', async () => {
    const fetchMock = makeFetch([() => jsonResponse([])]);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch);

    await service.findCoverUrl(1942);

    const [tokenUrl] = fetchMock.mock.calls[0];
    expect(String(tokenUrl)).toContain('client_id=client-id');
    expect(String(tokenUrl)).toContain('grant_type=client_credentials');

    const [, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    expect(init.headers).toMatchObject({ 'Client-ID': 'client-id', Authorization: 'Bearer token-123' });
    expect(init.body).toBe('fields cover.image_id; where id = 1942;');
  });

  it.each([
    ['jogo não encontrado', []],
    ['jogo sem capa', [{ id: 1942 }]],
  ])('devolve null quando é %s', async (_caso, body) => {
    const fetchMock = makeFetch([() => jsonResponse(body)]);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch);

    expect(await service.findCoverUrl(1942)).toBeNull();
  });

  it('reutiliza o token enquanto ele é válido', async () => {
    const fetchMock = makeFetch([() => jsonResponse([]), () => jsonResponse([])]);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch);

    await service.findCoverUrl(1);
    await service.findCoverUrl(2);

    expect(tokenCalls(fetchMock)).toBe(1);
  });

  it('renova o token quando ele expira', async () => {
    let now = 0;
    const fetchMock = makeFetch([() => jsonResponse([]), () => jsonResponse([])]);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch, () => now);

    await service.findCoverUrl(1);
    now = 3600 * 1000; // uma hora depois
    await service.findCoverUrl(2);

    expect(tokenCalls(fetchMock)).toBe(2);
  });

  it('descarta o token após 401 para pedir um novo na próxima chamada', async () => {
    const fetchMock = makeFetch([() => jsonResponse({}, 401), () => jsonResponse([])]);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch);

    await expect(service.findCoverUrl(1)).rejects.toThrow(IgdbError);
    await service.findCoverUrl(1);

    expect(tokenCalls(fetchMock)).toBe(2);
  });

  it('lança IgdbError quando a autenticação falha', async () => {
    const fetchMock = makeFetch([], 400);
    const service = new IgdbService(credentials, fetchMock as unknown as typeof fetch);

    await expect(service.findCoverUrl(1)).rejects.toThrow('Falha ao autenticar');
  });
});
