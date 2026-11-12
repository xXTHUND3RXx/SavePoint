import { Game, GameFilters, GameStatus, NewGame } from '../models/game';

/**
 * Contrato de acesso aos dados dos jogos.
 * Trocar o armazenamento (arquivo JSON, memória, banco de dados) significa
 * criar uma nova implementação desta interface, sem mexer no resto do código.
 */
export interface GameRepository {
  findAll(filters?: GameFilters): Promise<Game[]>;
  findById(id: number): Promise<Game | undefined>;
  create(data: NewGame): Promise<Game>;
  updateStatus(id: number, status: GameStatus): Promise<Game | undefined>;
}
