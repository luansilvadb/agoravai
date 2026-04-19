---
name: specskill-apply-change
version: 1.0.0
description: >
  Implementa tarefas de uma mudança SpecSkill — da seleção até a
  validação do build. Ative ao iniciar, continuar ou retomar
  implementação de uma change.
triggers:
  - "implementar change"
  - "aplicar change"
  - "continuar implementação"
  - "começar tasks"
  - "/specskill:apply"
  - "specskill apply"
  - "retomar change"
---

# SPECSKILL APPLY CHANGE — Da tarefa ao build validado

> **Propósito**: Executar tarefas de uma change SpecSkill com resiliência
> completa — cada etapa tem tratamento de falha explícito, rollback
> automático e verificação de build antes de marcar conclusão.

## Filosofia Central

1. **Leitura antes de ação** — Nunca escreva código sem ler todos os `contextFiles`.
   Na prática: o primeiro erro de implementação sempre vem de contexto parcial.
2. **Verificação por tarefa** — Marque `[x]` apenas após confirmação objetiva.
   Na prática: "escrevi o código" não conta; "o arquivo existe e é sintaticamente válido" conta.
3. **Falha explícita, nunca silenciosa** — Se algo der errado, pare e reporte.
   Na prática: nunca tente contornar um erro — isso gera débito oculto.
4. **Mudança mínima cirúrgica** — Cada tarefa toca apenas o necessário.
   Na prática: se a tarefa pede "adicionar campo X", não refatore o arquivo inteiro.
5. **Build é contrato final** — Tarefas completas sem build passing são incompletas.
   Na prática: implementar tudo e não rodar build é entregar metade do trabalho.

## Quando Ativar

### ✅ Ativar para:
- Iniciar implementação de uma change com tarefas prontas
- Continuar implementação parcial (tarefas pendentes restantes)
- Retomar change pausada por bloqueio anterior
- Verificar progresso e prosseguir com tarefas restantes

### ❌ NÃO ativar para:
- Gerar artefatos ausentes (proposal, specs, design, tasks) → use `specskill-continue-change`
- Criar uma nova change do zero → use `specskill-create-change`
- Arquivar change completa → use `specskill-archive-change`
- Discutir design ou arquitetura sem implementar → responda diretamente

## Escopo e Limites

| Coberto por esta skill | Delegado para |
|---|---|
| Seleção de change e resolução de ambiguidade | — |
| Leitura e parse de saída CLI (`--json`) | — |
| Implementação de tarefas em código | — |
| Verificação de build pós-implementação | — |
| Detecção de problemas de design durante implementação | `specskill-continue-change` |
| Geração de artefatos ausentes | `specskill-continue-change` |
| Arquivamento pós-conclusão | `specskill-archive-change` |

### Inputs Aceitos
- Nome da change (string, opcional — inferido ou selecionado)
- Contexto conversacional (para inferir change ausente)
- Saída JSON dos comandos `npm run specskill:status` e `npm run specskill:instructions`

### Outputs Esperados
- Código implementado nos arquivos alvo das tarefas
- Tarefas marcadas `[x]` no arquivo de tasks
- Relatório de progresso formatado (ver Fase 6)
- Status do build (passing / failed + diagnóstico)

### Critérios de Parada
- Todas as tarefas concluídas **e** build passing → entrega final
- Bloqueio sem resolução possível → pausa com opções
- Usuário interrompe → pausa com estado salvo

### Fallbacks
- Tasks existem mas outros `contextFiles` faltam → avise, permita prosseguir (workflow fluido)
- Tasks file ausente → **PARE**, sem tarefas não há o que implementar
- Build indisponível (projeto sem build) → registre como N/A, não bloqueie

## Protocolo de Execução

### Fase 1 — Seleção da Change

1. **Identificar** a change:
   - Nome fornecido explicitamente → use-o diretamente
   - Nome ausente, contexto conversacional claro → infira
   - Nome ausente, sem contexto → execute `npm run specskill:list -- --json`

   **Exceções**:
   - `npm run specskill:list` falha (exit != 0) → reporte erro do CLI, não prossiga
   - `npm run specskill:list` retorna JSON vazio ou `[]` → informe que não há changes ativas
   - `npm run specskill:list` retorna múltiplas changes → use **AskUserQuestion** para seleção
   - Nome fornecido mas não aparece no `list` → informe com lista de disponíveis

2. **Anunciar** a seleção:
   ```
   Usando change: <name> (para trocar: /specskill:apply <outro-nome>)
   ```

### Fase 2 — Inspeção do Estado

3. **Obter status**:
   ```bash
   npm run specskill:status "<name>" --json
   ```

   **Parse obrigatório** — extraia:
   - `schemaName` (workflow em uso)
   - `state` (se existir no output)
   - Nome do artefato de tarefas (tipicamente "tasks", varia por schema)

   **Exceções**:
   - Exit code != 0 com mensagem "change not found" → change não existe, liste disponíveis
   - JSON malformado → reporte erro de parse, mostre raw output para diagnóstico
   - `schemaName` ausente ou desconhecido → pause, informe schema não suportado
   - Status indica change já arquivada → informe, sugira criar nova

4. **Obter instruções de apply**:
   ```bash
   npm run specskill:instructions "<name>" apply --json
   ```

   **Parse obrigatório** — extraia:
   - `contextFiles` (lista de caminhos)
   - `progress.total`, `progress.complete`, `progress.remaining`
   - `tasks` (lista com `status` de cada uma)
   - `state` (blocked | all_done | ready)
   - `dynamicInstruction` (instrução contextual do CLI)

   **Exceções por estado**:
   - `state: "blocked"` → mostre mensagem do CLI, sugira `npm run specskill:continue`, **PARE**
   - `state: "all_done"` → parabenize, sugira `npm run specskill:archive`, **PARE**
   - `state` ausente mas tasks pendentes existem → prossiga (fallback seguro)
   - JSON sem campo `tasks` → reporte erro estrutural, **PARE**
   - `progress.remaining: 0` mas estado != "all_done" → trate como all_done

### Fase 3 — Leitura de Contexto

5. **Ler cada arquivo** em `contextFiles`:

   **Para cada arquivo**:
   - Verifique existência com leitura — se falhar, registre como ausente
   - Se arquivo vazio (0 bytes) → registre como contexto vazio
   - Se arquivo contém apenas frontmatter sem corpo → registre como incompleto
   - Se arquivo referencia outros arquivos não listados → leia-os também (resiliência de referências)

   **Decisão baseada em resultado da leitura**:

   | Tasks legível? | Outros contextFiles? | Ação |
   |---|---|---|
   | ❌ | qualquer | **PARE** — sem tarefas não há implementação |
   | ✅ | todos presentes | prossiga normal |
   | ✅ | alguns ausentes | avise, permita prosseguir (workflow fluido) |
   | ✅ | nenhum presente | avise forte, confirme com usuário antes de prosseguir |

6. **Exibir progresso atual**:
   ```
   ## Implementando: <change-name> (schema: <schema-name>)
   Progresso: <complete>/<total> tarefas concluídas
   ```

### Fase 4 — Loop de Implementação

7. **Para cada tarefa pendente** (`status != "complete"`):

   **7a. Anunciar tarefa**:
   ```
   Trabalhando na tarefa <n>/<total>: <descrição>
   ```

   **7b. Analisar escopo da tarefa**:
   - Identificar arquivos a criar/modificar
   - Identificar dependências com tarefas anteriores
   - Se tarefa depende de tarefa anterior não concluída → **PARE**, reporte ordenação incorreta

   **7c. Implementar mudanças**:
   - Crie ou modifique apenas os arquivos necessários
   - Mantenha mudanças mínimas — não refatore além do escopo
   - Se implementação revela falha de design → **PARE**, sugira atualizar artefatos
   - Se arquivo alvo não existe e tarefa não menciona criação → **PARE**, pergunte antes de criar

   **7d. Verificação pós-tarefa**:
   - Arquivos mencionados na tarefa existem? ✓
   - Código é sintaticamente válido? ✓ (se linguagem permitir verificação rápida)
   - Não há imports/referências quebradas introduzidas? ✓

   **Se verificação falhar** → **PARE**, reporte o que falhou, não marque como completa

   **7e. Marcar tarefa completa**:
   - No arquivo de tasks, altere `- [ ]` → `- [x]` para a tarefa correspondente
   - Confirme que exatamente um checkbox foi alterado
   - Se pattern de checkbox não corresponder → reporte formato inesperado, mostre a linha

   ```
   ✓ Tarefa completa
   ```

### Fase 5 — Verificação de Build

8. **Identificar** o comando de build do projeto:
   - Verifique `package.json` → scripts: `build`, `compile`, `tsc`
   - Verifique `Makefile` → target padrão ou `build`
   - Verifique `Cargo.toml` → `cargo build`
   - Verifique `pyproject.toml` → `python -m build` ou `pytest`
   - Verifique `go.mod` → `go build ./...`
   - Se nenhum encontrado → pergunte ao usuário

   **Exceção**: Projeto sem build definido (ex: config, markdown, dados) → pule esta fase, registre `Build: N/A (projeto sem step de build)` no output final

9. **Executar build**:
   ```bash
   <comando-de-build> 2>&1
   ```

   **Resultado → Ação**:

   | Resultado | Ação |
   |---|---|
   | Passa (exit 0, sem erros) | Prossiga para Fase 6 |
   | Falha com erro de sintaxe em arquivo desta sessão | Volte à tarefa causadora, corrija, re-build |
   | Falha com erro de dependência (pacote faltando, versão) | Reporte, não tente resolver (fora de escopo) |
   | Falha com erro ambíguo ou não relacionado | Mostre output completo, **PARE** para orientação |
   | Timeout (>120s) | Interrompa, reporte, sugira investigação manual |

   **Loop de correção** (apenas para erros claramente atribuíveis a esta sessão):
   1. Identifique a tarefa causadora (mensagem de erro + diff)
   2. Corrija o código
   3. Re-execute build
   4. **Máximo 3 tentativas** → se não resolver, **PARE** e reporte com diagnóstico

### Fase 6 — Conclusão

10. **Exibir resultado final**:

    **Caso A — Todas as tarefas concluídas E build passing**:
    ```
    ## Implementação Completa

    **Change:** <name>
    **Schema:** <schema-name>
    **Progresso:** <total>/<total> tarefas concluídas ✓
    **Build:** passing ✓

    ### Concluídas nesta sessão
    - [x] Tarefa 1
    - [x] Tarefa 2
    ...

    Todas as tarefas completas! Pronta para arquivar.
    ```

    **Caso B — Todas as tarefas concluídas, build N/A**:
    ```
    ## Implementação Completa

    **Change:** <name>
    **Schema:** <schema-name>
    **Progresso:** <total>/<total> tarefas concluídas ✓
    **Build:** N/A (projeto sem step de build)

    ### Concluídas nesta sessão
    - [x] Tarefa 1
    ...

    Todas as tarefas completas! Pronta para arquivar.
    ```

    **Caso C — Pausada por bloqueio**:
    ```
    ## Implementação Pausada

    **Change:** <name>
    **Progresso:** <complete>/<total> tarefas concluídas

    ### Motivo do bloqueio
    <descrição clara do problema>

    ### Opções
    1. <opção concreta com comando/skill>
    2. <opção concreta com comando/skill>
    3. Outra abordagem

    O que deseja fazer?
    ```

## Padrões Específicos

### Parse Seguro de JSON do CLI

**Regra**: Sempre envolva parse de `--json` em tratamento de falha — nunca assuma que o output é JSON válido.

```bash
# ✅ PASS — valida exit code E integridade do JSON
OUTPUT=$(npm run specskill:status "feat-login" --json 2>&1)
if [ $? -ne 0 ]; then
  echo "ERRO: CLI falhou com exit code $?"
  echo "$OUTPUT"
  exit 1
fi
echo "$OUTPUT" | jq -e '.schemaName' > /dev/null 2>&1 || {
  echo "ERRO: Output não é JSON válido ou falta campo schemaName"
  echo "$OUTPUT"
  exit 1
}

# ❌ FAIL — pipe direto sem validação
SCHEMA=$(npm run specskill:status "feat-login" --json | jq '.schemaName')
# Se CLI falhar, $SCHEMA conterá mensagem de erro como string
# Se JSON for malformado, jq falha silenciosamente e $SCHEMA fica vazia
```

**Por que importa**: Mensagens de erro do CLI (stderr) podem ser capturadas como pseudo-JSON, causando falhas em cascata em todos os parses subsequentes.

---

### Marcação de Tarefa — Checkbox Exato

**Regra**: Altere exatamente um `- [ ]` para `- [x]` por tarefa. Nunca reescreva o arquivo inteiro.

```markdown
<!-- ✅ PASS — alteração cirúrgica de uma linha -->
- [ ] Implementar validação de email
- [x] Criar endpoint POST /auth/login     ← apenas esta linha mudou
- [ ] Adicionar testes de integração

<!-- ❌ FAIL — reescreveu seção, perdeu formatação e ordem -->
- [x] implementar validacao de email
- [x] criar endpoint
- [ ] adicionar testes
```

**Por que importa**: Reescrita parcial perde metadados, quebra ordem alfabética/sequencial e destrói rastreabilidade via diff.

---

### Verificação de Build com Limite de Retry

**Regra**: Execute build após todas as tarefas. Se falhar por erro desta sessão, corrija e re-execute — máximo 3 tentativas.

```bash
# ✅ PASS — loop com limite e captura de output
BUILD_CMD="npm run build"
BUILD_LOG=""

for i in 1 2 3; do
  BUILD_LOG=$($BUILD_CMD 2>&1)
  if [ $? -eq 0 ]; then
    echo "Build passing na tentativa $i"
    break
  fi
  echo "Build falhou (tentativa $i/3):"
  echo "$BUILD_LOG" | tail -20
  if [ $i -eq 3 ]; then
    echo "ERRO: Build não passou após 3 tentativas. Último output acima."
    exit 1
  fi
  echo "Tentando correção automática..."
  # ... correção baseada no erro ...
done

# ❌ FAIL — implementa tudo, não roda build, marca completo
# (sem verificação nenhuma)
```

**Por que importa**: Código "completo" que não compila é pior que código não escrito — gera falsa confiança e bloqueia quem pegar a change depois.

---

### Tratamento de ContextFile Ausente

**Regra**: Se o tasks file está ausente → pare. Se outros contextFiles faltam → avise mas permita prosseguir (workflow fluido).

```
# ✅ PASS — decisão diferenciada baseada em criticidade do arquivo
ERRO CRÍTICO: Tasks file ausente
  Esperado: .specskill/changes/feat-login/tasks.md
  Ação: não é possível implementar sem lista de tarefas
  → Use npm run specskill:continue para gerar tasks

---

AVISO: ContextFile secundário ausente
  Ausente: .specskill/changes/feat-login/design.md
  Tasks file encontrado: ✓ (3 tarefas pendentes)
  Ação: prosseguindo sem design.md — implementação pode estar
        incompleta sem contexto de design. Confirme se deseja continuar.
```

```
# ❌ FAIL — trata todo arquivo ausente como bloqueante
ERRO: Arquivo ausente: design.md
Implementação cancelada.
```

**Por que importa**: O SpecSkill suporta workflow fluido onde tarefas podem existir antes de todos os artefatos. Bloquear por arquivo secundário quebra esse modelo.

---

### Detecção de Falha de Design Durante Implementação

**Regra**: Se ao implementar você descobre contradição entre artefatos, pause e sugira correção — nunca decida por conta própria.

```
# ✅ PASS — pause com diagnóstico e opções
## Implementação Pausada

**Tarefa:** Adicionar campo `user_id` nullable à tabela `orders`
**Problema:** Contradição entre artefatos
  - specs.md linha 12: "user_id é obrigatório em toda order"
  - tasks.md tarefa 4: "tornar user_id nullable"

**Opções:**
1. Atualizar specs.md para refletir nullable → use npm run specskill:continue
2. Atualizar tasks.md para remover nullable → use npm run specskill:continue
3. Esclarecer com você antes de mudar artefatos

# ❌ FAIL — decide sozinho e implementa uma interpretação
# (introduz inconsistência silenciosa entre spec e código)
```

**Por que importa**: Decisões unilaterais sobre contradições criam débito técnico descoberto tarde — em review ou em produção.

---

### Identificação de Comando de Build

**Regra**: Detecte o build command inspecionando arquivos de configuração do projeto. Se não encontrar, pergunte — nunca assuma.

```
# ✅ PASS — verificação em ordem de probabilidade
1. package.json → "scripts.build" = "tsc && vite build" → encontrado ✓
2. (não precisou verificar Makefile, Cargo.toml, etc.)

# ✅ PASS — nenhum encontrado, pergunta ao usuário
Verifiquei package.json, Makefile, Cargo.toml, pyproject.toml, go.mod
— nenhum comando de build identificado.
Qual comando de build devo usar para este projeto?

# ❌ FAIL — assume npm sem verificar
$ npm run build
npm ERR! Could not find a package.json
```

**Por que importa**: Projetos Python, Rust, Go não usam npm. Assumir errado desperdiça uma tentativa de build e gera confusão.

## Anti-Padrões Críticos

| Anti-padrão | Consequência | Alternativa correta |
|---|---|---|
| Implementar sem ler todos os `contextFiles` | Código diverge da spec, retrabalho garantido | Ler 100% dos arquivos listados antes de tocar em código |
| Marcar `[x]` antes de verificar que o código funciona | Progresso falso, build quebra depois | Verificar existência + sintaxe antes de marcar |
| Ignorar erro do CLI e tentar continuar | Falhas em cascata, comportamento imprevisível | Tratar cada exit code != 0 como bloqueante |
| Refatorar além do escopo da tarefa | Diff poluído, difícil de review, risco de regressão | Mudar apenas o estritamente necessário |
| Build falha e você "deixa pra depois" | Próxima pessoa perde tempo diagnosticando | Corrigir na hora ou pausar com diagnóstico claro |
| Pular tarefa "difícil" e ir para a próxima | Dependências quebram, ordenação inconsistente | Resolver na ordem ou pausar reportando o bloqueio |
| Assumir schema "spec-driven" sem verificar | Lê arquivo errado, implementa spec equivocada | Sempre ler `schemaName` do `status --json` |
| Criar arquivo não mencionado na tarefa sem perguntar | Arquivos órfãos, surpresa para o time | Pausar e confirmar antes de criar |
| Tratar todo `contextFile` ausente como bloqueante | Quebra workflow fluido do SpecSkill | Diferenciar tasks (crítico) de outros (secundários) |
| Tentar resolver erro de dependência de pacote | Mudanças fora de escopo, efeitos colaterais | Reporte e deixe o usuário resolver |
| Reescrever arquivo de tasks inteiro ao marcar checkbox | Perde formatação, ordem, metadados | Edição cirúrgica de uma linha por tarefa |

## Critérios de Qualidade

Antes de declarar "Implementação Completa", confirme:

- [ ] Change selecionada sem ambiguidade (ou ambiguidade resolvida com usuário)
- [ ] `npm run specskill:status "$NAME" --json` parseado sem erro, `schemaName` identificado
- [ ] `npm run specskill:instructions -- apply --json` parseado sem erro, estado verificado
- [ ] Tasks file lido com sucesso (arquivo existe e contém tarefas)
- [ ] Outros `contextFiles` lidos ou ausência registrada com aviso
- [ ] Cada tarefa implementada com mudança mínima e cirúrgica
- [ ] Cada tarefa marcada `[x]` após verificação (arquivo existe, sintaxe ok)
- [ ] Nenhuma tarefa pulada ou reordenada sem justificativa
- [ ] Nenhuma contradição entre artefatos ignorada silenciosamente
- [ ] Build executado após última tarefa (ou registrado como N/A com justificativa)
- [ ] Se build falhou: máximo 3 tentativas de correção, pausa com diagnóstico
- [ ] Output final inclui progresso exato + lista de tarefas + status do build
- [ ] Se pausado: motivo claro + opções concretas para desbloqueio

## Referências Cruzadas

| Precisa de... | Use a skill... |
|---|---|
| Gerar artefatos ausentes (proposal, specs, design, tasks) | `npm run specskill:continue` |
| Criar uma nova change do zero | `npm run specskill:new "$NAME" --force` |
| Arquivar change completa | `npm run specskill:archive` |
| Listar e inspecionar changes existentes | CLI direto: `npm run specskill:list -- --json` |
| Padrões de código para a implementação | Skill específica do stack (`frontend-design`, `backend-patterns`, etc.) |

## Exemplo Completo — Fluxo Feliz

**Input**: `implementar change`

```
## Implementando: feat-user-auth (schema: spec-driven)
Progresso: 0/4 tarefas concluídas

Trabalhando na tarefa 1/4: Criar modelo User com campos email, password_hash, created_at
[...cria src/models/user.ts...]
 Tarefa completa

Trabalhando na tarefa 2/4: Criar endpoint POST /auth/register
[...cria src/routes/auth.ts com handler...]
 Tarefa completa

Trabalhando na tarefa 3/4: Adicionar validação de email no endpoint
[...adiciona validação no handler existente...]
 Tarefa completa

Trabalhando na tarefa 4/4: Criar testes unitários para validação de email
[...cria src/routes/__tests__/auth.test.ts...]
 Tarefa completa

Verificando build (npm run build)...
Build passing 

## Implementação Completa

**Change:** feat-user-auth
**Schema:** spec-driven
**Progresso:** 4/4 tarefas concluídas 
**Build:** passing 

### Concluídas nesta sessão
- [x] Criar modelo User com campos email, password_hash, created_at
- [x] Criar endpoint POST /auth/register
- [x] Adicionar validação de email no endpoint
- [x] Criar testes unitários para validação de email

Todas as tarefas completas! Pronta para arquivar.
```

## Exemplo — Fluxo com Bloqueio em Build

**Input**: `/specskill:apply feat-payment`

```
Usando change: feat-payment (para trocar: /specskill:apply <outro-nome>)

## Implementando: feat-payment (schema: spec-driven)
Progresso: 0/3 tarefas concluídas

Trabalhando na tarefa 1/3: Criar serviço PaymentService
[...cria src/services/PaymentService.ts...]
 Tarefa completa

Trabalhando na tarefa 2/3: Integrar PaymentService no checkout
[...modifica src/routes/checkout.ts...]
 Tarefa completa

Trabalhando na tarefa 3/3: Adicionar tipagem para valor monetário
[...cria src/types/Money.ts...]
 Tarefa completa

Verificando build (npm run build)...
Build falhou (tentativa 1/3):
  src/routes/checkout.ts:15:42 - error TS2304: Cannot find name 'Money'.

Tentando correção automática...
[...identifica que checkout.ts usa Money mas não importa o tipo...]
[...adiciona import { Money } from '../types/Money' em checkout.ts...]

Build falhou (tentativa 2/3):
  src/types/Money.ts:8:12 - error TS2322: Type 'string' is not assignable to type 'number'.

Tentando correção automática...
[...identifica que campo amount está como string mas interface exige number...]
[...corrige tipo em Money.ts...]

Build passing na tentativa 3 

## Implementação Completa

**Change:** feat-payment
**Schema:** spec-driven
**Progresso:** 3/3 tarefas concluídas 
**Build:** passing (após 3 tentativas de correção)

### Concluídas nesta sessão
- [x] Criar serviço PaymentService
- [x] Integrar PaymentService no checkout
- [x] Adicionar tipagem para valor monetário

Todas as tarefas completas! Pronta para arquivar.
```

## Exemplo — Fluxo com Bloqueio Sem Resolução

**Input**: `continuar implementação de feat-notification`

```
Usando change: feat-notification (para trocar: /specskill:apply <outro-nome>)

## Implementando: feat-notification (schema: spec-driven)
Progresso: 2/5 tarefas concluídas

Trabalhando na tarefa 3/5: Configurar fila RabbitMQ para notificações
[...analisa tasks.md e specs.md...]
[...percebe que specs.md menciona "usar Redis Streams" mas tasks.md diz "RabbitMQ"...]

## Implementação Pausada

**Change:** feat-notification
**Progresso:** 2/5 tarefas concluídas

### Motivo do bloqueio
Contradição entre artefatos na tarefa 3:
  - specs.md (linha 27): "Infraestrutura de mensageria: Redis Streams"
  - tasks.md (tarefa 3): "Configurar fila RabbitMQ para notificações"

  Não é possível determinar qual tecnologia usar sem atualizar um dos artefatos.

### Opções
1. Atualizar specs.md para RabbitMQ → use npm run specskill:continue feat-notification
2. Atualizar tasks.md para Redis Streams → use npm run specskill:continue feat-notification
3. Você me diz qual tecnologia usar e eu atualizo o artefato correto

O que deseja fazer?