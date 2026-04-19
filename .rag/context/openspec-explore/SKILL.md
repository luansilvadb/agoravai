```markdown
---
name: resilient-build
version: 1.0.0
description: >
  Executa fluxos de geração de artefatos com resiliência em cada etapa —
  da captação da tarefa à entrega do arquivo final. Ative quando o build
  envolver múltiplos passos, dependências externas ou risco de falha parcial.
triggers:
  - "gerar com resiliência"
  - "build robusto"
  - "artefato com tratamento de erro"
  - "gerar lidando com exceções"
  - "build que não quebra silenciosamente"
  - "/resilient-build"
scope:
  primary: ["build pipelines", "artifact generation", "error recovery", "graceful degradation"]
  delegates: ["docx para geração Word", "pdf para geração PDF", "xlsx para planilhas", "pptx para apresentações", "frontend-design para código frontend"]
quality_bar: high
---

# RESILIENT BUILD — Geração de artefatos que não falham silenciosamente

> **Propósito**: Executar qualquer fluxo de build como uma transação —
> ou entrega completa e validada, ou relatório claro de onde e por que parou.

---

## Filosofia Central

1. **Fail-Loud, Fail-Early** — Nunca ocultar um erro para "tentar continuar".
   Na prática: ao primeiro sinal de falha irrecuperável, pare e reporte — não produza artefato corrompido.

2. **Checkpoint por Etapa** — Cada fase do build produz um artifact intermediário inspecionável.
   Na prática: após parse, após validação, após geração — salve estado. Se o passo 4 falhar, o passo 3 já está seguro.

3. **Degrau, Não Abismo** — Quando não for possível o ideal, entregue o melhor subconjunto válido.
   Na prática: se a formatação avançada falhar, entregue formatação básica + aviso — nunca entregue vazio.

4. **Causa-Raiz Sempre** — Todo relatório de falha inclui o que foi tentado, o que falhou e o que resta tentar.
   Na prática: nunca devolva "Erro ao gerar". Devolva "Falha no passo 4/7 (render): lib X retornou código 137 — alternativa Y disponível".

5. **Idempotência de Recuperação** — Retry deve ser seguro de executar N vezes sem efeito colateral.
   Na prática: nunca escreva no destino final antes de validar o build completo — use temp dir.

6. **Contrato de Saída Invariante** — O que o usuário recebeu é sempre um dos três: artefato completo, artefato parcial com relatório, ou relatório de falha com próximo passo.
   Na prática: nunca devolva string vazia nem arquivo de 0 bytes sem explicação.

---

## Quando Ativar

### ✅ Ativar para:
- Geração de artefatos com 3+ etapas sequenciais (parse → transform → render → write)
- Builds que dependem de ferramentas externas (libs, CLIs, APIs)
- Tarefas onde falha parcial é possível e precisa ser comunicada (ex: PDF com 20 páginas, 2 falharam)
- Qualquer fluxo onde o custo de retry é alto ou o artefato final é crítico

### ❌ NÃO ativar para:
- Respostas textuais simples sem geração de arquivo → responda diretamente
- Refatoração de código em memória → use a skill de padrão correspondente
- Debug de erro em artefato já gerado → investigue diretamente

---

## Escopo e Limites

| Esta skill cobre | Esta skill delega |
|---|---|
| Orquestração do pipeline de build | Lógica específica de formatação (Word, PDF, etc.) |
| Detecção e tratamento de falhas por etapa | Escolha do template ou design visual |
| Recuperação e retry com backoff | Validação de conteúdo de negócio |
| Relatório de execução (build report) | Decisões sobre o que incluir no artefato |
| Estratégia de fallback e degradação | Testes unitários do código gerado |

---

## Protocolo de Execução

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESILIENT BUILD PIPELINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  1.PARSE  │──▶│ 2.VALID  │──▶│ 3.ENV    │──▶│ 4.DEPEND │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│       │              │              │              │           │
│    CKPT 1         CKPT 2        CKPT 3         CKPT 4         │
│       │              │              │              │           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│  │ 7.DELIV  │◀──│ 6.VALOUT │◀──│ 5.BUILD  │◀────┘            │
│  └──────────┘   └──────────┘   └──────────┘                   │
│       │              │              │                           │
│    CKPT 7         CKPT 6        CKPT 5                         │
│                                                                 │
│  CKPT = Checkpoint — estado salvo para recuperação             │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Parse — Extrair intenção e restrições

**Ação**: Identificar tipo de artefato, formato de saída, constraints e dados de entrada.

**Checkpoint**: Objeto estruturado `{ intent, format, constraints, inputs[] }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Input vazio ou whitespace-only | Falha de pré-condição | Pedir input — não inferir |
| Input ambíguo (2+ interpretações possíveis) | Parse não determinístico | Listar interpretações, pedir escolha |
| Input com dados conflitantes (ex: "PDF" + "arquivo .docx") | Contradição de requisitos | Apontar conflito, pedir resolução |

**Regra**: Se o parse não produziu um objeto com todos os 4 campos preenchidos, **não avance**.

---

### 2. Validate — Checar completude e consistência dos dados

**Ação**: Verificar se os inputs satisfazem os pré-requisitos do formato alvo.

**Checkpoint**: `{ valid: true, warnings[], data }` ou `{ valid: false, errors[], partialData }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Campo obrigatório ausente | Dados incompletos | Listar campos faltantes + pedir ou inferir com confirmação |
| Tipo errado (string onde era número) | Schema violation | Tentar coerce — se falhar, reportar campo específico |
| Dados fora do domínio esperado (ex: data 32/13) | Valor inválido | Reportar valor + domínio válido |

**Regra**: Dados parciais válidos podem avançar com `warnings[]` preenchido — dados inválidos não.

```python
# ✅ PASS — validação granular com recovery path
validation = validate(inputs, schema)
if not validation.valid:
    if validation.recoverable:
        yield BuildEvent.WARNING(f"Campos ajustados: {validation.corrections}")
        inputs = validation.corrected_data
    else:
        yield BuildEvent.ABORT(reason=validation.errors, next_step="provide_missing_fields")
        return

# ❌ FAIL — validação grossa sem recuperação
if not validate(inputs):
    print("Dados inválidos")
    return
```

---

### 3. Environment Check — Verificar prereqs de sistema

**Ação**: Confirmar que ferramentas, libs e recursos necessários estão disponíveis.

**Checkpoint**: `{ env_ready: true, tools{}, resources{} }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Lib não instalada | Dependency missing | Tentar instalar (se seguro) ou sugerir comando |
| Versão incompatível | Version mismatch | Reportar versão encontrada vs. requerida |
| Sem permissão de escrita no destino | Permission denied | Sugerir path alternativo ou chmod |
| Disco < threshold (ex: 50MB livres) | Resource exhaustion | Reportar espaço necessário vs. disponível |
| Timeout ao verificar ambiente | Env check hung | Assumir não pronto, sugerir verificação manual |

```python
# ✅ PASS — verificação com fallback granular
env = check_environment(requirements)
if not env.tools["pandoc"].available:
    if env.tools["pandoc"].installable:
        install("pandoc", env.tools["pandoc"].version_required)
    else:
        yield BuildEvent.DEGRADE(
            tool="pandoc",
            fallback="html",
            reason="pandoc não disponível e não instalável neste ambiente"
        )

# ❌ FAIL — assume que tudo está ok
# (sem verificação — falha no meio do build com erro críptico)
```

---

### 4. Dependency Resolution — Resolver e segurar pré-requisitos

**Ação**: Baixar, compilar ou preparar tudo que o build precisa antes de começar.

**Checkpoint**: `{ deps_resolved: true, dep_manifest{} }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Download falhou (network) | Transient failure | Retry com backoff exponencial (max 3x) |
| Download falhou 3x | Persistent failure | Abortar com instrução de download manual + caminho do cache |
| Hash mismatch | Corrupt download | Delete cache + retry 1x, depois abortar |
| Dep conflita com outra dep | Version conflict | Reportar conflito + sugerir resolução |

```python
# ✅ PASS — retry com backoff + hash validation
for attempt in range(1, 4):
    try:
        dep = download(dep_url, timeout=30)
        if sha256(dep.path) != dep.expected_hash:
            os.remove(dep.path)
            raise IntegrityError("hash mismatch")
        break
    except (NetworkError, IntegrityError) as e:
        if attempt == 3:
            yield BuildEvent.ABORT(
                reason=f"Dep {dep.name} indisponível após 3 tentativas: {e}",
                next_step=f"Baixe manualmente: {dep.url} → {dep.cache_path}"
            )
            return
        time.sleep(2 ** attempt)

# ❌ FAIL — download sem retry, sem validação
dep = download(dep_url)  # falha silenciosa ou cryptic
```

---

### 5. Build — Executar a geração do artefato

**Ação**: Executar o pipeline de transformação → renderização.

**Checkpoint**: Artefato em diretório temporário + `{ build_ok: true, stats{} }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Erro de sintaxe no template | Template corrupt | Reportar linha + contexto, tentar template fallback |
| Timeout de renderização (ex: >60s) | Render hung | Matar processo, reportar, sugerir simplificação |
| Memória esgotada | OOM | Reportar tamanho estimado vs. disponível, sugerir chunking |
| Erro parcial (ex: 18/20 páginas ok) | Partial success | Completar o possível + registrar falhas no build report |
| Lib crash (segfault, exit code 139) | Fatal lib error | Não retry — reportar lib + versão + workaround conhecido |

**Regra de degradação**: Se o build suportar chunks independentes (páginas, seções, slides), falhas em chunks individuais NÃO abortam o build — registram e continuam.

```python
# ✅ PASS — build com chunk-level error isolation
results = []
for i, chunk in enumerate(chunks):
    try:
        result = render(chunk, timeout=30)
        results.append(result)
    except RenderError as e:
        results.append(FailedChunk(index=i, error=str(e), input_preview=chunk[:200]))
        yield BuildEvent.CHUNK_FAILED(index=i, reason=str(e))

artifacts = [r for r in results if isinstance(r, RenderedChunk)]
failures = [r for r in results if isinstance(r, FailedChunk)]

if not artifacts:
    yield BuildEvent.ABORT(reason="todos os chunks falharam", details=failures)
elif failures:
    yield BuildEvent.PARTIAL(delivered=len(artifacts), failed=len(failures), details=failures)
else:
    yield BuildEvent.SUCCESS(count=len(artifacts))

# ❌ FAIL — build monolítico, primeira falha mata tudo
result = render(full_document)  # falha no chunk 3 → nada entregue
```

---

### 6. Output Validation — Verificar integridade do artefato

**Ação**: Confirmar que o arquivo gerado é válido, completo e não corrompido.

**Checkpoint**: `{ output_valid: true, integrity{}, completeness{} }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Arquivo de 0 bytes | Empty output | Abortar — não entregue arquivo vazio |
| Tamanho muito menor que esperado (<50% do estimado) | Truncation suspeito | Investigar: validar estrutura, checar logs |
| Formato inválido (magic bytes errados) | Corrupt output | Deletar, reportar, sugerir retry |
| Conteúdo faltando vs. input | Incomplete render | Listar o que falta + tentar regenerar se possível |
| Encoding quebrado (mojibake) | Encoding error | Tentar re-encode com charset detectado, fallback UTF-8 |

```python
# ✅ PASS — validação multicamada
def validate_output(path, expected):
    checks = {}

    # Camada 1: existência e tamanho
    if not os.path.exists(path):
        return OutputInvalid(reason="arquivo não criado")
    checks["size_bytes"] = os.path.getsize(path)
    if checks["size_bytes"] == 0:
        return OutputInvalid(reason="arquivo vazio (0 bytes)")
    if checks["size_bytes"] < expected.min_size:
        return OutputWarning(reason=f"tamanho {checks['size_bytes']} < mínimo esperado {expected.min_size}")

    # Camada 2: magic bytes / formato
    with open(path, "rb") as f:
        header = f.read(8)
    if not header.startswith(expected.magic_bytes):
        return OutputInvalid(reason=f"magic bytes incorretos: {header.hex()} vs esperado {expected.magic_bytes.hex()}")

    # Camada 3: estrutura (quando aplicável)
    if expected.validator:
        struct_ok, struct_errors = expected.validator(path)
        checks["structure_valid"] = struct_ok
        if not struct_ok:
            return OutputInvalid(reason="estrutura inválida", details=struct_errors)

    return OutputValid(checks=checks)

# ❌ FAIL — confia que "não deu erro" = "está ok"
output_path = render(data)  # se render não crashou, assume válido
```

---

### 7. Deliver — Mover para destino final + relatório

**Ação**: Copiar artefato validado do temp dir para o destino, gerar build report.

**Checkpoint**: `{ delivered: true, final_path, build_report }`

**Exceções**:

| Sinal | Diagnóstico | Ação |
|---|---|---|
| Destino inacessível (permissão) | Write denied | Tentar path alternativo, reportar |
| Destino já existe | Name collision | Gerar nome versionado (`_v2.ext`), informar |
| Disco cheio ao copiar | No space | Deletar temp, reportar espaço necessário |
| Falha ao gerar build report | Report error | Entregar artefato sem report + avisar |

**Regra de ouro**: O artefato só é movido do temp dir para o destino FINAL após passar na validação (passo 6). Nunca escreva direto no destino.

```python
# ✅ PASS — atomic delivery via temp → dest
temp_path = build_in_tempdir(...)
validation = validate_output(temp_path, expected)

if validation.valid or validation.partial:
    final_path = resolve_destination(dest_dir, filename, collision_strategy="version")
    try:
        shutil.move(temp_path, final_path)
    except (PermissionError, OSError) as e:
        alt_path = resolve_destination(fallback_dir, filename, collision_strategy="version")
        shutil.move(temp_path, alt_path)
        yield BuildEvent.DELIVERED_WITH_WARNING(
            path=alt_path,
            warning=f"Destino original inacessível ({e}), entregue em alternativa"
        )
    report = generate_build_report(steps, validation, final_path)
    return DeliveryResult(artifact=final_path, report=report)

# ❌ FAIL — escreve direto no destino, se corrompe o usuário perde o original
with open(final_path, "w") as f:
    f.write(render(data))  # se render crashar aqui, arquivo corrompido
```

---

## Padrões Específicos

### Padrão 1: Temp-First Write

**Regra**: Todo artefato é gerado em diretório temporário antes de ser movido ao destino final.

```python
# ✅ PASS
import tempfile
with tempfile.TemporaryDirectory(prefix="build_") as tmp:
    temp_file = os.path.join(tmp, "output.docx")
    generate(temp_file, data)
    validate(temp_file)
    shutil.move(temp_file, final_path)  # atomic no mesmo filesystem

# ❌ FAIL
generate("/home/user/documents/report.docx", data)  # corrompe se falhar midway
```

**Por que importa**: Se o build falhar na metade, o destino não fica com um arquivo corrompido/incompleto.

---

### Padrão 2: Structured Error, Never Raw Exception

**Regra**: Todo erro capturado é transformado em objeto estruturado antes de ser reportado.

```python
# ✅ PASS
class BuildError:
    step: int              # qual passo falhou (1-7)
    step_name: str         # nome legível
    error_type: str        # categoria (NETWORK | VALIDATION | RENDER | IO | TIMEOUT)
    message: str           # o que aconteceu
    input_snapshot: str    # 200 chars do input que causou o erro
    attempted_fix: str     # null ou o que já foi tentado
    next_step: str         # instrução acionável para o usuário

# ❌ FAIL
except Exception as e:
    print(f"Erro: {e}")  # stack trace cru, sem contexto, sem next step
```

**Por que importa**: O usuário (ou o modelo consumindo o erro) precisa saber exatamente onde parou e o que fazer — não precisa de traceback de Python.

---

### Padrão 3: Retry com Janela e Ceiling

**Regra**: Retries usam backoff exponencial com teto e nunca retryam erros não-transientes.

```python
# ✅ PASS
NON_RETRYABLE = {ValidationError, PermissionError, IntegrityError}

def retry(callable_fn, max_attempts=3, base_delay=1):
    for attempt in range(1, max_attempts + 1):
        try:
            return callable_fn()
        except tuple(NON_RETRYABLE) as e:
            raise  # nunca retry erros lógicos
        except (NetworkError, TimeoutError) as e:
            if attempt == max_attempts:
                raise
            delay = min(base_delay * (2 ** (attempt - 1)), 30)  # teto de 30s
            yield BuildEvent.RETRY(attempt=attempt, max=max_attempts, delay=delay, reason=str(e))
            time.sleep(delay)

# ❌ FAIL
for i in range(10):
    try:
        do_thing()
    except:
        continue  # retry cego, sem backoff, sem distinguir erro, sem limite claro
```

**Por que importa**: Retry cego em erro de validação é desperdício; retry sem backoff é DDoS automático.

---

### Padrão 4: Build Report Obrigatório

**Regra**: Toda entrega inclui um relatório de execução, mesmo quando 100% sucesso.

```markdown
<!-- ✅ PASS — build report incluso -->
## Build Report — resilient-build v1.0.0

| Campo | Valor |
|---|---|
| Status | PARTIAL |
| Início | 2025-01-15T10:23:01Z |
| Fim | 2025-01-15T10:23:18Z |
| Duração | 17s |
| Artefato | /tmp/output/report.pdf |
| Tamanho | 2.4MB |

### Execução por etapa
| # | Etapa | Status | Detalhes |
|---|---|---|---|
| 1 | Parse | ✅ OK | — |
| 2 | Validate | ⚠️ WARN | Campo "telefone" ausente, inferido como vazio |
| 3 | Env Check | ✅ OK | pandoc 3.1.1 |
| 4 | Deps | ✅ OK | 0 deps externas |
| 5 | Build | ⚠️ PARTIAL | Página 7/20 falhou (timeout de render) |
| 6 | Output Valid | ⚠️ WARN | Tamanho 70% do estimado |
| 7 | Deliver | ✅ OK | Entregue em /tmp/output/report.pdf |

### Itens a resolver
- Página 7 contém imagem SVG complexa — considerar rasterizar antes
- Campo "telefone" não fornecido — verificar se intencional
```

```markdown
<!-- ❌ FAIL — sem build report -->
Aqui está o arquivo: [report.pdf]
```

**Por que importa**: Sem report, o usuário não sabe se o que recebeu está completo, parcial ou degradado.

---

### Padrão 5: Chunk Isolation

**Regra**: Quando o build tem partes independentes (páginas, slides, seções), cada parte é executada em isolamento — falha em uma não contamina as outras.

```python
# ✅ PASS
from concurrent.futures import ThreadPoolExecutor, as_completed

results = []
with ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(render_chunk, chunk, i): i for i, chunk in enumerate(chunks)}
    for future in as_completed(futures, timeout=120):
        idx = futures[future]
        try:
            results.append((idx, future.result()))
        except Exception as e:
            results.append((idx, ChunkError(index=idx, error=str(e))))

results.sort(key=lambda x: x[0])  # manter ordem original

# ❌ FAIL — processamento sequencial sem isolamento
output = []
for chunk in chunks:
    output.append(render_chunk(chunk))  # falha no chunk 3 = loop quebra, chunks 4-20 nunca executados
```

**Por que importa**: Se um slide com imagem corrompida impede os outros 19 slides de serem gerados, o usuário perde tudo por causa de um problema localizado.

---

## Anti-Padrões Críticos

| Anti-padrão | Consequência | Alternativa correta |
|---|---|---|
| Escrever direto no destino final | Arquivo corrompido se build falhar midway | Sempre temp dir → validate → move |
| `except Exception: pass` | Falha silenciosa, artefato quebrado sem aviso | Capturar, estruturar, reportar |
| Retry sem distinguir erro transiente de lógico | Wasting tempo retryando erro de validação eterno | Classificar erros: retryable vs. non-retryable |
| Abortar build inteiro por falha em 1 chunk | 95% do trabalho perdido por 5% problemático | Chunk isolation + partial delivery |
| Entregar sem build report | Usuário não sabe se resultado está íntegro | Report obrigatório em toda entrega |
| Assumir ambiente pronto | Falha críptica no meio do build ("command not found") | Environment check explícito no passo 3 |
| Confundir "não deu erro" com "está válido" | Arquivo de 0 bytes entregue como sucesso | Validação multicamada (tamanho + magic bytes + estrutura) |
| Timeout infinito no build | Processo hung travando tudo | Timeout por etapa + kill + report |

---

## Critérios de Qualidade

Antes de declarar o build completo, confirme:

- [ ] Todas as 7 etapas do pipeline foram executadas ou explicitamente puladas com justificativa
- [ ] Cada etapa produziu seu checkpoint
- [ ] Artefato foi gerado em temp dir, nunca direto no destino
- [ ] Output validation passou nas 3 camadas (tamanho, magic bytes, estrutura)
- [ ] Build report foi gerado com status, timing, e detalhes por etapa
- [ ] Se houve falha parcial: chunks afetados listados individualmente com causa
- [ ] Se houve abort: `next_step` é acionável (comando, input necessário, ou workaround)
- [ ] Se houve degradação: fallback usado foi informado ao usuário
- [ ] Nenhum arquivo de 0 bytes ou vazio foi entregue
- [ ] Nenhuma exceção bruta (traceback) foi exposta ao usuário final

---

## Referências Cruzadas

| Precisa de... | Use a skill... |
|---|---|
| Gerar documento Word | `docx` |
| Gerar PDF | `pdf` |
| Gerar planilha Excel | `xlsx` |
| Gerar apresentação PowerPoint | `pptx` |
| Padrões de código no artefato gerado | `frontend-design` ou `backend-patterns` |
| Ler arquivos de input do usuário | `file-reading` |
```

---

**Racional das escolhas**: A skill foi estruturada como pipeline de 7 etapas porque esse é o mínimo para cobrir o ciclo completo de captação→entrega com granularidade de falha. Cada etapa tem sua própria tabela de exceções porque os sinais de falha mudam radicalmente entre "não entendi o input" (passo 1) e "arquivo corrompido" (passo 6). O padrão de chunk isolation (padrão 5) é o diferencial principal — sem ele, uma falha localizada em um slide/página destrói todo o build. O build report obrigatório (padrão 4) fecha o contrato: o usuário nunca precisa adivinhar se o que recebeu está íntegro.

### When a change exists

If the user mentions a change or you detect one is relevant:

1. **Read existing artifacts for context**
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/design.md`
   - `openspec/changes/<name>/tasks.md`
   - etc.

2. **Reference them naturally in conversation**
   - "Your design mentions using Redis, but we just realized SQLite fits better..."
   - "The proposal scopes this to premium users, but we're now thinking everyone..."

3. **Offer to capture when decisions are made**

    | Insight Type               | Where to Capture               |
    |----------------------------|--------------------------------|
    | New requirement discovered | `specs/<capability>/spec.md` |
    | Requirement changed        | `specs/<capability>/spec.md` |
    | Design decision made       | `design.md`                  |
    | Scope changed              | `proposal.md`                |
    | New work identified        | `tasks.md`                   |
    | Assumption invalidated     | Relevant artifact              |

   Example offers:
   - "That's a design decision. Capture it in design.md?"
   - "This is a new requirement. Add it to specs?"
   - "This changes scope. Update the proposal?"

4. **The user decides** - Offer and move on. Don't pressure. Don't auto-capture.

**Complementaridade**: Esta skill orquestra o fluxo mas não sabe formatar nada — ela delega a formatação real para `docx`, `pdf`, `xlsx` etc., adicionando a camada de resiliência que essas skills individuais não cobrem.