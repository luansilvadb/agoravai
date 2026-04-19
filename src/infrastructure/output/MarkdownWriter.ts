import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import type { IOutputWriter } from '../../domain/interfaces/IOutputWriter.js';
import type { Skill } from '../../domain/entities/Skill.js';
import { OutputWriteError } from '../../domain/errors/OutputWriteError.js';

export class MarkdownWriter implements IOutputWriter {
  constructor(private readonly outputPath: string) {}

  async write(results: Skill[], prompt: string): Promise<void> {
    try {
      const dirPath = dirname(this.outputPath);
      await mkdir(dirPath, { recursive: true });

      if (results.length === 0) {
        await writeFile(this.outputPath, 'Nenhuma skill específica necessária para esta tarefa.\n');
        return;
      }

      let content = `# CONTEXTO DE SKILLS INJETADAS PELO RAG\n\n`;
      content += `O RAG detectou que as seguintes diretrizes são vitais para a tarefa: "${prompt}"\n\n`;

      for (const result of results) {
        content += `## ORIGEM: ${result.filePath}\n${result.content}\n\n---\n\n`;
      }

      await writeFile(this.outputPath, content);
    } catch (error) {
      throw new OutputWriteError(this.outputPath, error instanceof Error ? error : undefined);
    }
  }
}
