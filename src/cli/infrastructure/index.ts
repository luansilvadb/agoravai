import { Container, TOKENS } from './container.js';
import { NodeFileSystem } from './fs.js';
import { FsChangeRepository } from './fs-change-repository.js';
import { FsGlobalConfigRepository } from './fs-global-config-repository.js';

export function registerDefaults(): void {
  const container = Container.getInstance();

  const fs = new NodeFileSystem();
  container.register(TOKENS.FILE_SYSTEM, fs);
  container.register(TOKENS.CHANGE_REPOSITORY, new FsChangeRepository(fs));
  container.register(TOKENS.GLOBAL_CONFIG_REPOSITORY, new FsGlobalConfigRepository(fs));
}

export { Container, TOKENS } from './container.js';
export { NodeFileSystem } from './fs.js';
export { FsChangeRepository } from './fs-change-repository.js';
export { FsGlobalConfigRepository } from './fs-global-config-repository.js';
export { MockChangeRepository } from './mock-change-repository.js';
