# CLAUDE.md

Guia para trabalhar neste repositório.

## Projeto

SavePoint: aplicação para jogadores organizarem a biblioteca de jogos, acompanharem o progresso e controlarem o que ainda querem jogar.

- `backend/`: API REST em Node.js + TypeScript + Express 5, testes com Jest. **Implementado.**
- `mcp/savepoint-mcp-server/`: servidor MCP (stdio) que chama a API do backend. **Implementado.** Registrado em `.mcp.json` na raiz.
- `frontend/`: ainda não existe. Será uma pasta irmã de `backend/`.

## MCP — `mcp/savepoint-mcp-server/`

- Duas ferramentas: `listar_jogos` (filtros `status`/`platform`) e `atualizar_status_jogo` (`id` + `status`). Só usam `GET /games` e `PATCH /games/:id/status`.
- Não acessa o arquivo JSON direto: depende do backend rodando em `http://localhost:3333` (`SAVEPOINT_API_URL` muda a porta; só aceita HTTP local).
- Projeto independente do `backend/`: tem `package.json` e `node_modules` próprios. Compilar com `npm run mcp:build` na raiz (gera `build/`, ignorado pelo git).
- Se mudar o contrato da API (rotas, status, formato `{ data, total }`), atualize `src/index.ts` do MCP.

## Comandos

Rodar a partir de `backend/` (ou `npm test` na raiz, que delega para o backend):

```bash
npm run dev               # servidor com recarga automática (tsx), porta 3333
npm test                  # todos os testes
npm run test:unit         # tests/unit
npm run test:integration  # tests/integration
npm run test:coverage
npm run typecheck         # tsc em src/ e tests/
npm run build && npm start
```

Antes de considerar uma mudança pronta: `npm run typecheck` e `npm test` devem passar.

## Arquitetura (MVC) — `backend/src/`

Fluxo de uma requisição: `routes → controller → validator → service → repository`, e a resposta sai por `views`.

| Pasta          | Papel |
| -------------- | ----- |
| `models/`      | **Model**: tipo `Game`, `GameStatus`, rótulos em português, `GameFilters`. |
| `repositories/`| **Model (persistência)**: interface `GameRepository` + `InMemoryGameRepository` (testes) + `JsonFileGameRepository` (produção, grava em `data/games.json`). |
| `views/`       | **View**: `GameView` monta o JSON de resposta (`{ data }` / `{ data, total }`) e adiciona `statusLabel`. |
| `controllers/` | **Controller**: lê `req`, chama validator e service, responde via `GameView`. Sem regra de negócio. |
| `validators/`  | Converte e valida `body`/`query`/`params`; lança `ValidationError` com lista de `details`. |
| `services/`    | Regras de negócio (`GameService`) e integração externa (`IgdbService`, implementa `CoverProvider`). |
| `routes/`      | Liga URLs aos métodos do controller. |
| `middlewares/` | `errorHandler` (converte erros em JSON) e `notFoundHandler`. |
| `errors/`      | `AppError`, `ValidationError` (400), `NotFoundError` (404). |
| `config/`      | Leitura do `.env` (`process.loadEnvFile`, nativo do Node) e das variáveis de ambiente. |
| `app.ts`       | `createApp(deps)`: monta o Express recebendo repositório e provedor de capas por injeção. |
| `server.ts`    | Ponto de entrada: escolhe as implementações reais e sobe o servidor. |

### Convenções

- Dependências são injetadas por construtor; nada de `new` de infraestrutura dentro de services/controllers. Os testes trocam repositório e IGDB por fakes via `createApp`.
- Express 5 repassa rejeições de handlers `async` ao `errorHandler`; não use `try/catch` nos controllers só para chamar `next`.
- Erros esperados: lance uma subclasse de `AppError`. Formato da resposta: `{ error: { message, details? } }`.
- Mensagens para o usuário (erros, rótulos) em **português**. Nomes de campos e valores de status seguem o contrato abaixo (em inglês).
- Repositórios devolvem cópias dos objetos; nunca exponha a referência interna.
- Módulos CommonJS com `module: nodenext`: imports relativos **sem** extensão.

## Domínio

```ts
interface Game {
  id: number;          // gerado pelo SavePoint
  externalId: number;  // id do jogo na IGDB
  title: string;
  genre: string;
  platform: string;
  status: GameStatus;  // 'BACKLOG' | 'PLAYING' | 'COMPLETED'
  hoursPlayed: number; // >= 0
  coverUrl: string;    // '' quando não há capa
}
```

- `BACKLOG` = ainda não começou · `PLAYING` = está jogando · `COMPLETED` = concluído.
- No cadastro, `status` padrão é `BACKLOG` e `hoursPlayed` padrão é `0`.
- Se `coverUrl` não vier no cadastro, o `GameService` busca na IGDB pelo `externalId`. **Falha da IGDB não impede o cadastro**: o jogo é salvo com `coverUrl: ''` e um aviso vai para o log.
- Filtro por `platform` ignora maiúsculas/minúsculas; filtros `status` e `platform` podem ser combinados.

## Endpoints

| Método  | Rota                | Sucesso |
| ------- | ------------------- | ------- |
| `POST`  | `/games`            | 201 `{ data: Game }` |
| `GET`   | `/games?status=&platform=` | 200 `{ data: Game[], total }` |
| `PATCH` | `/games/:id/status` | 200 `{ data: Game }` (404 se não existir) |
| `GET`   | `/health`           | 200 `{ status: 'ok' }` |

## IGDB

- Autenticação via Twitch (client credentials): `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET` no `backend/.env` (modelo em `.env.example`).
- Sem credenciais, `server.ts` usa `NoCoverProvider` (sem capas) e a API funciona normalmente.
- `IgdbService` guarda o token até 1 min antes de expirar e o descarta ao receber 401.
- URL da capa: `https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg`.
- Os testes **nunca** chamam a IGDB real: use `FakeCoverProvider` ou um `fetch` falso.

## Testes — `backend/tests/`

- `unit/`: validators, services, repositórios (o de arquivo JSON usa pasta temporária).
- `integration/`: rotas HTTP com `supertest` sobre `createApp` + `InMemoryGameRepository` + `FakeCoverProvider`.
- `helpers/fakes.ts`: `FakeCoverProvider`, `makeGame`, `makeGamePayload`, `silentLogger`.
- Nomes de testes em português, descrevendo o comportamento.
- Toda funcionalidade nova precisa de teste unitário e, se mexer em rota, de teste de integração.

## Armazenamento

Por enquanto não há banco de dados. `JsonFileGameRepository` carrega o arquivo uma vez, mantém em memória e regrava o arquivo inteiro a cada alteração (escritas enfileiradas). O arquivo `backend/data/*.json` está no `.gitignore`. Para migrar para banco, crie outra implementação de `GameRepository` e troque em `server.ts`.

## Versões

- Node >= 20.12 (usa `process.loadEnvFile`).
- TypeScript fixado em `~6.0`: o `ts-jest` 29 ainda não suporta TypeScript 7. Não atualize sem checar o `peerDependencies` do `ts-jest`.
