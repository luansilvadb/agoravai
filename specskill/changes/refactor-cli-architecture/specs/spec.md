# Specs: Refactor CLI Architecture

## Visão Geral

Esta change é composta por múltiplas especificações focadas nas melhorias arquiteturais do Specskill CLI:

| Spec | Responsabilidade | Arquivo |
|------|------------------|---------|
| repository-pattern | Interfaces e implementação do Repository Pattern | `specs/repository-pattern/spec.md` |
| di-container | Container de injeção de dependências | `specs/di-container/spec.md` |
| commander-migration | Migração para Commander.js | `specs/commander-migration/spec.md` |
| constants-module | Módulo de constantes centralizado | `specs/constants-module/spec.md` |
| zod-validation | Validação de schemas com Zod | `specs/zod-validation/spec.md` |
| cycle-detection | Detecção de ciclos em dependências | `specs/cycle-detection/spec.md` |
| parallel-io | Paralelização de operações I/O | `specs/parallel-io/spec.md` |
| i18n-standardization | Padronização de mensagens em inglês | `specs/i18n-standardization/spec.md` |
| dry-run-mode | Modo preview para comandos destrutivos | `specs/dry-run-mode/spec.md` |

## Como usar

1. Cada spec é independente e pode ser implementada separadamente
2. A ordem sugerida segue as dependências entre specs
3. Execute `npm run specskill:apply -- --change refactor-cli-architecture --spec <spec-id>` para aplicar uma spec específica

## Estrutura de Pastas

```
specs/
├── spec.md                    # Este arquivo - índice
├── repository-pattern/
│   └── spec.md
├── di-container/
│   └── spec.md
├── commander-migration/
│   └── spec.md
├── constants-module/
│   └── spec.md
├── zod-validation/
│   └── spec.md
├── cycle-detection/
│   └── spec.md
├── parallel-io/
│   └── spec.md
├── i18n-standardization/
│   └── spec.md
└── dry-run-mode/
    └── spec.md
```

## Dependências entre Specs

```
repository-pattern ──┬──> di-container ──┬──> commander-migration
                   │                   ├──> zod-validation
                   │                   ├──> cycle-detection
                   │                   ├──> parallel-io
                   │                   ├──> i18n-standardization
                   │                   └──> dry-run-mode
                   └──> constants-module
```
