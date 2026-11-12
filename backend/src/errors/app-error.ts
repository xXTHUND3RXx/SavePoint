/** Erro esperado da aplicação, já com o status HTTP a ser devolvido. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(details: string[]) {
    super(400, 'Dados inválidos.', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}
