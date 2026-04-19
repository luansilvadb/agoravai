import * as fs from 'fs';
import * as path from 'path';
import type { IFileSystem, FileStats, MkdirOptions } from '../../domain/ports/IFileSystem.js';
import { FileCopyError } from '../../domain/errors/FileCopyError.js';
import { DirectoryCreationError } from '../../domain/errors/DirectoryCreationError.js';

export class NodeFileSystem implements IFileSystem {
  exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  mkdir(dirPath: string, options?: MkdirOptions): void {
    try {
      fs.mkdirSync(dirPath, { recursive: options?.recursive ?? false });
    } catch (error) {
      throw new DirectoryCreationError(dirPath, error);
    }
  }

  readdir(dirPath: string): string[] {
    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      throw new Error(`Failed to read directory "${dirPath}": ${error}`);
    }
  }

  stat(filePath: string): FileStats {
    try {
      const stats = fs.statSync(filePath);
      return {
        isFile: () => stats.isFile(),
        isDirectory: () => stats.isDirectory(),
        size: stats.size,
        mtime: stats.mtime,
      };
    } catch (error) {
      throw new Error(`Failed to stat "${filePath}": ${error}`);
    }
  }

  copyFile(src: string, dest: string): void {
    try {
      fs.copyFileSync(src, dest);
    } catch (error) {
      throw new FileCopyError(src, dest, error);
    }
  }
}
