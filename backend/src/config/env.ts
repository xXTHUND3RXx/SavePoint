import { resolve } from 'node:path';
import { IgdbCredentials } from '../services/igdb.service';

/** Pasta raiz do backend (funciona tanto em src/ quanto em dist/). */
const BACKEND_ROOT = resolve(__dirname, '..', '..');

export interface AppConfig {
  port: number;
  dataFile: string;
  igdb: IgdbCredentials | null;
}

/** Carrega o arquivo .env, se existir. */
export function loadEnvFile(path = resolve(BACKEND_ROOT, '.env')): void {
  try {
    process.loadEnvFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env.PORT ?? 3333);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT inválida: "${env.PORT}".`);
  }

  const clientId = env.IGDB_CLIENT_ID?.trim();
  const clientSecret = env.IGDB_CLIENT_SECRET?.trim();

  return {
    port,
    dataFile: resolve(BACKEND_ROOT, env.DATA_FILE ?? 'data/games.json'),
    igdb: clientId && clientSecret ? { clientId, clientSecret } : null,
  };
}
