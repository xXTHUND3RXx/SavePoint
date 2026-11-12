# Decisão de escopo — MCP do SavePoint

## Contexto
O SavePoint é uma biblioteca pessoal de jogos. Seu README descreve cadastro, listagem, atualização de progresso e filtros por status e plataforma. O backend usa Node.js, TypeScript e Express, com API local na porta 3333 e armazenamento em JSON.

## Problema
Quem possui jogos em várias plataformas pode ter dificuldade para consultar rapidamente o que ainda não começou, o que está jogando e o que já concluiu, além de atualizar o progresso.

## Solução
Criar um servidor MCP em Node.js/TypeScript, usando transporte stdio, que chama a API existente do SavePoint. O MCP não cria outra base de dados nem altera diretamente o arquivo JSON: usa as rotas já documentadas pelo projeto.

## Ferramentas
1. `listar_jogos`: consulta `GET /games`; aceita filtros opcionais `status` (`BACKLOG`, `PLAYING`, `COMPLETED`) e `platform` (até 80 caracteres).
2. `atualizar_status_jogo`: chama `PATCH /games/:id/status`; recebe ID inteiro positivo e um dos três status válidos. O ID deve ser obtido pela listagem.

## Segurança e limites
- Parâmetros validados por esquema; status restrito aos valores aceitos pelo SavePoint.
- ID deve ser inteiro positivo; plataforma limitada a 80 caracteres.
- Não há campo de instrução livre, execução de código, comandos ou consultas arbitrárias.
- Entradas são tratadas como dados e enviadas somente às rotas específicas.
- A URL padrão é `http://localhost:3333`; por segurança, somente HTTP local (`localhost`, `127.0.0.1` ou `::1`) é aceito.
- O MCP não acessa diretamente o arquivo JSON nem credenciais da IGDB.

## Critérios de validação
Compilar; iniciar o backend; conectar no Claude Code; confirmar `/mcp`; testar listagem com e sem filtros; atualizar o status de um jogo de teste; testar entradas inválidas e registrar os resultados em `LOG-INJECTION-TEMPLATE.md`.

## Limite desta implementação
A implementação foi preparada com base nas rotas e nos status descritos no README. Como o código-fonte completo do backend não foi enviado, a compatibilidade do formato de resposta e o funcionamento real precisam ser confirmados no ambiente local.
