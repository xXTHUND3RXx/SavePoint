# MCP do SavePoint

Servidor MCP local para consultar a biblioteca SavePoint e atualizar o progresso dos jogos usando a API já existente.

## Ferramentas
- `listar_jogos`: lista todos os jogos ou filtra por status e/ou plataforma.
- `atualizar_status_jogo`: altera o status para `BACKLOG`, `PLAYING` ou `COMPLETED`.

## Requisitos
- Node.js 20.12 ou mais recente.
- Backend SavePoint em execução em `http://localhost:3333`.
- Claude Code instalado para o teste de integração.

## Instalar e compilar
No terminal, a partir da raiz do projeto:

```bash
cd mcp/savepoint-mcp-server
npm install
npm run build
```

## Iniciar o backend
Em outro terminal, a partir da raiz do projeto:

```bash
cd backend
npm install
npm run dev
```

## Conectar ao Claude Code
O servidor já está registrado no arquivo `.mcp.json` da raiz do projeto. Depois de compilar, abra o Claude Code na raiz do projeto, aprove o servidor `savepoint` quando for perguntado e execute `/mcp` para confirmar que ele aparece conectado.

## Exemplos
- "Liste todos os jogos da minha biblioteca."
- "Quais jogos estou jogando?"
- "Liste os jogos de PC que ainda não comecei."
- "Marque o jogo de ID 1 como concluído."

Consulte a listagem antes de atualizar para confirmar o ID.

## URL da API
O padrão é `http://localhost:3333`. Para mudar a porta local:

PowerShell:
```powershell
$env:SAVEPOINT_API_URL="http://localhost:3333"
```

Linux/macOS:
```bash
SAVEPOINT_API_URL=http://localhost:3333
```

Por segurança, somente endereços HTTP locais são aceitos.

## Testes
1. Execute `npm run build`.
2. Inicie o backend.
3. Conecte o MCP e confirme `/mcp`.
4. Teste listagem geral e filtros.
5. Teste atualização usando um jogo de teste.
6. Teste entradas inválidas e registre em `docs/LOG-INJECTION-TEMPLATE.md`.
7. Use o MCP Inspector para inspecionar ferramentas e testar entradas.

## Rotas usadas
- `GET /games`
- `PATCH /games/:id/status`

A implementação segue as rotas e os status documentados no README do SavePoint. O formato de resposta foi conferido contra o backend deste repositório (`{ data, total }` na listagem e `{ data }` na atualização).

## Documentos
- [`docs/DECISAO-ESCOPO.md`](docs/DECISAO-ESCOPO.md): por que o MCP existe e quais são seus limites.
- [`docs/LOG-INJECTION-TEMPLATE.md`](docs/LOG-INJECTION-TEMPLATE.md): registro dos testes com entradas fora do esperado.
