/** Fonte de imagens de capa dos jogos. */
export interface CoverProvider {
  /** Devolve o endereço da capa ou `null` se o jogo não tiver capa. */
  findCoverUrl(externalId: number): Promise<string | null>;
}

/** Usado quando a IGDB não está configurada: nunca encontra capa. */
export class NoCoverProvider implements CoverProvider {
  async findCoverUrl(): Promise<string | null> {
    return null;
  }
}
