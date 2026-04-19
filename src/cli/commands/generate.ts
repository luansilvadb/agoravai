import { Container, TOKENS } from '../infrastructure/index.js';
import type { ChangeRepository } from '../domain/repositories.js';
import { getChangePath } from '../utils/config.js';
import { pathExists, readFile, writeFile, ensureDir } from '../utils/fs-utils.js';
import { join } from 'path';
import { MESSAGES, EXIT_CODES } from '../constants.js';

interface DetectedSpec {
  id: string;
  name: string;
  context: string;
  suggestedSections: string[];
}

// Analyze change content to detect needed capabilities
async function analyzeChangeContext(changePath: string): Promise<DetectedSpec[]> {
  const detected: DetectedSpec[] = [];
  const specsDir = join(changePath, 'specs');

  // Read all artifacts for context
  const [tasksContent, proposalContent, designContent] = await Promise.all([
    readFile(join(changePath, 'tasks.md')),
    readFile(join(changePath, 'proposal.md')),
    readFile(join(changePath, 'design.md'))
  ]);

  const fullContext = `${tasksContent || ''} ${proposalContent || ''} ${designContent || ''}`.toLowerCase();

  // Detect capabilities based on dynamic keywords
  const patterns: Array<{ keywords: string[]; id: string; name: string; sections: string[] }> = [
    { 
      keywords: ['config', 'validation', 'schema', 'zod'], 
      id: 'config-validation', 
      name: 'Config Validation',
      sections: ['Overview', 'Schema Definition', 'Validation Rules', 'Error Handling']
    },
    { 
      keywords: ['error', 'exception', 'result', 'failure'], 
      id: 'error-domain', 
      name: 'Error Domain',
      sections: ['Error Hierarchy', 'Error Types', 'Error Handling Strategy', 'Recovery Patterns']
    },
    { 
      keywords: ['filesystem', 'file', 'directory', 'io', 'fs'], 
      id: 'filesystem-port', 
      name: 'Filesystem Port',
      sections: ['Port Interface', 'Operations', 'Error Handling', 'Adapters']
    },
    { 
      keywords: ['log', 'logger', 'logging', 'debug', 'trace'], 
      id: 'logger-port', 
      name: 'Logger Port',
      sections: ['Port Interface', 'Log Levels', 'Context/Metadata', 'Adapters']
    },
    { 
      keywords: ['copy', 'duplicate', 'clone', 'backup'], 
      id: 'copy-operations', 
      name: 'Copy Operations',
      sections: ['Overview', 'Operations', 'Edge Cases', 'Performance']
    },
    { 
      keywords: ['port', 'adapter', 'hexagonal', 'interface', 'contract'], 
      id: 'ports-adapters', 
      name: 'Ports & Adapters',
      sections: ['Port Definitions', 'Adapter Implementations', 'Integration Points']
    },
    { 
      keywords: ['test', 'spec', 'jest', 'vitest', 'coverage'], 
      id: 'testing-strategy', 
      name: 'Testing Strategy',
      sections: ['Unit Tests', 'Integration Tests', 'Coverage Goals', 'Test Patterns']
    },
    { 
      keywords: ['cli', 'command', 'interface', 'args', 'flags'], 
      id: 'cli-interface', 
      name: 'CLI Interface',
      sections: ['Commands', 'Arguments/Flags', 'Output Formats', 'Error Messages']
    },
    { 
      keywords: ['refactor', 'clean', 'architecture', 'maintainability'], 
      id: 'refactoring', 
      name: 'Code Refactoring',
      sections: ['Goals', 'Strategy', 'Patterns to Apply', 'Validation Criteria']
    },
    { 
      keywords: ['domain', 'entity', 'value-object', 'aggregate'], 
      id: 'domain-model', 
      name: 'Domain Model',
      sections: ['Entities', 'Value Objects', 'Aggregates', 'Domain Services']
    }
  ];

  for (const pattern of patterns) {
    const specPath = join(specsDir, pattern.id, 'specs.md');
    
    // Only suggest if doesn't exist and keywords are detected
    if (!pathExists(specPath) && pattern.keywords.some(k => fullContext.includes(k))) {
      detected.push({
        id: pattern.id,
        name: pattern.name,
        context: `Detected keywords: ${pattern.keywords.filter(k => fullContext.includes(k)).join(', ')}`,
        suggestedSections: pattern.sections
      });
    }
  }

  // Detect generic specs based on complex tasks
  if (tasksContent) {
    const tasks = tasksContent.split('\n').filter(t => t.trim().startsWith('- ['));
    for (const task of tasks) {
      // If task seems complex (mentions multiple concepts), suggest dedicated spec
      const taskLower = task.toLowerCase();
      const hasComplexTerms = ['implement', 'create', 'design', 'refactor'].some(t => taskLower.includes(t));
      
      if (hasComplexTerms && task.length > 50) {
        // Extract spec name from task (first 3-4 significant words)
        const words = task.replace(/- \[ \] /, '').replace(/- \[x\] /, '').split(' ').slice(0, 4);
        const specId = words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '-')).join('-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        
        if (specId && !pathExists(join(specsDir, specId, 'specs.md'))) {
          const alreadyAdded = detected.find(d => d.id === specId);
          if (!alreadyAdded) {
            detected.push({
              id: specId,
              name: words.join(' '),
              context: `Derived from task: ${task.trim()}`,
              suggestedSections: ['Overview', 'Requirements', 'Implementation', 'Acceptance Criteria']
            });
          }
        }
      }
    }
  }

  return detected;
}

async function generateSpec(changePath: string, detected: DetectedSpec, changeName: string): Promise<void> {
  const specDir = join(changePath, 'specs', detected.id);
  const specPath = join(specDir, 'specs.md');

  await ensureDir(specDir);

  // Dynamic template based on detection
  const sections = detected.suggestedSections.map(s => `## ${s}\n\n`).join('\n');
  
  const content = `# ${detected.name}

> Context: ${detected.context}

## Overview

Specification for: **${detected.name}**

Part of change: \`${changeName}\`

${sections}
## Dependencies

- References: 
- Related Specs: 

## Status

- [ ] Draft
- [ ] In Review
- [ ] Approved
- [ ] Implemented

## Notes

<!-- Add notes as needed -->
`;

  await writeFile(specPath, content);
}

export async function generateCommand(options: Record<string, string | boolean>): Promise<void> {
  const changeName = options.change as string;
  const jsonOutput = options.json === true;
  const autoGenerate = options.auto === true;

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

  // Analyze context and dynamically detect needed specs
  const specsNeeded = await analyzeChangeContext(changePath);

  if (specsNeeded.length === 0) {
    if (jsonOutput) {
      console.log(JSON.stringify({ generated: [], message: 'No specs needed' }, null, 2));
    } else {
      console.log(`✓ No additional specs needed for '${changeName}'`);
    }
    return;
  }

  // Auto-generate or list
  const generated: string[] = [];

  for (const template of specsNeeded) {
    if (autoGenerate) {
      await generateSpec(changePath, template, changeName);
      generated.push(template.id);
    }
  }

  if (jsonOutput) {
    const result = {
      change: changeName,
      specsNeeded: specsNeeded.map(s => s.id),
      generated: autoGenerate ? generated : [],
      auto: autoGenerate
    };
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (autoGenerate) {
      console.log(`✔ Generated ${generated.length} specs dynamically for '${changeName}':`);
      for (const id of generated) {
        const spec = specsNeeded.find(s => s.id === id);
        console.log(`  - specs/${id}/specs.md (${spec?.name})`);
        if (spec) {
          console.log(`    Context: ${spec.context}`);
        }
      }
    } else {
      console.log(`Detected specs needed for '${changeName}' (based on context analysis):`);
      for (const spec of specsNeeded) {
        console.log(`  - specs/${spec.id}/specs.md`);
        console.log(`    Name: ${spec.name}`);
        console.log(`    Context: ${spec.context}`);
        console.log(`    Suggested Sections: ${spec.suggestedSections.join(', ')}`);
        console.log('');
      }
      console.log('Run with --auto to generate all detected specs');
    }
  }
}
