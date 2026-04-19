import { mkdir, writeFile, unlink, rename, stat, readFile, open } from 'fs/promises';
import { dirname, join, parse } from 'path';
import { existsSync } from 'fs';
import { OutputValidation, OutputValidationResult, OutputInvalid, AtomicWriteResult } from './types.js';

export async function generateInTemp<T>(
  data: T,
  transformFn: (data: T, tempPath: string) => Promise<void>,
  tempDir?: string
): Promise<string> {
  const tmpDir = tempDir ?? process.env.TEMP ?? '/tmp';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const tempPath = join(tmpDir, `build_${timestamp}_${random}.tmp`);

  await mkdir(dirname(tempPath), { recursive: true });

  try {
    await transformFn(data, tempPath);
    return tempPath;
  } catch (error) {
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

export async function validateOutput(
  path: string,
  expected: OutputValidation
): Promise<OutputValidationResult> {
  const checks: OutputValidationResult['checks'] = {};
  const errors: string[] = [];

  // Layer 1: Existence and size
  try {
    const stats = await stat(path);
    checks.sizeBytes = stats.size;

    if (stats.size === 0) {
      errors.push('File is empty (0 bytes)');
    }

    if (expected.minSize !== undefined && stats.size < expected.minSize) {
      errors.push(`File size ${stats.size} is below minimum ${expected.minSize}`);
    }
  } catch (e) {
    errors.push(`Cannot read file: ${e instanceof Error ? e.message : String(e)}`);
    return { valid: false, checks, errors };
  }

  // Layer 2: Magic bytes
  if (expected.magicBytes !== undefined) {
    try {
      const fd = await open(path, 'r');
      const header = Buffer.alloc(expected.magicBytes.length);
      await fd.read(header, 0, expected.magicBytes.length, 0);
      await fd.close();
      checks.magicBytesValid = header.equals(expected.magicBytes);

      if (!checks.magicBytesValid) {
        errors.push(`Magic bytes mismatch: got ${header.toString('hex')}, expected ${expected.magicBytes.toString('hex')}`);
      }
    } catch (e) {
      errors.push(`Cannot read magic bytes: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Layer 3: Structure validation
  if (expected.validator !== undefined) {
    try {
      const result = expected.validator(path);
      checks.structureValid = result.valid;

      if (!result.valid && result.errors) {
        errors.push(...result.errors);
      }
    } catch (e) {
      errors.push(`Structure validation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    valid: errors.length === 0,
    checks,
    errors,
  };
}

export async function atomicMove(
  tempPath: string,
  finalPath: string,
  collisionStrategy: 'overwrite' | 'version' | 'error' = 'version'
): Promise<AtomicWriteResult> {
  await mkdir(dirname(finalPath), { recursive: true });

  let targetPath = finalPath;
  let versioned = false;
  let originalName: string | undefined;

  // Handle collision
  if (existsSync(finalPath)) {
    switch (collisionStrategy) {
      case 'error':
        throw new OutputInvalid(`Destination already exists: ${finalPath}`);

      case 'version': {
        const { dir, name, ext } = parse(finalPath);
        let version = 2;
        originalName = finalPath;

        do {
          targetPath = join(dir, `${name}_v${version}${ext}`);
          version++;
        } while (existsSync(targetPath));

        versioned = true;
        break;
      }

      case 'overwrite':
        // Proceed with targetPath = finalPath
        break;
    }
  }

  try {
    await rename(tempPath, targetPath);
  } catch (error) {
    // If rename fails (cross-device), try copy + delete
    try {
      const content = await readFile(tempPath);
      await writeFile(targetPath, content);
      await unlink(tempPath);
    } catch (copyError) {
      throw new OutputInvalid(
        `Failed to move file: ${error instanceof Error ? error.message : String(error)}`,
        [copyError instanceof Error ? copyError.message : String(copyError)]
      );
    }
  }

  return {
    tempPath,
    finalPath: targetPath,
    versioned,
    originalName,
  };
}

export async function cleanupTemp(tempPath: string): Promise<void> {
  try {
    await unlink(tempPath);
  } catch {
    // Ignore if file doesn't exist
  }
}
