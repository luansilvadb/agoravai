export interface GraphNode {
  id: string;
  dependencies: string[];
}

export function detectCycle(nodes: GraphNode[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (node) {
      for (const dep of node.dependencies) {
        if (!visited.has(dep)) {
          if (dfs(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

export function detectCycleInDeps(deps: Record<string, string[]>): boolean {
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

export function topologicalSort(nodes: GraphNode[]): string[] {
  const visited = new Set<string>();
  const result: string[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  function visit(nodeId: string): void {
    if (visited.has(nodeId)) return;

    const node = nodeMap.get(nodeId);
    if (node) {
      for (const dep of node.dependencies) {
        visit(dep);
      }
    }

    visited.add(nodeId);
    result.push(nodeId);
  }

  for (const node of nodes) {
    visit(node.id);
  }

  return result;
}

export function getReadyArtifacts(
  nodes: GraphNode[],
  completed: Set<string>
): string[] {
  return nodes
    .filter(node => {
      if (completed.has(node.id)) return false;
      return node.dependencies.every(dep => completed.has(dep));
    })
    .map(node => node.id);
}

export function buildDependencyGraph(
  artifacts: Array<{ id: string; dependsOn?: string[] }>
): GraphNode[] {
  return artifacts.map(a => ({
    id: a.id,
    dependencies: a.dependsOn || [],
  }));
}

export function findCircularPath(
  deps: Record<string, string[]>
): string[] | null {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    for (const neighbor of deps[node] || []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    path.pop();
    recursionStack.delete(node);
    return false;
  }

  for (const node of Object.keys(deps)) {
    if (!visited.has(node)) {
      path.length = 0;
      if (dfs(node)) {
        return [...path];
      }
    }
  }

  return null;
}
