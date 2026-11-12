import { Router } from 'express';
import { GameController } from '../controllers/game.controller';

export function createGameRoutes(controller: GameController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.patch('/:id/status', controller.updateStatus);

  return router;
}
