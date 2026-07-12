import { edges, nodes, places } from './data';

export type ValidationIssue = {
  code: string;
  message: string;
};

export function validateMallData(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(Object.keys(nodes));

  for (const [from, to] of edges) {
    if (!nodeIds.has(from)) issues.push({ code: 'EDGE_UNKNOWN_FROM', message: `Edge starts at unknown node: ${from}` });
    if (!nodeIds.has(to)) issues.push({ code: 'EDGE_UNKNOWN_TO', message: `Edge ends at unknown node: ${to}` });
    if (from === to) issues.push({ code: 'EDGE_SELF_LINK', message: `Edge links node ${from} to itself` });
  }

  const placeIds = new Set<string>();
  for (const place of places) {
    if (placeIds.has(place.id)) issues.push({ code: 'DUPLICATE_PLACE_ID', message: `Duplicate place id: ${place.id}` });
    placeIds.add(place.id);
    if (!nodeIds.has(place.nodeId) && place.floor === 'ground') {
      issues.push({ code: 'PLACE_UNKNOWN_NODE', message: `${place.name} references unknown node: ${place.nodeId}` });
    }
    if (!place.name.trim()) issues.push({ code: 'PLACE_MISSING_NAME', message: `Place ${place.id} has no name` });
    if (!place.keywords.length) issues.push({ code: 'PLACE_MISSING_KEYWORDS', message: `${place.name} has no search keywords` });
  }

  const adjacency = new Map<string, Set<string>>();
  for (const node of nodeIds) adjacency.set(node, new Set());
  for (const [from, to] of edges) {
    if (!adjacency.has(from) || !adjacency.has(to)) continue;
    adjacency.get(from)!.add(to);
    adjacency.get(to)!.add(from);
  }

  const start = nodeIds.has('hub') ? 'hub' : nodeIds.values().next().value as string | undefined;
  if (start) {
    const visited = new Set<string>([start]);
    const queue = [start];
    while (queue.length) {
      const current = queue.shift()!;
      for (const next of adjacency.get(current) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    for (const node of nodeIds) {
      if (!visited.has(node)) issues.push({ code: 'UNREACHABLE_NODE', message: `Node is disconnected from the mall graph: ${node}` });
    }
  }

  return issues;
}
