import { Request, Response } from 'express';
import { GameService } from '../services/game.service';
import {
  parseCreateGameInput,
  parseGameFilters,
  parseGameId,
  parseStatusUpdate,
} from '../validators/game.validator';
import { GameView } from '../views/game.view';

/**
 * Camada Controller: recebe a requisição, valida a entrada, chama o
 * serviço e entrega o resultado para a View. Erros seguem para o
 * middleware de erros (Express 5 repassa rejeições de funções async).
 */
export class GameController {
  constructor(private readonly service: GameService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const input = parseCreateGameInput(req.body);
    const game = await this.service.create(input);
    res.status(201).json(GameView.one(game));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const filters = parseGameFilters(req.query);
    const games = await this.service.list(filters);
    res.json(GameView.many(games));
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const id = parseGameId(req.params.id);
    const status = parseStatusUpdate(req.body);
    const game = await this.service.updateStatus(id, status);
    res.json(GameView.one(game));
  };
}
