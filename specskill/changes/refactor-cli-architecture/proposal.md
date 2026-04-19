# Proposal: Refactor CLI Architecture

## Contexto

O Specskill CLI é uma ferramenta de linha de comando para gerenciamento de changes no workflow spec-driven. Após análise profunda da codebase, identificamos múltiplos gaps arquiteturais que dificultam manutenção, testabilidade e escalabilidade.

## Problema

### 1. Acoplamento Direto ao File System
Todos os comandos dependem diretamente de `fs-utils.ts` e paths hardcoded. Isso dificulta:
- Testes unitários (mocking complexo)
- Troca de implementação de storage
- Testes de integração isolados

### 2. Parser de Args Frágil
O parser custom em `index.ts` não suporta:
- Flags compostas com valores espaçados
- Short flags (ex: `-c` para `--change`)
- Validação de tipos

### 3. Magic Strings Espalhadas
Strings como `'specskill/changes'`, `'spec.md'`, `'archive'` espalhadas em 5+ arquivos dificultam refactoring.

### 4. Schema Dependencies com Type Casting
Uso de `as keyof typeof schema.dependencies` obrigatório para acessar dependências, impedindo extensibilidade de schemas.

### 5. I/O Sequencial
Leitura de specs granulares em loop sequencial (`for...of`) ao invés de paralela com `Promise.all()`.

### 6. Sem Validação de Schema YAML
Arquivo `.specskill.yaml` criado sem validação de conteúdo - risco de corrupção manual.

### 7. Sem Verificação de Ciclos
Schema permite dependências circulares sem detecção.

### 8. Mix de Idiomas
Mensagens de erro em PT/EN inconsistêntes.

## Solução Proposta

Implementar melhorias em 3 fases:

### Fase 1: Fundação (Alta Prioridade)
1. **Repository Pattern + DI Container** - Desacoplar comandos do filesystem
2. **Migrar para Commander.js** - Parser robusto de args
3. **Constants Module** - Centralizar magic strings
4. **Validação de Schema YAML** - Usar Zod para validação

### Fase 2: Qualidade (Média Prioridade)
5. **Detecção de ciclos** - Algoritmo DFS em dependências
6. **Paralelização de I/O** - `Promise.all()` para specs
7. **i18n** - Padronizar em inglês com suporte futuro a locales
8. **Dry-run mode** - Segurança em comandos destrutivos

### Fase 3: UX Avançada (Baixa Prioridade)
9. **Fuzzy matching** - Correção de typos em nomes de change
10. **Cache de análise** - Baseado em mtime
11. **Logging estruturado** - Níveis debug/info/warn/error

## Escopo

### Incluído
- Refatoração de todos os comandos em `src/cli/commands/`
- Implementação de interfaces Repository
- Configuração do Commander.js
- Módulo de constantes centralizado
- Validação Zod para YAML
- Detecção de ciclos em dependências
- Paralelização de leitura de specs

### Não Incluído
- Mudanças em funcionalidades existentes (manter comportamento)
- Breaking changes na CLI (manter compatibilidade)
- Alterações no workflow specskill-propose

## Critérios de Aceitação

- [x] Todos os comandos usam Repository Pattern via DI
- [x] Parser de args migrado para Commander.js
- [x] Zero magic strings - todas as constantes centralizadas
- [x] Validação Zod para `.specskill.yaml`
- [x] Detecção de ciclos em dependências implementada
- [x] I/O paralelo para specs granulares
- [x] Mensagens padronizadas em inglês
- [x] Dry-run mode implementado em comandos destrutivos
- [x] Testes unitários passando com mocks de repository
- [x] Build passando sem erros de TypeScript
