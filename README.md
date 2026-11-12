# SavePoint

> Quem tem muitos jogos em vários consoles e no computador acaba esquecendo quais já terminou, quais está jogando e quais ainda quer começar. O SavePoint junta tudo em uma lista só.

O SavePoint é uma biblioteca pessoal de jogos: você registra seus jogos, marca em que ponto está em cada um e encontra rapidinho o que jogar a seguir.

## O que já dá para fazer

- **Cadastrar jogos**: registrar nome, gênero, plataforma, horas jogadas e capa.
- **Listar jogos**: ver todos os jogos da biblioteca.
- **Atualizar o progresso**: marcar se o jogo ainda não foi começado, está sendo jogado ou foi concluído.
- **Filtrar jogos**: buscar por progresso ou por plataforma.

As capas dos jogos vêm automaticamente da [IGDB](https://www.igdb.com/), um grande catálogo público de jogos.

## Estrutura do projeto

```
SavePoint/
├── backend/          API (Node.js + TypeScript + Express)
│   ├── src/          código da aplicação
│   ├── tests/        testes automatizados (Jest)
│   └── data/         onde os jogos ficam salvos (arquivo JSON local)
└── frontend/         (em breve)
```

## Como rodar

Requisitos: [Node.js](https://nodejs.org/) 20.12 ou mais recente.

```bash
cd backend
npm install
cp .env.example .env   # opcional: preencha as chaves da IGDB para buscar capas
npm run dev            # API em http://localhost:3333
```

Sem as chaves da IGDB a API funciona normalmente, só não busca as capas sozinha.
Para obter as chaves, crie um app em <https://dev.twitch.tv/console/apps> (a IGDB usa login da Twitch).

## Como rodar os testes

Da raiz do projeto:

```bash
npm test
```

Ou dentro de `backend/`:

| Comando                    | O que faz                               |
| -------------------------- | --------------------------------------- |
| `npm test`                 | roda todos os testes                    |
| `npm run test:unit`        | só os testes unitários                  |
| `npm run test:integration` | só os testes das rotas da API           |
| `npm run test:coverage`    | todos os testes com relatório de cobertura |
| `npm run typecheck`        | verifica os tipos do TypeScript         |

## API

| Método  | Rota                | Função                |
| ------- | ------------------- | --------------------- |
| `POST`  | `/games`            | Cadastrar jogo        |
| `GET`   | `/games`            | Listar jogos (aceita `?status=` e `?platform=`) |
| `PATCH` | `/games/:id/status` | Atualizar status      |

### Status de progresso

| Valor       | Significado        |
| ----------- | ------------------ |
| `BACKLOG`   | Ainda não começou  |
| `PLAYING`   | Está jogando       |
| `COMPLETED` | Jogo concluído     |

### Exemplos

Cadastrar um jogo (`externalId` é o id do jogo na IGDB; `status`, `hoursPlayed` e `coverUrl` são opcionais):

```bash
curl -X POST http://localhost:3333/games \
  -H "Content-Type: application/json" \
  -d '{"externalId": 1942, "title": "The Witcher 3: Wild Hunt", "genre": "RPG", "platform": "PC"}'
```

```json
{
  "data": {
    "id": 1,
    "externalId": 1942,
    "title": "The Witcher 3: Wild Hunt",
    "genre": "RPG",
    "platform": "PC",
    "status": "BACKLOG",
    "hoursPlayed": 0,
    "coverUrl": "https://images.igdb.com/igdb/image/upload/t_cover_big/....jpg",
    "statusLabel": "Ainda não começou"
  }
}
```

Listar só os jogos de PC que estão sendo jogados:

```bash
curl "http://localhost:3333/games?status=PLAYING&platform=PC"
```

Marcar um jogo como concluído:

```bash
curl -X PATCH http://localhost:3333/games/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
```

Erros sempre voltam no formato `{ "error": { "message": "...", "details": ["..."] } }`.
