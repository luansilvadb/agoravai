import { z } from 'zod';
import yaml from 'js-yaml';

export const ChangeConfigSchema = z.object({
  name: z.string().min(1),
  schema: z.enum(['spec-driven', 'minimal']),
  created: z.union([z.string().datetime(), z.date()]).transform((val) =>
    val instanceof Date ? val.toISOString() : val
  ),
  artifacts: z.array(z.string()).optional(),
});

export const GlobalConfigSchema = z.object({
  version: z.string(),
  lastArchiveId: z.number().int().nonnegative(),
  defaultSchema: z.enum(['spec-driven', 'minimal']),
  created: z.union([z.string().datetime(), z.date()]).transform((val) =>
    val instanceof Date ? val.toISOString() : val
  ),
});

export const StringArrayRecordSchema = z.record(z.string(), z.array(z.string()));

export type ArtifactDependencies = Record<string, string[]>;

export function validateNoCycles(deps: unknown): { valid: boolean; error?: string } {
  const parsed = StringArrayRecordSchema.safeParse(deps);
  if (!parsed.success) {
    return { valid: false, error: 'Invalid dependencies format' };
  }
  if (hasCycle(parsed.data)) {
    return { valid: false, error: 'Circular dependency detected' };
  }
  return { valid: true };
}

export const ChangeNameSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Change name must be lowercase alphanumeric with hyphens only');

export type ChangeConfig = z.infer<typeof ChangeConfigSchema>;
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

function hasCycle(deps: Record<string, string[]>): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    for (const neighbor of deps[node] || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of Object.keys(deps)) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

export function parseYaml<T>(content: string, schema: z.ZodSchema<T>): T | null {
  try {
    const parsed = yaml.load(content);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function serializeYaml(data: unknown): string {
  return yaml.dump(data);
}

export function validateChangeName(name: string): boolean {
  return ChangeNameSchema.safeParse(name).success;
}

export function getValidationErrors<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): string[] {
  const result = schema.safeParse(data);
  if (result.success) return [];

  return result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`);
}
