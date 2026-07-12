import { edges, nodes } from './data';

export type RoutePoint = { x: number; y: number; angle: number };

export function distance(a: string, b: string) {
  const from = nodes[a];
  const to = nodes[b];
  if (!from || !to) return Infinity;
  const [ax, ay] = from;
  const [bx, by] = to;
  return Math.hypot(ax - bx, ay - by);
}

export function shortestPath(start: string, end: string) {
  if (!nodes[start] || !nodes[end]) return [];
  if (start === end) return [start];

  const queue = [start];
  const previous: Record<string, string | undefined> = {};
  const distances: Record<string, number> = Object.fromEntries(Object.keys(nodes).map((key) => [key, Infinity]));
  distances[start] = 0;

  while (queue.length) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift()!;
    if (current === end) break;

    edges.filter((edge) => edge.includes(current)).forEach(([a, b]) => {
      const neighbour = a === current ? b : a;
      const nextDistance = distances[current] + distance(current, neighbour);
      if (nextDistance < distances[neighbour]) {
        distances[neighbour] = nextDistance;
        previous[neighbour] = current;
        if (!queue.includes(neighbour)) queue.push(neighbour);
      }
    });
  }

  const route: string[] = [];
  for (let current: string | undefined = end; current; current = previous[current]) route.unshift(current);
  return route[0] === start ? route : [];
}

export function pathData(route: string[]) {
  return route
    .filter((node) => Boolean(nodes[node]))
    .map((node, index) => `${index === 0 ? 'M' : 'L'} ${nodes[node][0]} ${nodes[node][1]}`)
    .join(' ');
}

export function routePoint(route: string[], progress: number): RoutePoint {
  const validRoute = route.filter((node) => Boolean(nodes[node]));
  if (!validRoute.length) return { x: 0, y: 0, angle: 0 };
  if (validRoute.length === 1) {
    const [x, y] = nodes[validRoute[0]];
    return { x, y, angle: 0 };
  }

  const segments = validRoute.slice(0, -1).map((node, index) => {
    const next = validRoute[index + 1];
    return { from: nodes[node], to: nodes[next], length: distance(node, next) };
  });
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = Math.max(0, Math.min(1, progress)) * total;

  for (const segment of segments) {
    if (remaining <= segment.length) {
      const ratio = segment.length ? remaining / segment.length : 0;
      const x = segment.from[0] + (segment.to[0] - segment.from[0]) * ratio;
      const y = segment.from[1] + (segment.to[1] - segment.from[1]) * ratio;
      const angle = Math.atan2(segment.to[1] - segment.from[1], segment.to[0] - segment.from[0]) * 180 / Math.PI + 90;
      return { x, y, angle };
    }
    remaining -= segment.length;
  }

  const last = segments[segments.length - 1];
  return { x: last.to[0], y: last.to[1], angle: 0 };
}
