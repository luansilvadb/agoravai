import { describe, it, expect } from 'vitest';
import {
  formatPreview,
  formatSimplePreview,
  type PreviewItem,
  type PreviewSummary,
} from '../../../src/cli/utils/formatters.js';

describe('Formatters', () => {
  describe('formatPreview', () => {
    it('should format preview with multiple items', () => {
      const summary: PreviewSummary = {
        title: 'Create change my-change',
        items: [
          { action: 'create', path: 'file1.txt', description: 'config' },
          { action: 'create', path: 'file2.md', description: 'doc' },
        ],
      };

      const result = formatPreview(summary);

      expect(result).toContain('[DRY-RUN]');
      expect(result).toContain('Create change my-change');
      expect(result).toContain('+ file1.txt (config)');
      expect(result).toContain('+ file2.md (doc)');
      expect(result).toContain('No changes applied');
    });

    it('should format different action types with correct icons', () => {
      const summary: PreviewSummary = {
        title: 'Mixed operations',
        items: [
          { action: 'create', path: 'new.txt' },
          { action: 'update', path: 'changed.txt' },
          { action: 'delete', path: 'old.txt' },
          { action: 'move', path: 'moved.txt' },
          { action: 'archive', path: 'archived.txt' },
        ],
      };

      const result = formatPreview(summary);

      expect(result).toContain('+ new.txt');
      expect(result).toContain('~ changed.txt');
      expect(result).toContain('- old.txt');
      expect(result).toContain('→ moved.txt');
      expect(result).toContain('▒ archived.txt');
    });

    it('should handle items without description', () => {
      const summary: PreviewSummary = {
        title: 'Simple items',
        items: [
          { action: 'create', path: 'file.txt' },
        ],
      };

      const result = formatPreview(summary);

      expect(result).toContain('+ file.txt');
      expect(result).not.toContain('()');
    });

    it('should handle empty items list', () => {
      const summary: PreviewSummary = {
        title: 'Empty operation',
        items: [],
      };

      const result = formatPreview(summary);

      expect(result).toContain('[DRY-RUN]');
      expect(result).toContain('No changes applied');
    });
  });

  describe('formatSimplePreview', () => {
    it('should format simple preview without details', () => {
      const result = formatSimplePreview('Archive change', 'my-change');

      expect(result).toContain('[DRY-RUN]');
      expect(result).toContain('Archive change');
      expect(result).toContain('Target: my-change');
      expect(result).toContain('No changes applied');
    });

    it('should include details when provided', () => {
      const result = formatSimplePreview(
        'Create change',
        'test-change',
        ['Create directory', 'Write config', 'Generate files']
      );

      expect(result).toContain('Create directory');
      expect(result).toContain('Write config');
      expect(result).toContain('Generate files');
    });

    it('should handle empty details array', () => {
      const result = formatSimplePreview('Operation', 'target', []);

      expect(result).not.toMatch(/^.*- /m); // No bullet points
    });

    it('should format multi-line output correctly', () => {
      const result = formatSimplePreview(
        'Complex operation',
        'my-target',
        ['Step 1', 'Step 2']
      );

      const lines = result.split('\n');
      expect(lines[0]).toBe('[DRY-RUN] Complex operation');
      expect(lines[1]).toBe('');
      expect(lines[2]).toBe('  Target: my-target');
    });
  });
});
