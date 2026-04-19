import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { rmSync } from 'fs';
import { generateInTemp, validateOutput, atomicMove, cleanupTemp } from '../../../src/infrastructure/atomic-io/index.js';
import { OutputInvalid } from '../../../src/infrastructure/atomic-io/types.js';

describe('Atomic Writes', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'atomic-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Task 3.1: generateInTemp', () => {
    it('deve gerar arquivo em temp', async () => {
      const tempPath = await generateInTemp(
        { data: 'test' },
        async (data, path) => {
          writeFileSync(path, JSON.stringify(data));
        },
        tempDir
      );

      expect(existsSync(tempPath)).toBe(true);
      expect(tempPath).toContain('.tmp');
    });

    it('deve limpar temp se transform falhar', async () => {
      let tempPathAttempted: string | undefined;

      await expect(
        generateInTemp(
          { data: 'test' },
          async (_, path) => {
            tempPathAttempted = path;
            throw new Error('Transform failed');
          },
          tempDir
        )
      ).rejects.toThrow('Transform failed');

      // Temp file should be cleaned up
      if (tempPathAttempted) {
        expect(existsSync(tempPathAttempted)).toBe(false);
      }
    });
  });

  describe('Task 3.2: validateOutput 3 camadas', () => {
    it('deve detectar arquivo vazio', async () => {
      const emptyFile = join(tempDir, 'empty.txt');
      writeFileSync(emptyFile, '');

      const result = await validateOutput(emptyFile, { minSize: 10 });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File is empty (0 bytes)');
    });

    it('deve validar tamanho mínimo', async () => {
      const file = join(tempDir, 'small.txt');
      writeFileSync(file, 'tiny');

      const result = await validateOutput(file, { minSize: 100 });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('below minimum 100');
    });

    it('deve validar magic bytes', async () => {
      const pngFile = join(tempDir, 'test.png');
      const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      writeFileSync(pngFile, Buffer.concat([pngHeader, Buffer.from('image data')]));

      const result = await validateOutput(pngFile, { magicBytes: pngHeader });

      expect(result.valid).toBe(true);
      expect(result.checks.magicBytesValid).toBe(true);
    });

    it('deve detectar magic bytes inválidos', async () => {
      const file = join(tempDir, 'fake.png');
      writeFileSync(file, 'not a png file');

      const result = await validateOutput(file, {
        magicBytes: Buffer.from([0x89, 0x50, 0x4E, 0x47]),
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Magic bytes mismatch');
    });

    it('deve validar estrutura customizada', async () => {
      const jsonFile = join(tempDir, 'test.json');
      writeFileSync(jsonFile, '{"valid": true}');

      const result = await validateOutput(jsonFile, {
        validator: (path) => {
          try {
            JSON.parse(readFileSync(path, 'utf-8'));
            return { valid: true };
          } catch {
            return { valid: false, errors: ['Invalid JSON'] };
          }
        },
      });

      expect(result.valid).toBe(true);
      expect(result.checks.structureValid).toBe(true);
    });
  });

  describe('Task 3.3: atomicMove', () => {
    it('deve mover arquivo para destino', async () => {
      const tempFile = join(tempDir, 'temp.txt');
      const destFile = join(tempDir, 'final.txt');
      writeFileSync(tempFile, 'content');

      const result = await atomicMove(tempFile, destFile, 'error');

      expect(result.finalPath).toBe(destFile);
      expect(existsSync(tempFile)).toBe(false);
      expect(existsSync(destFile)).toBe(true);
    });

    it('deve lançar se destino existe com strategy error', async () => {
      const tempFile = join(tempDir, 'temp.txt');
      const destFile = join(tempDir, 'exists.txt');
      writeFileSync(tempFile, 'new content');
      writeFileSync(destFile, 'existing');

      await expect(atomicMove(tempFile, destFile, 'error')).rejects.toThrow(OutputInvalid);
    });
  });

  describe('Task 3.4: versionamento automático', () => {
    it('deve criar _v2 se arquivo existe', async () => {
      const tempFile = join(tempDir, 'temp.txt');
      const destFile = join(tempDir, 'output.txt');
      writeFileSync(tempFile, 'new content');
      writeFileSync(destFile, 'existing');

      const result = await atomicMove(tempFile, destFile, 'version');

      expect(result.versioned).toBe(true);
      expect(result.finalPath).toContain('_v2.txt');
      expect(existsSync(result.finalPath)).toBe(true);
    });

    it('deve criar _v3 se _v2 existe', async () => {
      const tempFile = join(tempDir, 'temp.txt');
      const destFile = join(tempDir, 'output.txt');
      writeFileSync(tempFile, 'new content');
      writeFileSync(destFile, 'v1');
      writeFileSync(join(tempDir, 'output_v2.txt'), 'v2');

      const result = await atomicMove(tempFile, destFile, 'version');

      expect(result.versioned).toBe(true);
      expect(result.finalPath).toContain('_v3.txt');
    });
  });

  describe('Task 3.5: cleanupTemp', () => {
    it('deve remover arquivo temp', async () => {
      const tempFile = join(tempDir, 'temp.txt');
      writeFileSync(tempFile, 'content');

      await cleanupTemp(tempFile);

      expect(existsSync(tempFile)).toBe(false);
    });

    it('deve ignorar se arquivo não existe', async () => {
      const nonExistent = join(tempDir, 'does-not-exist.txt');

      await expect(cleanupTemp(nonExistent)).resolves.not.toThrow();
    });
  });
});
