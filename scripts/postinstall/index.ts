#!/usr/bin/env node

import { ConsoleLogger } from './infrastructure/adapters/ConsoleLogger.js';
import { NodeFileSystem } from './infrastructure/adapters/NodeFileSystem.js';
import { loadConfig } from './infrastructure/config/AppConfig.js';
import { CopyService } from './application/services/CopyService.js';
import { ExecutePostInstall } from './application/usecases/ExecutePostInstall.js';
import * as path from 'path';
import * as url from 'url';

function main(): void {
  const config = loadConfig();
  
  const logger = new ConsoleLogger(config.logLevel);
  const fileSystem = new NodeFileSystem();
  
  // Package root is where this script lives (inside node_modules)
  const __filename = url.fileURLToPath(import.meta.url);
  const packageRoot = path.resolve(__filename, '..', '..', '..');
  
  // User project root: INIT_CWD is set by npm to the original directory
  const userProjectRoot = process.env.INIT_CWD || process.cwd();
  
  const copyService = new CopyService(fileSystem, logger);
  const useCase = new ExecutePostInstall(copyService, logger, packageRoot, userProjectRoot);
  
  logger.info('Post-install script starting', { 
    logLevel: config.logLevel,
    packageRoot,
    userProjectRoot 
  });
  
  const summary = useCase.execute();
  const exitCode = useCase.getExitCode(summary);
  
  logger.info('Post-install script finished', { exitCode });
  
  process.exit(exitCode);
}

main();
