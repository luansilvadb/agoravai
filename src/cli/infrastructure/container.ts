export const TOKENS = {
  CHANGE_REPOSITORY: 'ChangeRepository',
  GLOBAL_CONFIG_REPOSITORY: 'GlobalConfigRepository',
  FILE_SYSTEM: 'FileSystemPort',
  VALIDATOR: 'Validator',
  LOGGER: 'Logger',
} as const;

export class Container {
  private static instance: Container;
  private registry: Map<string, unknown> = new Map();
  private overrides: Map<string, unknown> = new Map();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  static reset(): void {
    Container.instance = new Container();
  }

  register<T>(token: string, implementation: T): void {
    this.registry.set(token, implementation);
  }

  resolve<T>(token: string): T {
    const override = this.overrides.get(token);
    if (override) return override as T;

    const impl = this.registry.get(token);
    if (!impl) throw new Error(`No implementation for ${token}`);
    return impl as T;
  }

  override<T>(token: string, implementation: T): void {
    this.overrides.set(token, implementation);
  }

  clearOverride(token: string): void {
    this.overrides.delete(token);
  }

  clearAllOverrides(): void {
    this.overrides.clear();
  }
}
