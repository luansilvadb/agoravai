import type { IFileSystem } from '../../domain/ports/IFileSystem.js';
import type { ILogger } from '../../domain/ports/ILogger.js';
import { FileCopyError } from '../../domain/errors/FileCopyError.js';
import { DirectoryCreationError } from '../../domain/errors/DirectoryCreationError.js';
import type { CopyTask } from '../dto/CopyTask.js';
import type { CopyResult } from '../dto/CopyResult.js';
import * as path from 'path';

export class CopyService {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly logger: ILogger
  ) {}

  executeTask(task: CopyTask): CopyResult {
    const result: CopyResult = {
      task,
      success: false,
      copiedFiles: 0,
      skippedFiles: 0,
    };

    try {
      this.logger.info(`Starting copy task: ${task.label}`, {
        source: task.source,
        target: task.target,
      });

      if (!this.fileSystem.exists(task.source)) {
        this.logger.warn(`Source does not exist, skipping`, {
          source: task.source,
        });
        result.success = true;
        return result;
      }

      const sourceStat = this.fileSystem.stat(task.source);

      if (sourceStat.isFile()) {
        this.copyFile(task.source, task.target, result);
      } else if (sourceStat.isDirectory()) {
        this.copyDirectory(task.source, task.target, result);
      }

      result.success = true;
      this.logger.info(`Completed copy task: ${task.label}`, {
        copiedFiles: result.copiedFiles,
        skippedFiles: result.skippedFiles,
      });
    } catch (error) {
      result.error = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed copy task: ${task.label}`, {
        error: result.error.message,
      });
    }

    return result;
  }

  private copyFile(source: string, target: string, result: CopyResult): void {
    const targetDir = path.dirname(target);

    if (!this.fileSystem.exists(targetDir)) {
      try {
        this.fileSystem.mkdir(targetDir, { recursive: true });
      } catch (error) {
        throw new DirectoryCreationError(targetDir, error);
      }
    }

    if (this.fileSystem.exists(target)) {
      const sourceStat = this.fileSystem.stat(source);
      const targetStat = this.fileSystem.stat(target);

      if (sourceStat.mtime <= targetStat.mtime) {
        this.logger.debug(`Skipping file (up to date)`, { target });
        result.skippedFiles++;
        return;
      }
    }

    try {
      this.fileSystem.copyFile(source, target);
      result.copiedFiles++;
      this.logger.debug(`Copied file`, { source, target });
    } catch (error) {
      throw new FileCopyError(source, target, error);
    }
  }

  private copyDirectory(source: string, target: string, result: CopyResult): void {
    if (!this.fileSystem.exists(target)) {
      try {
        this.fileSystem.mkdir(target, { recursive: true });
      } catch (error) {
        throw new DirectoryCreationError(target, error);
      }
    }

    const entries = this.fileSystem.readdir(source);

    for (const entry of entries) {
      const sourcePath = path.join(source, entry);
      const targetPath = path.join(target, entry);
      const stat = this.fileSystem.stat(sourcePath);

      if (stat.isFile()) {
        this.copyFile(sourcePath, targetPath, result);
      } else if (stat.isDirectory()) {
        this.copyDirectory(sourcePath, targetPath, result);
      }
    }
  }
}
