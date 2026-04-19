import { CONFIG, getChangePath, getConfigPath } from '../utils/config.js';
import { ensureDir, pathExists, writeFile } from '../utils/fs-utils.js';
import { join } from 'path';

const ARTIFACT_TEMPLATES: Record<string, string> = {
  proposal: `# Proposal: {{name}}

## Contexto

## Problema

## Solução Proposta

## Escopo

## Critérios de Aceitação
`,
  design: `# Design: {{name}}

## Arquitetura

## Componentes

## Fluxos

## Decisões Técnicas
`,
  tasks: `# Tasks: {{name}}

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
`
};

function getArtifactTemplate(artifactId: string, name: string): string {
  const template = ARTIFACT_TEMPLATES[artifactId] || `# ${artifactId}: ${name}\n\n`;
  return template.replace(/\{\{name\}\}/g, name);
}

export async function newChangeCommand(name: string, options: Record<string, string | boolean> = {}): Promise<void> {
  if (!name) {
    console.error('Erro: Nome da change é obrigatório');
    console.error('Uso: specskill new change <name> [--schema <schema>]');
    process.exit(1);
  }

  const changePath = getChangePath(name);

  if (pathExists(changePath)) {
    console.error(`✖ Error: Change '${name}' already exists at ${changePath}`);
    process.exit(1);
  }

  // Determinar schema
  const schemaName = (options.schema as string) || CONFIG.DEFAULT_SCHEMA;
  const schema = CONFIG.SCHEMAS[schemaName as keyof typeof CONFIG.SCHEMAS];

  if (!schema) {
    console.error(`✖ Error: Invalid schema '${schemaName}'`);
    console.error(`Valid schemas: ${Object.keys(CONFIG.SCHEMAS).join(', ')}`);
    process.exit(1);
  }

  // Criar diretório da change
  await ensureDir(changePath);

  // Criar arquivo de configuração
  const configContent = `schema: ${schemaName}
name: ${name}
created: ${new Date().toISOString()}
`;
  await writeFile(getConfigPath(name), configContent);

  // Criar diretório specs dentro da change
  const specsDir = join(changePath, 'specs');
  await ensureDir(specsDir);

  // Criar artefatos do schema com templates vazios (exceto specs que vai pra pasta specs/)
  for (const artifact of schema.artifacts) {
    if (artifact === 'specs') {
      // specs.md vira specs/spec.md - com estrutura de separação por responsabilidade
      const template = `# Specs: {{name}}

## Visão Geral

Esta change é composta por múltiplas especificações de responsabilidade única:

| Capability | Responsabilidade | Arquivo |
|------------|------------------|---------|
| config-validation | Validação de configuração | \`specs/config-validation/spec.md\` |
| error-domain | Domínio de erros | \`specs/error-domain/spec.md\` |
| filesystem-port | Porta filesystem | \`specs/filesystem-port/spec.md\` |
| logger-port | Porta logger | \`specs/logger-port/spec.md\` |
| copy-operations | Operações de cópia | \`specs/copy-operations/spec.md\` |

## Como usar

1. Cada capability tem sua própria pasta em \`specs/<capability>/\`
2. Cada spec.md é independente e focada em uma responsabilidade
3. Use \`npm run specskill:generate -- --change {{name}} --auto\` para gerar specs automaticamente

## Estrutura de Pastas

\`\`\`
specs/
├── spec.md                 # Este arquivo - índice/overview
├── config-validation/
│   └── spec.md            # Spec detalhada
├── error-domain/
│   └── spec.md
├── filesystem-port/
│   └── spec.md
├── logger-port/
│   └── spec.md
└── copy-operations/
    └── spec.md
\`\`\`
`;
      await writeFile(join(specsDir, 'spec.md'), template.replace(/\{\{name\}\}/g, name));
    } else {
      const template = getArtifactTemplate(artifact, name);
      await writeFile(join(changePath, `${artifact}.md`), template);
    }
  }

  console.log(`✔ Created change '${name}' at ${changePath}/ (schema: ${schemaName})`);
}
