import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error';

/** Rotas inexistentes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: { message: `Rota ${req.method} ${req.path} não encontrada.` } });
}

/** Converte qualquer erro em uma resposta JSON padronizada. */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { message: error.message, ...(error.details && { details: error.details }) },
    });
    return;
  }

  // JSON malformado no corpo da requisição (gerado pelo express.json()).
  if (isBodyParseError(error)) {
    res.status(400).json({ error: { message: 'O corpo da requisição não é um JSON válido.' } });
    return;
  }

  console.error(error);
  res.status(500).json({ error: { message: 'Erro interno do servidor.' } });
}

function isBodyParseError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { type?: unknown }).type === 'entity.parse.failed'
  );
}
