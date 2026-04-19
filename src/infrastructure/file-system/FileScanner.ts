import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import type { IFileScanner } from '../../domain/interfaces/IFileScanner.js';
import { FileScanError } from '../../domain/errors/FileScanError.js';

export class FileScanner implements IFileScanner {
  async scan(directory: string): Promise<string[]> {
    const files: string[] = [];

    try {
      await this.scanRecursive(directory, files);
    } catch (error) {
      throw new FileScanError(directory, error instanceof Error ? error : undefined);
    }

    return files;
  }

  private async scanRecursive(dir: string, files: string[]): Promise<void> {
    const entries: string[] = await readdir(dir);

    for (const entry of entries) {
      const fullPath: string = join(dir, entry);
      const entryStat = await stat(fullPath);

      if (entryStat.isDirectory()) {
        await this.scanRecursive(fullPath, files);
      } else if (extname(entry) === '.md') {
        files.push(fullPath);
      }
    }
  }
}
