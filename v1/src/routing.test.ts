import assert from 'node:assert/strict';
import { nodes, places } from './data';
import { pathData, routePoint, shortestPath } from './routing';

const entrances = ['west', 'south', 'east', 'north'];
const groundPlaces = places.filter((place) => place.floor === 'ground');

for (const entrance of entrances) {
  assert.ok(nodes[entrance], `Missing entrance node: ${entrance}`);

  for (const place of groundPlaces) {
    const route = shortestPath(entrance, place.nodeId);
    assert.ok(route.length >= 2, `${place.name} is not reachable from ${entrance}`);
    assert.equal(route[0], entrance, `Route to ${place.name} should begin at ${entrance}`);
    assert.equal(route.at(-1), place.nodeId, `Route to ${place.name} should end at ${place.nodeId}`);

    const svgPath = pathData(route);
    assert.ok(svgPath.startsWith('M '), `Route to ${place.name} did not produce valid SVG path data`);

    const startPoint = routePoint(route, 0);
    const endPoint = routePoint(route, 1);
    assert.deepEqual([startPoint.x, startPoint.y], nodes[entrance], `Route start position is incorrect for ${place.name}`);
    assert.deepEqual([endPoint.x, endPoint.y], nodes[place.nodeId], `Route end position is incorrect for ${place.name}`);
  }
}

assert.deepEqual(shortestPath('missing', 'hub'), [], 'Unknown starting nodes should return no route');
assert.deepEqual(shortestPath('hub', 'missing'), [], 'Unknown destination nodes should return no route');

console.log(`Routing validation passed for ${groundPlaces.length} destinations across ${entrances.length} entrances.`);
