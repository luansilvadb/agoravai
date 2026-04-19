# Infrastructure Layer

Utilitários de infraestrutura para operações resilientes de build, validação e I/O.

## Modules

### `build/` — Pipeline de Build Resiliente

Pipeline de 7 etapas com checkpoint, timeout e relatório obrigatório.

```typescript
import { runBuildPipeline } from './build/index.js';

const report = await runBuildPipeline(
  input,
  { PARSE: parseFn, VALIDATE: validateFn, BUILD: buildFn },
  { timeoutPerStepMs: 30000 }
);
```

**Princípios:**
- Checkpoint por etapa (inspecionável)
- Timeout rígido por etapa
- Build report obrigatório
- Falha loud, early

### `validation/` — Validação de Fronteira

Validação estrita de inputs com coerce automático e erros contextuais.

```typescript
import { validate, assertValid } from './validation/index.js';

const result = validate(input, {
  name: { type: 'string', required: true },
  age: { type: 'number', coerce: true, min: 0 },
});

if (!result.valid) {
  console.log(result.errors[0].code); // 'required.missing' | 'type.invalid' | 'domain.outOfRange'
}
```

**Features:**
- Validação de tipo com coerce
- Domínio (min, max, pattern, enum)
- Warnings para dados parciais
- Erros estruturados com field/code

### `atomic-io/` — Operações de I/O Atômicas

Escrita temp-first com validação multicamada.

```typescript
import { generateInTemp, validateOutput, atomicMove } from './atomic-io/index.js';

const tempPath = await generateInTemp(data, writeFn);
const validation = await validateOutput(tempPath, { minSize: 100, magicBytes: PNG_HEADER });
const result = await atomicMove(tempPath, finalPath, 'version');
```

**Layers de Validação:**
1. Existência e tamanho
2. Magic bytes
3. Estrutura interna

**Collision Strategy:**
- `version`: Gera _v2, _v3...
- `overwrite`: Substitui
- `error`: Lança exceção

### `resilience/` — Padrões de Resiliência

Retry, chunk isolation e fallback.

```typescript
import { withRetry, processChunks, withFallback } from './resilience/index.js';

// Retry com backoff exponencial
await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1000 });

// Chunk isolation
await processChunks(items, processFn, { maxConcurrency: 4 });

// Fallback por criticidade
await withFallback(fn, { criticality: 'P1', fallback: cachedData });
```

## Design Decisions

1. **Fail-Fast Input, Graceful Output**: Validação estrita nas fronteiras, fallback em dependências.
2. **Temp-First Write**: Nunca corrompe arquivo final.
3. **Structured Errors**: Erros consumíveis por código, não strings.
4. **Chunk Isolation**: Falha localizada não mata todo o build.

## Anti-Patterns Evitados

- ❌ Escrever direto no destino
- ❌ `catch (e) { console.log(e) }`
- ❌ Retry cego em erros lógicos
- ❌ Timeout infinito
- ❌ Abortar build por falha em 1 chunk

## Referência

Ver [`.rag/context/resilient-build/SKILL.md`](../../.rag/context/resilient-build/SKILL.md) para detalhes completos.
