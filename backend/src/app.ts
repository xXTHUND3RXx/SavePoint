import express, { Express } from 'express';
import { GameController } from './controllers/game.controller';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { GameRepository } from './repositories/game.repository';
import { createGameRoutes } from './routes/game.routes';
import { CoverProvider } from './services/cover-provider';
import { GameService, Logger } from './services/game.service';

export interface AppDependencies {
  gameRepository: GameRepository;
  coverProvider: CoverProvider;
  logger?: Logger;
}

/**
 * Monta a aplicação Express. As dependências chegam de fora para que os
 * testes possam usar armazenamento em memória e uma IGDB falsa.
 */
export function createApp({ gameRepository, coverProvider, logger }: AppDependencies): Express {
  const app = express();
  app.use(express.json());

  const gameService = new GameService(gameRepository, coverProvider, logger);
  const gameController = new GameController(gameService);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/games', createGameRoutes(gameController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
