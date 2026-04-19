import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository } from '../domain/repositories.js';
import { CONFIG, getChangePath } from '../utils/config.js';
import { pathExists, readFile } from '../utils/fs-utils.js';
import { join } from 'path';
import { MESSAGES, EXIT_CODES } from '../constants.js';

interface Instruction {
  artifactId: string;
  template: string;
  instruction: string;
  outputPath: string;
  dependencies: string[];
  context?: string;
  rules?: string;
}

interface InstructionsOutput {
  contextFiles: string[];
  progress: {
    total: number;
    complete: number;
    remaining: number;
  };
  tasks?: Array<{
    id: string;
    desc: string;
    status: 'pending' | 'in-progress' | 'complete';
  }>;
  state?: 'ready' | 'blocked' | 'all_done';
  dynamicInstruction?: string;
}

export async function instructionsCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const artifactId = (options.id as string) || 'apply';
  const jsonOutput = options.json === true;

  if (!changeName) {
    console.error('Error: <name> is required');
    process.exit(EXIT_CODES.ERROR);
  }

  const container = Container.getInstance();
  const repository = container.resolve<ChangeRepository>(TOKENS.CHANGE_REPOSITORY);

  const change = await repository.getChange(changeName);

  if (!change) {
    console.error(`✖ Error: ${MESSAGES.ERROR_CHANGE_NOT_FOUND(changeName)}`);
    process.exit(EXIT_CODES.NOT_FOUND);
  }

  const changePath = getChangePath(changeName);

  const schemaName = CONFIG.DEFAULT_SCHEMA;
  const schema = CONFIG.SCHEMAS[schemaName];

  // Se for apply, retorna instruções de apply
  if (artifactId === 'apply') {
    const tasksPath = join(changePath, 'tasks.md');
    const designPath = join(changePath, 'design.md');
    const specsPath = join(changePath, 'specs', 'spec.md');
    const proposalPath = join(changePath, 'proposal.md');

    const contextFiles: string[] = [];
    if (pathExists(tasksPath)) contextFiles.push(tasksPath);
    if (pathExists(designPath)) contextFiles.push(designPath);
    if (pathExists(specsPath)) contextFiles.push(specsPath);
    if (pathExists(proposalPath)) contextFiles.push(proposalPath);

    // Contar tarefas
    let totalTasks = 0;
    let completeTasks = 0;
    const tasks: InstructionsOutput['tasks'] = [];

    if (pathExists(tasksPath)) {
      const content = await readFile(tasksPath) || '';
      const lines = content.split('\n');
      
      for (const line of lines) {
        const match = line.match(/^- \[([ x])\] (.+)$/);
        if (match) {
          totalTasks++;
          const isComplete = match[1] === 'x';
          if (isComplete) completeTasks++;
          tasks.push({
            id: `task-${totalTasks}`,
            desc: match[2] ?? '',
            status: isComplete ? 'complete' : 'pending'
          });
        }
      }
    }

    const remainingTasks = totalTasks - completeTasks;
    let state: InstructionsOutput['state'] = 'ready';
    if (remainingTasks === 0 && totalTasks > 0) {
      state = 'all_done';
    } else if (remainingTasks > 0 && !pathExists(tasksPath)) {
      state = 'blocked';
    }

    if (jsonOutput) {
      const result: InstructionsOutput = {
        contextFiles,
        progress: {
          total: totalTasks,
          complete: completeTasks,
          remaining: remainingTasks
        },
        tasks,
        state,
        dynamicInstruction: remainingTasks > 0 
          ? `Implemente as ${remainingTasks} tarefas pendentes de acordo com o design e especificações.`
          : 'Todas as tarefas foram concluídas. Pronto para arquivar.'
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`Instructions for ${changeName} (apply)`);
      console.log('');
      console.log(`Progress: ${completeTasks}/${totalTasks} tasks`);
      if (tasks && tasks.length > 0) {
        console.log('');
        console.log('Tasks:');
        for (const task of tasks) {
          const symbol = task.status === 'complete' ? '[x]' : '[ ]';
          console.log(`  ${symbol} ${task.desc}`);
        }
      }
    }
  } else {
    // Instruções para um artefato específico
    const artifactPath = join(changePath, `${artifactId}.md`);
    const exists = pathExists(artifactPath);

    if (jsonOutput) {
      const deps = schema.dependencies[artifactId as keyof typeof schema.dependencies] ?? [];
      const instruction: Instruction = {
        artifactId,
        template: getTemplateForArtifact(artifactId),
        instruction: getInstructionForArtifact(artifactId, changeName),
        outputPath: artifactPath,
        dependencies: [...deps],
        context: 'Generate complete and detailed content',
        rules: 'Follow project patterns'
      };
      console.log(JSON.stringify(instruction, null, 2));
    } else {
      console.log(`Instructions for ${artifactId}`);
      console.log(`Output: ${artifactPath}`);
      console.log(`Status: ${exists ? 'exists' : 'not created'}`);
    }
  }
}

function getTemplateForArtifact(artifactId: string): string {
  const templates: Record<string, string> = {
    proposal: `# Proposal\n\n## Contexto\n\n## Problema\n\n## Solução Proposta\n\n## Escopo\n\n## Critérios de Aceitação\n`,
    design: `# Design\n\n## Arquitetura\n\n## Componentes\n\n## Fluxos\n\n## Decisões Técnicas\n`,
    specs: `# Specs\n\n## Requisitos Funcionais\n\n## Requisitos Não-Funcionais\n\n## APIs\n\n## Modelos de Dados\n`,
    tasks: `# Tasks\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n`
  };
  return templates[artifactId] || `# ${artifactId}\n\n`;
}

function getInstructionForArtifact(artifactId: string, changeName: string): string {
  const instructions: Record<string, string> = {
    proposal: `Crie uma proposta completa para a change "${changeName}".`,
    design: `Crie o documento de design técnico baseado na proposta.`,
    specs: `Defina as especificações técnicas detalhadas.`,
    tasks: `Gere a lista de tarefas implementáveis baseadas no design e specs.`
  };
  return instructions[artifactId] || `Crie o artefato ${artifactId}.`;
}
