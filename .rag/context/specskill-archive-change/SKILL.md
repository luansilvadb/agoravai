---
name: specskill-archive-change
version: 1.0.0
description: >
  Arquiva uma change concluída no workflow experimental do specskill.
  Valida conclusão de artefatos e tarefas, avalia sincronização de delta specs,
  e move o diretório para archive com nome datado. Ative ao finalizar uma change.
triggers:
  - "arquivar change"
  - "finalizar change"
  - "archive change"
  - "concluir change"
  - "/archive-change"
scope:
  primary: ["specskill", "change lifecycle", "archive"]
  delegates: ["specskill-sync-specs para sincronização de specs", "specskill-create-change para criação de nova change"]
quality_bar: high
---

# SPECSKILL ARCHIVE CHANGE — Arquivamento seguro de changes concluídas

> **Propósito**: Executar o arquivamento de uma change com validação completa
> de pré-requisitos, avaliação de delta specs, e movimentação segura para archive —
> nunca silenciosamente, sempre com confirmação explícita do usuário.

---

## Filosofia Central

1. **Nunca auto-selecionar** — O usuário escolhe a change. Inferência contextual é aceita; seleção automática não.
   Na prática: se o nome não for explícito ou unívoco, sempre execute `npm run specskill:list -- --json` e apresente seleção.

2. **Avisar não é bloquear** — Incomplete artifacts e tarefas geram warnings + confirmação, nunca falha.
   Na prática: use `AskUserQuestion` com opção explícita de prosseguir mesmo com itens pendentes.

3. **Preservar estado original** — Arquivamento move, não copia. O diretório deve permanecer intacto no destino.
   Na prática: use `mv` atômico, nunca `cp + rm`, e valide que `.specskill.yaml` acompanhou.

4. **Sincronizar é opcional mas visível** — Delta specs existentes exigem avaliação e prompt, mas o usuário pode pular.
   Na prática: sempre mostre o diff resumido antes de perguntar; nunca sincronize silenciosamente.

5. **Falha é informação, não erro fatal** — Toda falha de sistema deve ter mensagem acionável.
   Na prática: nunca retorne "erro desconhecido"; sempre inclua o comando que falhou e a ação sugerida.

---

## Quando Ativar

### ✅ Ativar para:
- Usuário solicita arquivar/finalizar/concluir uma change por nome
- Usuário solicita arquivar sem especificar nome (inferir ou listar)
- Fluxo de workflow indica que uma change está pronta para archive

### ❌ NÃO ativar para:
- Criar nova change → use `specskill-create-change`
- Sincronizar specs sem arquivar → use `specskill-sync-specs`
- Listar changes sem intenção de arquivar → responda diretamente com `npm run specskill:list -- --json`
- Reverter arquivamento → responda diretamente com `mv specskill/changes/archive/<name> specskill/changes/<name>`

---

## Escopo e Limites

| Esta skill cobre | Esta skill delega |
|---|---|
| Seleção de change via prompt | Sincronização de delta specs → `specskill-sync-specs` |
| Validação de artefatos via CLI | Criação de nova change → `specskill-create-change` |
| Validação de tarefas via filesystem | Modificação de specs manuais → edição direta |
| Avaliação de delta specs (leitura) | Resolução de conflitos de sync → `specskill-sync-specs` |
| Movimentação para archive | |

---

## Protocolo de Execução

### PASSO 1 — Resolver o nome da change

**Condição de entrada**: Nome fornecido explicitamente pelo usuário.

```
1.1. Usar o nome fornecido diretamente.
1.2. Validar que o diretório specskill/changes/<name> existe.
     → Se não existe: falhar com erro listando changes disponíveis (ver 1.3).
1.3. Prosseguir para PASSO 2.
```

**Condição de entrada**: Nome não fornecido.

```
1.1. Executar: npm run specskill:list -- --json
1.2. [RESILIÊNCIA] Se o comando falhar:
     - Erro de CLI não encontrado: falhar com "CLI não está instalado ou não está no PATH"
     - JSON inválido: falhar com "Output de change:list não é JSON válido. Stderr: <stderr>"
     - Exit code != 0: falhar com "change:list retornou erro (exit <code>): <stderr>"
1.3. Filtrar a lista para changes ativas (excluir as que estão em specskill/changes/archive/).
1.4. [CASO DE EXCEÇÃO] Se nenhuma change ativa encontrada:
     - Informar "Nenhuma change ativa para arquivar."
     - Parar execução aqui.
1.5. [CASO DE EXCEÇÃO] Se exatamente 1 change ativa encontrada:
     - Mostrar o nome e schema da change
     - Usar AskUserQuestion: "Única change ativa encontrada: <name>. Arquivar esta?"
     - Se não: parar. Se sim: usar este nome e prosseguir para PASSO 2.
1.6. Se múltiplas changes ativas:
     - Usar AskUserQuestion com lista de nomes + schema de cada uma
     - Aguardar seleção do usuário
     - Prosseguir para PASSO 2 com o nome selecionado.
```

**Critério de conclusão**: Variável `CHANGE_NAME` definida com valor válido confirmado pelo usuário.

---

### PASSO 2 — Verificar status de artefatos

```
2.1. Executar: npm run specskill:status -- --change "<CHANGE_NAME>" --json
2.2. [RESILIÊNCIA] Se o comando falhar:
     - Change não encontrada: falhar com "Change '<CHANGE_NAME>' não encontrada"
     - JSON inválido: falhar com "Output de change:status não é JSON válido. Stderr: <stderr>"
     - Exit code != 0: falhar com "change:status retornou erro (exit <code>): <stderr>"
2.3. Parsear o JSON:
     - Extrair schemaName
     - Extrair artifacts[].status para cada artifact
2.4. [RESILIÊNCIA] Se JSON não contém campos esperados:
     - schemaName ausente: assumir "desconhecido", continuar com warning
     - artifacts ausente ou vazio: assumir "sem artefatos rastreados", continuar sem warning
2.5. Identificar artifacts com status != "done"
2.6. [CASO DE EXCEÇÃO] Se há artifacts incompletos:
     - Listar cada um: "  ⚠ <artifact-name>: <status>"
     - Usar AskUserQuestion:
       Opções: "Arquivar mesmo assim", "Cancelar arquivamento"
     - Se cancelar: parar execução.
     - Se prosseguir: armazenar flag HAS_INCOMPLETE_ARTIFACTS=true
2.7. Se todos artifacts estão "done":
     - Armazenar flag HAS_INCOMPLETE_ARTIFACTS=false
```

**Critério de conclusão**: `SCHEMA_NAME` definido. `HAS_INCOMPLETE_ARTIFACTS` definido como true/false.

---

### PASSO 3 — Verificar status de tarefas

```
3.1. Construir caminho: specskill/changes/<CHANGE_NAME>/tasks.md
3.2. [CASO DE EXCEÇÃO] Se o arquivo não existe:
     - Prosseguir sem warning de tarefas (não toda change tem tasks.md)
     - Armazenar flag HAS_TASKS=false
     - Ir para PASSO 4.
3.3. [RESILIÊNCIA] Se o arquivo existe mas não é legível:
     - Warning: "Não foi possível ler tasks.md: <motivo do erro>"
     - Prosseguir sem validação de tarefas
     - Armazenar flag HAS_TASKS=false
     - Ir para PASSO 4.
3.4. Ler o conteúdo do arquivo.
3.5. Contar linhas que começam com "- [ ]" → INCOMPLETE_COUNT
3.6. Contar linhas que começam com "- [x]" → COMPLETE_COUNT
3.7. [RESILIÊNCIA] Se parsing encontrar padrões ambíguos:
     - Linhas como "- [X]" (maiúsculo): tratar como completo
     - Linhas como "- [ ] " com conteúdo vazio: ignorar (não é tarefa)
     - Linhas indentadas (sub-tarefas): incluir na contagem
3.8. Armazenar flag HAS_TASKS=true
3.9. [CASO DE EXCEÇÃO] Se INCOMPLETE_COUNT > 0:
     - Mostrar: "⚠ <INCOMPLETE_COUNT> tarefa(s) incompleta(s) de <INCOMPLETE_COUNT + COMPLETE_COUNT> total"
     - Listar até 10 tarefas incompletas (se mais, adicionar "... e X outras")
     - Usar AskUserQuestion:
       Opções: "Arquivar mesmo assim", "Cancelar arquivamento"
     - Se cancelar: parar execução.
     - Se prosseguir: armazenar flag HAS_INCOMPLETE_TASKS=true
3.10. Se INCOMPLETE_COUNT == 0:
     - Armazenar flag HAS_INCOMPLETE_TASKS=false
```

**Critério de conclusão**: `HAS_TASKS`, `HAS_INCOMPLETE_TASKS` definidos. Valores de contagem disponíveis para sumário final.

---

### PASSO 4 — Avaliar sincronização de delta specs

```
4.1. Construir caminho: specskill/changes/<CHANGE_NAME>/specs/
4.2. [CASO DE EXCEÇÃO] Se o diretório não existe ou está vazio:
     - Armazenar flag HAS_DELTA_SPECS=false
     - Prosseguir para PASSO 5.
4.3. Listar todos os arquivos .md em specskill/changes/<CHANGE_NAME>/specs/ (recursivo)
4.4. [CASO DE EXCEÇÃO] Se nenhum .md encontrado:
     - Armazenar flag HAS_DELTA_SPECS=false
     - Prosseguir para PASSO 5.
4.5. Armazenar flag HAS_DELTA_SPECS=true
4.6. Para cada delta spec encontrado:
     4.6.1. Determinar a capability: extrair do caminho (ex: specs/auth/spec.md → capability="auth")
     4.6.2. Construir caminho do main spec: specskill/specs/<capability>/spec.md
     4.6.3. [RESILIÊNCIA] Se main spec não existe:
            - Marcar como operação "ADD" (nova capability)
     4.6.4. Se main spec existe:
            - Ler ambos os arquivos
            - [RESILIÊNCIA] Se leitura falhar: marcar como "ERRO: não foi possível ler <caminho>", incluir no sumário
            - Comparar conteúdo:
              * Idênticos: marcar como "SYNCED"
              * Diferentes: marcar como "MODIFIED" e extrair linhas adicionadas/removidas (diff simplificado)
4.7. Montar resumo combinado:
     - Separar por categoria: ADDs, MODIFIEDs, SYNCEDs, ERROs
     - Para MODIFIEDs: mostrar até 5 linhas de diff por spec (truncate se mais)
4.8. [CASO DE EXCEÇÃO] Se todos estão SYNCED:
     - Usar AskUserQuestion:
       Opções: "Arquivar agora", "Sincronizar mesmo assim", "Cancelar"
     - Se "Sincronizar mesmo assim": invocar sync (ver 4.10), depois prosseguir
     - Se "Cancelar": parar execução
     - Se "Arquivar agora": armazenar SYNC_PERFORMED=false, prosseguir
4.9. [CASO DE EXCEÇÃO] Se há ADDs ou MODIFIEDs:
     - Usar AskUserQuestion com o resumo completo visível:
       Opções: "Sincronizar agora (recomendado)", "Arquivar sem sincronizar", "Cancelar"
     - Se "Cancelar": parar execução
     - Se "Sincronizar agora": invocar sync (ver 4.10)
     - Se "Arquivar sem sincronizar": armazenar SYNC_PERFORMED=false
4.10. [SYNC] Invocar sincronização:
      - Usar Task tool com subagent_type="general-purpose"
      - Prompt: "Use Skill tool to invoke specskill-sync-specs for change '<CHANGE_NAME>'. Delta spec analysis: <resumo do passo 4.7>"
      - [RESILIÊNCIA] Se a task falhar:
        - Warning: "Sincronização falhou: <motivo>. Prosseguindo com arquivamento."
        - Armazenar SYNC_PERFORMED=false, SYNC_ERROR=true
      - Se a task suceder: armazenar SYNC_PERFORMED=true
4.11. Prosseguir para PASSO 5.
```

**Critério de conclusão**: `HAS_DELTA_SPECS`, `SYNC_PERFORMED`, `SYNC_ERROR` definidos.

---

### PASSO 5 — Executar o arquivamento

```
5.1. Criar diretório de archive (idempotente):
     mkdir -p specskill/changes/archive
5.2. [RESILIÊNCIA] Se mkdir falhar:
     - Falhar com "Não foi possível criar diretório de archive: <motivo>. Verifique permissões."
5.3. Gerar nome do destino: YYYY-MM-DD-<CHANGE_NAME>
     - Usar data atual no fuso do sistema
5.4. Construir caminho completo: specskill/changes/archive/<DEST_NAME>
5.5. [CASO DE EXCEÇÃO] Se destino já existe:
     - Falhar com erro explícito:
       "Já existe um archive com este nome: specskill/changes/archive/<DEST_NAME>/
        Opções:
        - Renomear o archive existente manualmente
        - Aguardar até amanhã para um nome de data diferente
        - Especificar um sufixo diferente para a change"
     - NÃO sobrescrever. NÃO renomear automaticamente. Parar execução.
5.6. Executar movimentação:
     mv specskill/changes/<CHANGE_NAME> specskill/changes/archive/<DEST_NAME>
5.7. [RESILIÊNCIA] Se mv falhar:
     - Permissão negada: falhar com "Sem permissão para mover. Execute com permissões adequadas ou verifique ownership."
     - Dispositivo cheio: falhar com "Disco cheio. Libere espaço antes de arquivar."
     - Source não encontrado: falhar com "Diretório source desapareceu inesperadamente. Pode ter sido movido por outro processo."
     - Outro erro: falhar com "Falha ao mover (exit <code>): <stderr>"
5.8. Validar que o destino existe e contém .specskill.yaml:
     - Se destino não existe após mv: falhar com "Move aparentemente sucedeu mas destino não encontrado. Possível race condition."
     - Se .specskill.yaml não existe no destino: warning "Arquivo .specskill.yaml não encontrado no archive. Verifique integridade manualmente."
5.9. Prosseguir para PASSO 6.
```

**Critério de conclusão**: Diretório movido com sucesso para `specskill/changes/archive/<DEST_NAME>/`.

---

### PASSO 6 — Exibir sumário final

```
6.1. Montar bloco de saída no formato:

## Archive Complete

**Change:** <CHANGE_NAME>
**Schema:** <SCHEMA_NAME>
**Archived to:** specskill/changes/archive/<DEST_NAME>/
**Specs:** <status de sync>
**Artifacts:** <status>
**Tasks:** <status>

[Se houve warnings, adicionar seção:]

### ⚠ Warnings
- <warning 1>
- <warning 2>

6.2. Regras para cada campo de status:
     - Specs:
       * Se HAS_DELTA_SPECS=false: "No delta specs"
       * Se SYNC_PERFORMED=true: "✓ Synced to main specs"
       * Se SYNC_PERFORMED=false e HAS_DELTA_SPECS=true: "⚠ Sync skipped (delta specs preserved in archive)"
       * Se SYNC_ERROR=true: "✗ Sync failed: <motivo>"
     - Artifacts:
       * Se HAS_INCOMPLETE_ARTIFACTS=false: "✓ All complete"
       * Se HAS_INCOMPLETE_ARTIFACTS=true: "⚠ <N> incomplete (confirmed by user)"
     - Tasks:
       * Se HAS_TASKS=false: "No tasks file"
       * Se HAS_INCOMPLETE_TASKS=false: "✓ All complete (<N>/<N>)"
       * Se HAS_INCOMPLETE_TASKS=true: "⚠ <INCOMPLETE>/<TOTAL> incomplete (confirmed by user)"
```

**Critério de conclusão**: Sumário exibido ao usuário. Execução completa.

---

## Padrões Específicos

### P1 — Parsing de JSON do change:status

**Regra**: Sempre validar a estrutura do JSON antes de acessar campos. Nunca assuma que o output está no formato esperado.

```bash
# ✅ PASS — Valida antes de usar
STATUS_JSON=$(npm run specskill:status -- --change "$NAME" --json 2>/tmp/change-err)
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERRO: change:status falhou (exit $EXIT_CODE): $(cat /tmp/change-err)"
  exit 1
fi
SCHEMA=$(echo "$STATUS_JSON" | jq -r '.schemaName // "desconhecido"')
ARTIFACTS=$(echo "$STATUS_JSON" | jq -r '.artifacts // []')

# ❌ FAIL — Acesso direto sem validação
STATUS_JSON=$(npm run specskill:status -- --change "$NAME" --json)
SCHEMA=$(echo "$STATUS_JSON" | jq -r '.schemaName')
# Se .schemaName não existir, jq retorna "null" silenciosamente
```

**Por que importa**: O specskill pode mudar formato de output, ter bugs, ou retornar erros em stdout. Acesso sem validação propaga "null" silenciosamente pelo resto do fluxo.

---

### P2 — Contagem de tarefas em tasks.md

**Regra**: Usar grep com regex estrito. Não confiar em heurísticas de formatação.

```bash
# ✅ PASS — Regex estrito para checkboxes
INCOMPLETE=$(grep -cE '^\s*- \[ \]' tasks.md 2>/dev/null || echo 0)
COMPLETE=$(grep -cE '^\s*- \[[xX]\]' tasks.md 2>/dev/null || echo 0)

# ❌ FAIL — Regex frouxo que captura falsos positivos
INCOMPLETE=$(grep -c '\[ \]' tasks.md)
# Captura: "veja [ ] abaixo", "- [ ]", "  - [ ]  ", mas também comentários com brackets
```

**Por que importa**: Regex frouxo infla contadores, gerando warnings falsos que erodem a confiança do usuário no processo.

---

### P3 — Comparação de delta specs

**Regra**: Comparar por conteúdo normalizado (trim de whitespace, trailing newlines). Não comparar por timestamp ou metadata de arquivo.

```bash
# ✅ PASS — Normaliza antes de comparar
normalize() {
  sed 's/[[:space:]]*$//' "$1" | sed '/^$/d'
}
if diff <(normalize delta.md) <(normalize main.md) > /dev/null 2>&1; then
  echo "SYNCED"
else
  echo "MODIFIED"
fi

# ❌ FAIL — diff direto sem normalização
if diff delta.md main.md > /dev/null 2>&1; then
  echo "SYNCED"
fi
# Falha se um arquivo tem trailing newline e outro não
```

**Por que importa**: Diferenças de whitespace são falsos positivos que geram pedidos de sync desnecessários.

---

### P4 — Movimentação atômica para archive

**Regra**: Usar `mv` nativo do filesystem (same-device). Nunca cp+rm. Validar pós-move.

```bash
# ✅ PASS — mv + validação pós-move
mv "specskill/changes/$NAME" "specskill/changes/archive/$DEST" 2>/tmp/mv-err
if [ $? -ne 0 ]; then
  echo "ERRO: mv falhou: $(cat /tmp/mv-err)"
  exit 1
fi
if [ ! -d "specskill/changes/archive/$DEST" ]; then
  echo "ERRO CRÍTICO: mv retornou sucesso mas destino não existe"
  exit 1
fi
if [ ! -f "specskill/changes/archive/$DEST/.specskill.yaml" ]; then
  echo "WARNING: .specskill.yaml ausente no archive"
fi

# ❌ FAIL — cp + rm sem validação
cp -r "specskill/changes/$NAME" "specskill/changes/archive/$DEST"
rm -rf "specskill/changes/$NAME"
# Race condition: se cp falhar parcialmente, rm apaga o original
```

**Por que importa**: cp+rm não é atômico e pode resultar em perda de dados se houver falha entre as duas operações.

---

### P5 — Tratamento de stderr do specskill CLI

**Regra**: Sempre capturar stderr separadamente. Nunca mesclar stderr com stdout para parsing.

```bash
# ✅ PASS — Stderr separado
OUTPUT=$(npm run specskill:list -- --json 2>/tmp/change-stderr)
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "ERRO: $(cat /tmp/change-stderr)"
  exit 1
fi

# ❌ FAIL — Stderr no mesmo stream
OUTPUT=$(npm run specskill:list -- --json 2>&1)
# Se houver warnings em stderr, elas contaminam o JSON
```

**Por que importa**: Mensagens de warning ou debug do CLI no stderr quebram o parser JSON silenciosamente.

---

### P6 — Nome de archive com data

**Regra**: Usar date do sistema, formato ISO 8601 (YYYY-MM-DD), sem timezone.

```bash
# ✅ PASS — Format explícito
DEST_NAME="$(date +%Y-%m-%d)-${CHANGE_NAME}"

# ❌ FAIL — Format dependente de locale
DEST_NAME="$(date)-${CHANGE_NAME}"
# Pode gerar "Thu Jan 15 14:30:00 BRT 2025-my-change"
```

**Por que importa**: Format não-ISO gera nomes inconsistentes, dificulta ordenação por ls, e quebra scripts que esperam prefixo de data.

---

## Anti-Padrões Críticos

| Anti-padrão | Consequência | Alternativa correta |
|---|---|---|
| Auto-selecionar change quando há múltiplas | Arquivar change errada, perda irreversível | Sempre usar AskUserQuestion com lista |
| Ignorar stderr do specskill CLI | JSON corrompido por mensagens de warning, parse falha silenciosamente | Capturar stderr separado, verificar exit code |
| Usar cp+rm em vez de mv | Race condition pode destruir dados se cp falhar parcialmente | Usar mv atômico, validar pós-move |
| Sobrescrever archive existente | Perda do archive anterior | Falhar com erro e sugerir ações manuais |
| Sync silencioso de delta specs | Usuário perde controle sobre mudanças em specs | Sempre avaliar, mostrar diff, confirmar |
| Tratar "null" do jq como valor válido | Propaga "null" como nome de schema, gera sumário confuso | Usar `// "fallback"` em todo jq -r |
| Não validar pós-move | Diretório pode ter sumido por race condition com outro processo | Validar existência + presença de .specskill.yaml |
| Listar todas as tarefas incompletas sem limite | Output gigante se tasks.md tiver 100+ tarefas | Truncar em 10 itens com "... e N outras" |

---

## Critérios de Qualidade

Antes de considerar o arquivamento completo, confirme:

- [ ] Nome da change foi explicitamente confirmado pelo usuário (nunca auto-selecionado)
- [ ] `npm run specskill:status -- --json` foi parseado com validação de estrutura
- [ ] Warnings de artifacts incompletos foram apresentados com confirmação (se aplicável)
- [ ] Warnings de tarefas incompletas foram apresentados com contagem exata (se aplicável)
- [ ] Delta specs foram avaliados com diff normalizado (se existirem)
- [ ] Sync foi oferecido com resumo visível, nunca executado silenciosamente
- [ ] Destino de archive não existia previamente
- [ ] `mv` foi usado (não cp+rm)
- [ ] Pós-move validou existência do diretório destino
- [ ] Sumário final inclui status de specs, artifacts e tasks com símbolos ✓/⚠/✗
- [ ] Arquivo .specskill.yaml acompanhou a change para o archive

---

## Referências Cruzadas

| Precisa de... | Use a skill... |
|---|---|
| Sincronizar delta specs com main specs | `specskill-sync-specs` |
| Criar uma nova change | `specskill-create-change` |
| Listar changes disponíveis | CLI direto: `npm run specskill:list -- --json` |
| Verificar status detalhado | CLI direto: `npm run specskill:status -- --json` |

---

## Exemplo Completo — Fluxo End-to-End

**Contexto**: Usuário diz "arquivar a change de auth"

### Cenário A — Nome unívoco, tudo completo, sem delta specs

```
[Modelo]: Change "auth-refactor" encontrada. Verificando status...

[CLI]: npm run specskill:status -- --change "auth-refactor" --json
[Output]: {"schemaName": "default", "artifacts": [{"name": "plan", "status": "done"}, {"name": "impl", "status": "done"}]}

[Modelo]: ✓ Todos os 2 artefatos completos.

[Filesystem]: tasks.md não encontrado em specskill/changes/auth-refactor/
[Modelo]: Nenhum arquivo de tarefas encontrado.

[Filesystem]: specskill/changes/auth-refactor/specs/ não encontrado
[Modelo]: Nenhum delta spec para sincronizar.

[CLI]: mv specskill/changes/auth-refactor specskill/changes/archive/2025-01-15-auth-refactor

[Modelo]:
## Archive Complete

**Change:** auth-refactor
**Schema:** default
**Archived to:** specskill/changes/archive/2025-01-15-auth-refactor/
**Specs:** No delta specs
**Artifacts:** ✓ All complete
**Tasks:** No tasks file
```

### Cenário B — Múltiplas changes, artifacts incompletos, delta specs desynced

```
[Modelo]: Nenhuma change especificada. Listando changes ativas...

[CLI]: npm run specskill:list -- --json
[Output]: {"changes": [{"name": "auth-refactor", "schema": "default"}, {"name": "api-v2", "schema": "extended"}]}

[Modelo via AskUserQuestion]:
Encontrei 2 changes ativas:
1. auth-refactor (schema: default)
2. api-v2 (schema: extended)
Qual arquivar?

[Usuário]: api-v2

[CLI]: npm run specskill:status -- --change "api-v2" --json
[Output]: {"schemaName": "extended", "artifacts": [{"name": "plan", "status": "done"}, {"name": "impl", "status": "in-progress"}, {"name": "tests", "status": "pending"}]}

[Modelo]:
⚠ 2 artefatos incompletos:
  ⚠ impl: in-progress
  ⚠ tests: pending

[Modelo via AskUserQuestion]:
Artefatos incompletos encontrados. Deseja arquivar mesmo assim?
- Arquivar mesmo assim
- Cancelar arquivamento

[Usuário]: Arquivar mesmo assim

[Filesystem]: tasks.md existe
[Contagem]: 12 completas, 3 incompletas

[Modelo]:
⚠ 3 tarefa(s) incompleta(s) de 15 total:
  - [ ] Adicionar testes de rate limiting
  - [ ] Atualizar documentação da API
  - [ ] Revisar code review comments

[Modelo via AskUserQuestion]:
Tarefas incompletas encontradas. Deseja arquivar mesmo assim?
- Arquivar mesmo assim
- Cancelar arquivamento

[Usuário]: Arquivar mesmo assim

[Filesystem]: specskill/changes/api-v2/specs/ contém:
  - specs/rate-limiting/spec.md (nova — main não existe)
  - specs/endpoints/spec.md (modificada — 12 linhas diferentes)

[Modelo]:
### Delta Specs Analysis
**ADD:** rate-limiting/spec.md (nova capability)
**MODIFIED:** endpoints/spec.md (+8 lines, -4 lines)

[Modelo via AskUserQuestion]:
Delta specs precisam de sincronização. Deseja:
- Sincronizar agora (recomendado)
- Arquivar sem sincronizar
- Cancelar

[Usuário]: Sincronizar agora

[Task tool]: Invoca specskill-sync-specs para api-v2...
[Resultado]: Sync concluído com sucesso

[CLI]: mv specskill/changes/api-v2 specskill/changes/archive/2025-01-15-api-v2

[Modelo]:
## Archive Complete

**Change:** api-v2
**Schema:** extended
**Archived to:** specskill/changes/archive/2025-01-15-api-v2/
**Specs:** ✓ Synced to main specs
**Artifacts:** ⚠ 2 incomplete (confirmed by user)
**Tasks:** ⚠ 3/15 incomplete (confirmed by user)

### ⚠ Warnings
- 2 artifacts não concluídos (impl, tests)
- 3 tarefas não concluídas
- Delta specs foram sincronizadas antes do arquivamento
```

### Cenário C — Falha de sistema (CLI não disponível)

```
[CLI]: npm run specskill:list -- --json
[Exit]: 127
[Stderr]: command not found

[Modelo]:
## ERRO

change:list CLI não está instalado ou não está no PATH.

**Ação sugerida**: Verifique a instalação do specskill com `which specskill` ou consulte a documentação de instalação.
```

### Cenário D — Destino de archive já existe
```
[CLI]: ls specskill/changes/archive/2025-01-15-auth-refactor
[Output]: (diretório existe)

[Modelo]:
## ERRO

Já existe um archive com este nome: specskill/changes/archive/2025-01-15-auth-refactor/

**Opções:**
- Renomear o archive existente manualmente: `mv specskill/changes/archive/2025-01-15-auth-refactor specskill/changes/archive/2025-01-15-auth-refactor-v2`
- Aguardar até amanhã para obter um nome de data diferente
- Se a change original ainda existe em outro local, verifique se já foi arquivada

Arquivamento cancelado. Nenhuma alteração foi feita.