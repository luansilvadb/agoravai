import type { Change, ChangeRepository } from '../domain/repositories.js';

export class MockChangeRepository implements ChangeRepository {
  private changes: Map<string, Change> = new Map();
  private archived: Map<string, Change> = new Map();

  async exists(name: string): Promise<boolean> {
    return this.changes.has(name);
  }

  async getChange(name: string): Promise<Change | null> {
    return this.changes.get(name) || null;
  }

  async save(change: Change): Promise<void> {
    this.changes.set(change.name, { ...change });
  }

  async list(): Promise<string[]> {
    return Array.from(this.changes.keys());
  }

  async archive(name: string, archiveId: string): Promise<void> {
    const change = this.changes.get(name);
    if (change) {
      this.changes.delete(name);
      this.archived.set(`${archiveId}-${name}`, change);
    }
  }

  // Test helpers
  clear(): void {
    this.changes.clear();
    this.archived.clear();
  }

  getArchived(name: string): Change | undefined {
    return this.archived.get(name);
  }

  setMockChange(change: Change): void {
    this.changes.set(change.name, change);
  }
}
