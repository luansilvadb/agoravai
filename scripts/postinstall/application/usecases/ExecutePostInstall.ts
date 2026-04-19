import type { ILogger } from '../../domain/ports/ILogger.js';
import type { CopyService } from '../services/CopyService.js';
import type { CopyTask } from '../dto/CopyTask.js';
import type { CopyResult } from '../dto/CopyResult.js';
import * as path from 'path';

export interface PostInstallSummary {
  success: boolean;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  totalCopied: number;
  totalSkipped: number;
  results: CopyResult[];
}

export class ExecutePostInstall {
  private readonly tasks: CopyTask[];
  private readonly packageRoot: string;
  private readonly userProjectRoot: string;

  constructor(
    private readonly copyService: CopyService,
    private readonly logger: ILogger,
    packageRoot: string,
    userProjectRoot: string = process.cwd()
  ) {
    this.packageRoot = packageRoot;
    this.userProjectRoot = userProjectRoot;
    
    this.tasks = [
      {
        source: path.join(packageRoot, '.windsurf', 'workflows'),
        target: path.join(userProjectRoot, '.windsurf', 'workflows'),
        label: 'Windsurf Workflows',
      },
      {
        source: path.join(packageRoot, 'specskill', 'changes'),
        target: path.join(userProjectRoot, 'specskill', 'changes'),
        label: 'SpecSkill Changes',
      },
      {
        source: path.join(packageRoot, '.rag', 'context'),
        target: path.join(userProjectRoot, '.rag', 'context'),
        label: 'RAG Context',
      },
    ];
  }

  execute(): PostInstallSummary {
    this.logger.info('Starting post-install copy operations', {
      packageRoot: this.packageRoot,
      userProjectRoot: this.userProjectRoot,
    });

    const results: CopyResult[] = [];

    for (const task of this.tasks) {
      const result = this.copyService.executeTask(task);
      results.push(result);
    }

    const summary = this.aggregateResults(results);

    this.logSummary(summary);

    return summary;
  }

  private aggregateResults(results: CopyResult[]): PostInstallSummary {
    const successfulTasks = results.filter((r) => r.success && r.copiedFiles > 0).length;
    const failedTasks = results.filter((r) => !r.success).length;
    const totalCopied = results.reduce((sum, r) => sum + r.copiedFiles, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skippedFiles, 0);

    return {
      success: failedTasks === 0,
      totalTasks: results.length,
      successfulTasks,
      failedTasks,
      totalCopied,
      totalSkipped,
      results,
    };
  }

  private logSummary(summary: PostInstallSummary): void {
    if (summary.success) {
      this.logger.info('Post-install completed successfully', {
        totalTasks: summary.totalTasks,
        copiedFiles: summary.totalCopied,
        skippedFiles: summary.totalSkipped,
      });
    } else {
      this.logger.error('Post-install completed with errors', {
        totalTasks: summary.totalTasks,
        failedTasks: summary.failedTasks,
        copiedFiles: summary.totalCopied,
      });
    }
  }

  getExitCode(summary: PostInstallSummary): number {
    return summary.success ? 0 : 1;
  }
}
