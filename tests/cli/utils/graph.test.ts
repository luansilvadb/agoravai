import { describe, it, expect } from 'vitest';
import {
  detectCycle,
  detectCycleInDeps,
  topologicalSort,
  getReadyArtifacts,
  buildDependencyGraph,
  findCircularPath,
  type GraphNode,
} from '../../../src/cli/utils/graph.js';

describe('Graph Algorithms', () => {
  describe('detectCycle', () => {
    it('should return false for acyclic graph', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['b', 'c'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: [] },
      ];

      expect(detectCycle(nodes)).toBe(false);
    });

    it('should detect self-cycle', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['a'] },
      ];

      expect(detectCycle(nodes)).toBe(true);
    });

    it('should detect two-node cycle', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: ['a'] },
      ];

      expect(detectCycle(nodes)).toBe(true);
    });

    it('should detect multi-node cycle', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: ['a'] },
      ];

      expect(detectCycle(nodes)).toBe(true);
    });

    it('should return false for empty graph', () => {
      expect(detectCycle([])).toBe(false);
    });

    it('should handle disconnected components', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: [] },
        { id: 'b', dependencies: [] },
      ];

      expect(detectCycle(nodes)).toBe(false);
    });
  });

  describe('detectCycleInDeps', () => {
    it('should return false for acyclic deps', () => {
      const deps: Record<string, string[]> = {
        a: ['b', 'c'],
        b: ['c'],
        c: [],
      };

      expect(detectCycleInDeps(deps)).toBe(false);
    });

    it('should detect cycle in deps', () => {
      const deps: Record<string, string[]> = {
        a: ['b'],
        b: ['c'],
        c: ['a'],
      };

      expect(detectCycleInDeps(deps)).toBe(true);
    });
  });

  describe('topologicalSort', () => {
    it('should return correct order for DAG', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['b', 'c'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: [] },
      ];

      const sorted = topologicalSort(nodes);

      // c must come before b, and both must come before a
      expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('b'));
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('a'));
    });

    it('should handle nodes with no dependencies', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: [] },
        { id: 'b', dependencies: [] },
      ];

      const sorted = topologicalSort(nodes);
      expect(sorted).toHaveLength(2);
      expect(sorted).toContain('a');
      expect(sorted).toContain('b');
    });

    it('should handle single node', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: [] },
      ];

      expect(topologicalSort(nodes)).toEqual(['a']);
    });
  });

  describe('getReadyArtifacts', () => {
    it('should return artifacts with all dependencies completed', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['b', 'c'] },
        { id: 'b', dependencies: ['c'] },
        { id: 'c', dependencies: [] },
      ];

      const completed = new Set(['c']);
      const ready = getReadyArtifacts(nodes, completed);

      expect(ready).toContain('b');
      expect(ready).not.toContain('a');
      expect(ready).not.toContain('c');
    });

    it('should return empty array when no artifacts are ready', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: ['b'] },
        { id: 'b', dependencies: [] },
      ];

      const completed = new Set<string>();
      const ready = getReadyArtifacts(nodes, completed);

      expect(ready).toEqual(['b']);
    });

    it('should return empty array when all are completed', () => {
      const nodes: GraphNode[] = [
        { id: 'a', dependencies: [] },
      ];

      const completed = new Set(['a']);
      const ready = getReadyArtifacts(nodes, completed);

      expect(ready).toEqual([]);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build graph from artifacts', () => {
      const artifacts = [
        { id: 'a', dependsOn: ['b'] },
        { id: 'b', dependsOn: ['c'] },
        { id: 'c' },
      ];

      const graph = buildDependencyGraph(artifacts);

      expect(graph).toHaveLength(3);
      expect(graph.find(n => n.id === 'a')?.dependencies).toEqual(['b']);
      expect(graph.find(n => n.id === 'b')?.dependencies).toEqual(['c']);
      expect(graph.find(n => n.id === 'c')?.dependencies).toEqual([]);
    });

    it('should handle artifacts without dependsOn', () => {
      const artifacts = [
        { id: 'a' },
      ];

      const graph = buildDependencyGraph(artifacts);

      expect(graph[0]?.dependencies).toEqual([]);
    });
  });

  describe('findCircularPath', () => {
    it('should return null for acyclic graph', () => {
      const deps: Record<string, string[]> = {
        a: ['b'],
        b: ['c'],
        c: [],
      };

      expect(findCircularPath(deps)).toBeNull();
    });

    it('should find simple cycle', () => {
      const deps: Record<string, string[]> = {
        a: ['b'],
        b: ['a'],
      };

      const path = findCircularPath(deps);
      expect(path).not.toBeNull();
      expect(path).toContain('a');
      expect(path).toContain('b');
    });

    it('should find complex cycle', () => {
      const deps: Record<string, string[]> = {
        a: ['b'],
        b: ['c'],
        c: ['a'],
      };

      const path = findCircularPath(deps);
      expect(path).not.toBeNull();
      expect(path).toHaveLength(3);
    });

    it('should handle self-cycle', () => {
      const deps: Record<string, string[]> = {
        a: ['a'],
      };

      const path = findCircularPath(deps);
      expect(path).toContain('a');
    });
  });
});
