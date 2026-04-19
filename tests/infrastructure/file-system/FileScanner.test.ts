import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { FileScanner } from '../../../src/infrastructure/file-system/FileScanner.js';
import { FileScanError } from '../../../src/domain/errors/FileScanError.js';

describe('FileScanner', () => {
  let tempDir: string;
  let scanner: FileScanner;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'filescanner-test-'));
    scanner = new FileScanner();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('deve retornar apenas arquivos .md', async () => {
    writeFileSync(join(tempDir, 'test.md'), 'content');
    writeFileSync(join(tempDir, 'test.txt'), 'content');
    writeFileSync(join(tempDir, 'test.js'), 'content');

    const files = await scanner.scan(tempDir);

    expect(files).toHaveLength(1);
    expect(files[0]).toContain('test.md');
  });

  it('deve escanear recursivamente subdiretórios', async () => {
    const subDir = join(tempDir, 'subdir');
    mkdirSync(subDir);
    writeFileSync(join(tempDir, 'root.md'), 'content');
    writeFileSync(join(subDir, 'nested.md'), 'content');

    const files = await scanner.scan(tempDir);

    expect(files).toHaveLength(2);
    expect(files.some((f) => f.includes('root.md'))).toBe(true);
    expect(files.some((f) => f.includes('nested.md'))).toBe(true);
  });

  it('deve retornar array vazio para diretório sem .md', async () => {
    writeFileSync(join(tempDir, 'test.txt'), 'content');

    const files = await scanner.scan(tempDir);

    expect(files).toEqual([]);
  });

  it('deve retornar array vazio para diretório vazio', async () => {
    const files = await scanner.scan(tempDir);

    expect(files).toEqual([]);
  });

  it('deve lançar FileScanError quando diretório não existe', async () => {
    const nonExistentDir = join(tempDir, 'non-existent');

    await expect(scanner.scan(nonExistentDir)).rejects.toThrow(FileScanError);
  });
});
