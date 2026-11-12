# Referência — Revisão de Projeto

Este documento contém os critérios detalhados utilizados pela Skill `revisao-projeto`. Ele é carregado somente quando necessário, mantendo o `SKILL.md` focado no acionamento e no fluxo principal.

## 1. Escopo da revisão

A revisão é exploratória e somente de leitura. Seu propósito é ajudar alguém a entender a organização do repositório e encontrar oportunidades concretas de melhoria.

Avalie, quando os arquivos estiverem presentes:

- **Propósito:** o README explica o problema que o projeto resolve?
- **Instalação e execução:** existem instruções suficientes para iniciar o projeto?
- **Organização:** nomes e pastas indicam responsabilidades compreensíveis?
- **Configuração:** variáveis e configurações necessárias estão documentadas sem expor segredos?
- **Dependências:** há arquivos de dependência ou manifesto coerentes com a tecnologia identificada?
- **Testes:** há estrutura ou instruções de testes? Não presuma que ausência de testes significa ausência de qualidade; registre apenas o que observou.
- **Consistência:** documentação, scripts e estrutura apontam para os mesmos caminhos e comandos?
- **Manutenção:** há arquivos duplicados, responsabilidades confusas ou instruções contraditórias?

## 2. Regras de evidência

1. Toda afirmação específica deve estar apoiada em um arquivo ou caminho observado.
2. Não afirme que o programa funciona ou falha sem executar testes — e esta Skill não executa comandos.
3. Não conclua que uma tecnologia está em uso apenas porque aparece mencionada em um texto antigo; procure arquivos de configuração e código que confirmem.
4. Não exponha valores de `.env`, tokens, chaves ou credenciais. Se encontrar arquivos que aparentem conter segredos, informe apenas o caminho e recomende revisão segura.
5. Diferencie:
   - **Fato:** diretamente visível nos arquivos.
   - **Indício:** evidência parcial que sugere algo, mas não confirma.
   - **Não verificado:** depende de execução, acesso ou contexto indisponível.

## 3. Critérios de prioridade

### Alta
Use quando o problema compromete a capacidade básica de entender, configurar ou manter o projeto. Exemplos:
- README sem qualquer explicação do projeto;
- comando de inicialização documentado aponta para arquivo inexistente;
- configuração essencial referenciada pela documentação não está presente.

### Média
Use quando há risco ou atrito significativo, mas o projeto ainda pode ser compreendido:
- instruções incompletas;
- nomes ou responsabilidades inconsistentes;
- ausência de orientação para testes;
- documentação que diverge parcialmente da estrutura.

### Baixa
Use para melhorias não bloqueantes:
- títulos pouco claros;
- pequenas melhorias de organização;
- exemplos adicionais que facilitariam o uso.

A prioridade deve considerar o impacto observado, não a quantidade de arquivos envolvidos.

## 4. Exemplos de achados bem escritos

**Médio — instruções de execução incompletas**

- Evidência: `README.md`.
- Observação: o documento descreve o objetivo, mas não apresenta os passos para instalar dependências ou iniciar a aplicação.
- Impacto provável: uma pessoa nova pode não conseguir reproduzir o ambiente sem ajuda.

**Baixo — nomes pouco descritivos**

- Evidência: `src/utils/`.
- Observação: há módulos com nomes genéricos cuja responsabilidade não fica clara apenas pela estrutura.
- Impacto provável: aumenta o esforço para localizar funcionalidades. É necessário ler os arquivos antes de propor renomeações.

## 5. Limites

Esta revisão não substitui:
- execução de testes automatizados;
- análise estática especializada;
- auditoria de segurança;
- revisão de arquitetura com requisitos de negócio;
- validação de desempenho;
- confirmação de comportamento em produção.

Quando esses pontos forem relevantes, recomende uma etapa específica de validação, sem alegar que ela foi realizada.
