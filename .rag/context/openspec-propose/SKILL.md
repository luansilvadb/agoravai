---
name: openspec-propose
version: 1.0.0
description: >
  Orquestra a criação completa de uma mudança OpenSpec — do scaffolding à geração
  sequencial e resiliente de todos os artefatos (proposal, design, tasks).
  Ative quando o usuário quiser propor algo novo e obter o pacote pronto para `/opsx:apply`.
triggers:
  - "criar change"
  - "nova proposta openspec"
  - "propor mudança"
  - "openspec propose"
  - "/opsx:propose"
scope:
  primary: ["openspec", "change proposal", "artifact generation", "cli orchestration"]
  delegates: ["openspec-apply para execução das tasks geradas"]
quality_bar: high
---

# OPENSPEC PROPOSE — Propostas completas e resilientes em um único passo

> **Propósito**: Executar o pipeline de criação de um change OpenSpec de ponta a ponta,
> garantindo que a topologia de dependências seja resolvida e os artefatos sobrevivam
> a falhas de sistema, ambiguidade e estados inconsistentes.

## Filosofia Central

1. **Determinismo de Pipeline** — A ordem de geração é ditada estritamente pelo JSON de status, nunca por inferência. Na prática: nunca assuma a ordem dos artefatos; sempre parseie `applyRequires` e `dependencies`.
2. **Resiliência no Build** — Toda interação com o sistema de arquivos ou CLI é um ponto de falha. Na prática: valide a saída de cada comando e ombusque a existência do arquivo antes de avançar.
3. **Silêncio de Contexto** — Restrições do CLI (`<context>`, `<rules>`) são injeções de dependência ocultas. Na prática: use-as como guardrails de geração, mas nunca as escreva nos artefatos `.md` finais.
4. **Momentum Dirigido** — Bloqueios só ocorrem por falta de dados críticos. Na prática: prefira tomar decisões arquiteturais razoáveis a fazer perguntas triviais ao usuário.

---

## Quando Ativar

### ✅ Ativar para:
- Iniciar uma nova mudança do zero a partir de uma descrição em linguagem natural
- Gerar o pacote completo de artefatos (proposal, design, tasks) de uma vez
- Recuperar um change interrompido (se `applyRequires` ainda não estiver completo)

### ❌ NÃO ativar para:
- Executar as tarefas de implementação contidas no `tasks.md` → use `openspec-apply`
- Alterar o schema global do OpenSpec → responda diretamente com orientação
- Modificar um artefato específico isolado (ex: "ajusta só o design.md") → edite o arquivo diretamente

---

## Escopo e Limites

**Cobre:**
- Derivação de nome em `kebab-case` a partir de linguagem natural
- Execução e parse de comandos `openspec` (new, status, instructions)
- Resolução de grafos de dependência simples (DAG linear)
- Tratamento de erros de I/O, JSON malformado e colisão de nomes

**Delega:**
- Execução das tasks → `openspec-apply`
- Decisões de arquitetura de negócio complexas → o usuário (via `AskUserQuestion`)

---

## Protocolo de Execução

1. **Extrair Intenção** — Leia o input do usuário. Se vazio ou ambíguo a ponto de inviabilizar o nome do change, use `AskUserQuestion`. Derive o nome `<name>` em `kebab-case`.
2. **Scaffoldar com Segurança** — Execute `openspec new change "<name>"`. Capture stderr. Se indicar que o change já existe, pergunte ao usuário se deseja sobrescrever/continuar ou criar um novo.
3. **Mapear Topologia** — Execute `openspec status --change "<name>" --json`. Faça o parse do JSON. Se o parse falhar (JSON inválido), aborte e mostre a saída bruta do comando. Extraia `applyRequires` e a lista `artifacts`.
4. **Iniciar Loop de Geração** — Use `TodoWrite` para listar os artefatos pendentes. Ordene a execução respeitando o campo `dependencies` de cada artefato (só processe um se seu status for `ready`).
5. **Gerar Artefato (Sub-passo crítico):**
   a. Execute `openspec instructions <artifact-id> --change "<name>" --json`.
   b. Faça o parse extraindo `template`, `instruction`, `outputPath` e `dependencies`. Descarte `context` e `rules` da memória de saída.
   c. Leia os arquivos das dependências apontadas no passo anterior.
   d. Escreva o arquivo em `outputPath` usando `template` como esqueleto.
   e. **Validação de I/O**: Tente ler o arquivo recém-escrito. Se falhar, reescreva. Se falhar novamente, aborte o pipeline reportando erro de permissão/I/O.
6. **Atualizar Estado** — Após geração bem-sucedida, reexecute `openspec status --change "<name>" --json`. Atualize o `TodoWrite`.
7. **Condição de Parada** — Encerre o loop quando todos os IDs listados em `applyRequires` tiverem `status: "done"` no JSON atual.
8. **Apresentar Resultado** — Execute `openspec status --change "<name>"` (sem `--json` para saída amigável) e entregue o resumo final.

---

## Padrões Específicos

### Parse Seguro de Status JSON

**Regra**: Nunca acesse chaves do JSON sem verificar sua existência prévia; CLI updates podem quebrar o schema.

```bash
# ✅ PASS — Verifica existencia da chave antes de operar
if jq -e '.applyRequires' status.json > /dev/null; then
  APPLY_REQUIRES=$(jq -r '.applyRequires | join(" ")' status.json)
else
  echo "ERRO CRÍTICO: Campo 'applyRequires' ausente no status."
  exit 1
fi

# ❌ FAIL — Assuma que o JSON sempre terá a estrutura esperada
APPLY_REQUIRES=$(jq -r '.applyRequires | join(" ")' status.json)
```

**Por que importa**: Acessar chaves inexistentes no `jq` retorna `null`, o que contaminaria o loop de geração e faria o modelo tentar processar artefatos fantasmas.

---

### Validação Pós-Escrita (Write-Verify)

**Regra**: A geração do artefato só está completa após a leitura de confirmação do conteúdo gerado.

```bash
# ✅ PASS — Escreve e verifica o tamanho do arquivo para confirmar I/O
cat << 'EOF' > "$OUTPUT_PATH"
$ARTIFACT_CONTENT
EOF

if [ ! -s "$OUTPUT_PATH" ]; then
  echo "FALHA: Artefato gerado está vazio ou não existe em $OUTPUT_PATH"
  exit 1
fi

# ❌ FAIL — Confia que o redirecionamento sempre funciona em containers/SANs
echo "$ARTIFACT_CONTENT" > "$OUTPUT_PATH"
# avança para o próximo passo sem checar...
```

**Por que importa**: Sistemas de arquivos em rede ou limites de inode podem falhar silenciosamente na gravação, resultando em um change "pronto" que quebra no `/opsx:apply`.

---

### Tratamento de Colisão de Nome

**Regra**: Antes de criar um diretório ou change, valide o estado atual para não destruir trabalho existente acidentalmente.

```bash
# ✅ PASS — Verifica antecipadamente e delega a decisão
if openspec status --change "$NAME" &>/dev/null; then
  echo "CHANGE_EXISTS"
  # Lógica: trigger AskUserQuestion para o modelo
fi

# ❌ FAIL — Força a criação e sobrescreve
openspec new change "$NAME" --force
```

**Por que importa**: Dados de proposta anteriores são difíceis de reconstruir. A decisão de sobrescrever um change em andamento deve ser sempre humana.

---

### Injeção de Contexto (Silêncio de Regras)

**Regra**: Variáveis internas do CLI usadas como restrição (`context`, `rules`) são filtradas na hora de renderizar o template.

```python
# ✅ PASS — Usa dados apenas para condicionar a geração, não para output
context = json.loads(instructions['context'])
rules = json.loads(instructions['rules'])

# 'context' define que o projeto é Python, então a lógica de geração usa isso:
artifact_content = f"# Design\n\n## Stack\n\nO módulo será escrito em {context['language']}..."
# 'rules' impede de sugerir TypeScript, a lógica respeita isso internamente.

# ❌ FAIL — Vazamento de metadados para o usuário
artifact_content = f"# Design\n\n<project_context>{context}</project_context>\n\n<rules>{rules}</rules>..."
```

**Por que importa**: Vazar metadados internos polui o artefato final, confunde o desenvolvedor humano e quebra o contrato de limpeza do OpenSpec.

---

## Anti-Padrões Críticos

| Anti-padrão | Consequência | Alternativa correta |
| :--- | :--- | :--- |
| Executar geração de artefatos em paralelo | Quebra de dependências, referências circulares, arquivos corrompidos | Loop estrito verificando `status: "ready"` antes de cada write |
| Não tratar stderr do `openspec new` | O diretório não é criado, mas o protocolo tenta gerar artefatos, causando cascade failure | Capturar `$?` e `stderr` após o scaffold; abortar se não for zero |
| Preencher template com prosa genérica ("Preencha aqui") | O `/opsx:apply` falha por falta de dados concretos nas tasks | Extrair entidades e ações reais do input do usuário para popular o template |
| Ignorar o campo `dependencies` do JSON de instruções | Gerar um design.md sem ter lido o proposal.md resulta em contradições | Ler os caminhos listados em `dependencies` no sistema de arquivos antes de iniciar o render |

---

## Critérios de Qualidade

Antes de declarar o processo concluído, confirme:

- [ ] Input do usuário validado ou nome derivado com sucesso
- [ ] Comando `openspec new` executado sem erros de colisão
- [ ] JSON de `status` parseado com validação de chaves obrigatórias
- [ ] Loop executou respeitando a ordem estrita de `dependencies`
- [ ] Para cada artefato: `instructions` parseado e `<context>`/`<rules>` omitidos do output
- [ ] Para cada artefato: arquivo escrito e validado (não vazio, existe no path)
- [ ] Status final verificado: todos os IDs de `applyRequires` estão `"done"`
- [ ] Nenhum erro stderr não tratado ao longo do processo
- [ ] Resumo final exibido com o comando de próximo passo (`/opsx:apply`)

---

## Referências Cruzadas

| Precisa de... | Use a skill... |
| :--- | :--- |
| Executar as tasks geradas nesta proposta | `openspec-apply` |
| Formatar tabelas ou estruturas complexas nos artefatos | `markdown-advanced` |
| Debugar falhas no binário do OpenSpec | Responda diretamente (diagnóstico de CLI) |