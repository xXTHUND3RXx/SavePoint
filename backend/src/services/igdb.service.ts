import { CoverProvider } from './cover-provider';

export interface IgdbCredentials {
  clientId: string;
  clientSecret: string;
}

export const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
export const IGDB_GAMES_URL = 'https://api.igdb.com/v4/games';
export const IGDB_IMAGE_BASE_URL = 'https://images.igdb.com/igdb/image/upload/t_cover_big';

/** Margem para renovar o token antes de ele expirar de fato. */
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
}

interface IgdbGame {
  id: number;
  cover?: { image_id?: string };
}

export class IgdbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IgdbError';
  }
}

/**
 * Busca capas de jogos na IGDB (https://api-docs.igdb.com).
 * A autenticação é feita pela Twitch (client credentials) e o token
 * fica guardado até perto de expirar.
 */
export class IgdbService implements CoverProvider {
  private token?: { value: string; expiresAt: number };

  constructor(
    private readonly credentials: IgdbCredentials,
    private readonly fetchFn: typeof fetch = (input, init) => fetch(input, init),
    private readonly now: () => number = Date.now,
  ) {}

  async findCoverUrl(externalId: number): Promise<string | null> {
    const token = await this.getAccessToken();

    const response = await this.fetchFn(IGDB_GAMES_URL, {
      method: 'POST',
      headers: {
        'Client-ID': this.credentials.clientId,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body: `fields cover.image_id; where id = ${externalId};`,
    });

    if (response.status === 401) this.token = undefined;
    if (!response.ok) {
      throw new IgdbError(`IGDB respondeu com status ${response.status}.`);
    }

    const games = (await response.json()) as IgdbGame[];
    const imageId = games[0]?.cover?.image_id;
    return imageId ? `${IGDB_IMAGE_BASE_URL}/${imageId}.jpg` : null;
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > this.now()) return this.token.value;

    const params = new URLSearchParams({
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await this.fetchFn(`${TWITCH_TOKEN_URL}?${params}`, { method: 'POST' });
    if (!response.ok) {
      throw new IgdbError(`Falha ao autenticar na Twitch/IGDB (status ${response.status}).`);
    }

    const data = (await response.json()) as TwitchTokenResponse;
    this.token = {
      value: data.access_token,
      expiresAt: this.now() + data.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS,
    };
    return this.token.value;
  }
}
