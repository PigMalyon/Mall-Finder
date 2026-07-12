import { distance, shortestPath } from './routing';

export type RouteMetrics = {
  route: string[];
  distanceMetres: number;
  walkingMinutes: number;
  turns: number;
};

export function calculateRouteMetrics(start: string, end: string): RouteMetrics {
  const route = shortestPath(start, end);
  const graphDistance = route.slice(0, -1).reduce((sum, node, index) => sum + distance(node, route[index + 1]), 0);
  const distanceMetres = Math.max(0, Math.round(graphDistance * 0.42));
  return {
    route,
    distanceMetres,
    walkingMinutes: route.length ? Math.max(1, Math.ceil(distanceMetres / 75)) : 0,
    turns: Math.max(0, route.length - 2)
  };
}
