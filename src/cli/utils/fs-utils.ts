import { promises as fs, existsSync } from 'fs';
import { dirname } from 'path';

export async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function readFile(path: string): Promise<string | null> {
  try {
    return await fs.readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  await ensureDir(dirname(path));
  await fs.writeFile(path, content, 'utf-8');
}

export function pathExists(path: string): boolean {
  return existsSync(path);
}

export async function listDirs(path: string): Promise<string[]> {
  if (!existsSync(path)) return [];
  const entries = await fs.readdir(path, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}

export async function moveDir(src: string, dest: string): Promise<void> {
  await ensureDir(dirname(dest));
  await fs.rename(src, dest);
}
