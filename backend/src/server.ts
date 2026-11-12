import { createApp } from './app';
import { loadConfig, loadEnvFile } from './config/env';
import { JsonFileGameRepository } from './repositories/json-file-game.repository';
import { CoverProvider, NoCoverProvider } from './services/cover-provider';
import { IgdbService } from './services/igdb.service';

loadEnvFile();
const config = loadConfig();

let coverProvider: CoverProvider;
if (config.igdb) {
  coverProvider = new IgdbService(config.igdb);
} else {
  console.warn('IGDB não configurada (IGDB_CLIENT_ID/IGDB_CLIENT_SECRET): capas não serão buscadas.');
  coverProvider = new NoCoverProvider();
}

const app = createApp({
  gameRepository: new JsonFileGameRepository(config.dataFile),
  coverProvider,
});

app.listen(config.port, () => {
  console.log(`SavePoint API rodando em http://localhost:${config.port}`);
  console.log(`Jogos salvos em ${config.dataFile}`);
});
