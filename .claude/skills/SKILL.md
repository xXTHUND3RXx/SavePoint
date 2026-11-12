---
name: revisao-projeto
description: Examina a estrutura, documentação e código de um repositório para identificar problemas de organização, inconsistências e oportunidades de melhoria. Use quando o usuário pedir uma revisão geral, diagnóstico ou explicação técnica do projeto.
allowed-tools: Read, Grep, Glob
---

# Revisão de Projeto

## Objetivo
Produzir um diagnóstico fundamentado do repositório atual, sem alterar arquivos.

## Quando utilizar
Use esta habilidade quando o usuário solicitar:
- uma revisão geral do projeto;
- um diagnóstico da organização dos arquivos;
- uma avaliação da documentação;
- uma análise inicial para entender como o projeto está estruturado;
- sugestões priorizadas de melhoria.

Não use esta habilidade como substituta de uma revisão de segurança especializada, auditoria de dependências ou execução de testes.

## Procedimento
1. Identifique a raiz do repositório e examine a estrutura com `Glob`.
2. Localize documentação e arquivos de configuração relevantes, como README, arquivos de dependências e configurações de build.
3. Leia apenas os arquivos necessários para compreender o propósito, a arquitetura aparente e os fluxos principais.
4. Procure inconsistências entre a documentação e os arquivos existentes.
5. Identifique problemas observáveis de organização, duplicação, ausência de instruções ou pontos que dificultem manutenção.
6. Para cada achado, indique o arquivo ou caminho que sustenta a observação. Não invente linhas, arquivos, comandos ou comportamentos.
7. Classifique cada achado como:
   - **Alta prioridade:** impede entendimento, execução ou manutenção básica;
   - **Média prioridade:** gera risco de erro ou dificulta manutenção;
   - **Baixa prioridade:** melhoria de clareza ou organização.
8. Separe fatos observados de hipóteses. Quando não houver evidência suficiente, declare a limitação.
9. Não modifique arquivos, não execute comandos e não instale dependências. Esta habilidade é somente de leitura.
10. Finalize com até cinco ações recomendadas, ordenadas por prioridade.

## Formato obrigatório da resposta
### 1. Visão geral
Resuma o propósito aparente e as tecnologias identificadas. Se não for possível determinar, diga isso explicitamente.

### 2. Estrutura encontrada
Liste os diretórios e arquivos mais relevantes e explique suas funções observáveis.

### 3. Achados
Para cada achado, informe:
- prioridade;
- evidência (caminho do arquivo);
- problema observado;
- impacto provável.

### 4. Limitações
Informe o que não pôde ser verificado por falta de arquivos, contexto ou ferramentas.

### 5. Próximas ações
Apresente recomendações concretas e ordenadas.

## Referência detalhada
Consulte [reference.md](reference.md) para os critérios de análise, exemplos de evidência e regras de priorização.
