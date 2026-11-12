import { GAME_STATUS_LABELS, Game } from '../models/game';

/** Formato de um jogo nas respostas da API. */
export interface GameResponse extends Game {
  /** Descrição do status em português (ex.: "Jogando"). */
  statusLabel: string;
}

/**
 * Camada View: define como os dados saem da API.
 * Os controllers nunca montam o JSON de resposta à mão.
 */
export const GameView = {
  render(game: Game): GameResponse {
    return { ...game, statusLabel: GAME_STATUS_LABELS[game.status] };
  },

  one(game: Game): { data: GameResponse } {
    return { data: GameView.render(game) };
  },

  many(games: Game[]): { data: GameResponse[]; total: number } {
    return { data: games.map(GameView.render), total: games.length };
  },
};
