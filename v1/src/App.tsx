import { useMemo, useState } from 'react';
import { edges, nodes, places, type Place } from './data';

function distance(a: string, b: string) {
  const [ax, ay] = nodes[a];
  const [bx, by] = nodes[b];
  return Math.hypot(ax - bx, ay - by);
}

function shortestPath(start: string, end: string) {
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

export default function App() {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<Place | null>(null);
  const [start] = useState('east');

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return places.slice(0, 4);
    return places.filter((place) => [place.name, place.category, ...place.keywords].join(' ').toLowerCase().includes(value));
  }, [query]);

  const route = destination?.floor === 'ground' ? shortestPath(start, destination.nodeId) : [];
  const points = route.map((node) => nodes[node].join(',')).join(' ');

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-row"><strong>Mall Finder</strong><span>Vaal Mall</span></div>
        <h1>Where are you going today?</h1>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores, food or facilities" />
      </header>

      {!destination ? (
        <section className="content">
          <div className="section-heading"><h2>{query ? 'Search results' : 'Popular destinations'}</h2><small>{results.length} places</small></div>
          <div className="results">
            {results.map((place) => (
              <article className="place-card" key={place.id}>
                <div className="place-icon">{place.icon}</div>
                <div className="place-copy"><strong>{place.name}</strong><span>{place.category} · {place.floor === 'ground' ? 'Ground floor' : 'Upper level'}</span></div>
                <button onClick={() => setDestination(place)}>Take me there</button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="navigation-view">
          <div className="journey-card">
            <button className="back-button" onClick={() => setDestination(null)}>‹</button>
            <div><small>Going to</small><h2>{destination.name}</h2><p>{destination.floor === 'upper' ? 'Upper-level transfer required' : 'About a 2 minute walk'}</p></div>
            <span className="route-status">✓ On route</span>
          </div>

          <div className="map-canvas">
            <svg viewBox="0 0 590 410" role="img" aria-label={`Route to ${destination.name}`}>
              {edges.map(([a, b]) => <line key={`${a}-${b}`} className="corridor" x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />)}
              {destination.floor === 'ground' && <polyline className="active-route" points={points} />}
              <circle className="position-pulse" cx={nodes[start][0]} cy={nodes[start][1]} r="17" />
              <g className="person" transform={`translate(${nodes[start][0]} ${nodes[start][1]})`}>
                <circle cy="-8" r="5" /><path d="M0-2 L0 8 M0 2 L-7 7 M0 2 L7 7 M0 8 L-6 16 M0 8 L7 15" />
              </g>
              {destination.floor === 'ground' && <circle className="destination" cx={nodes[destination.nodeId][0]} cy={nodes[destination.nodeId][1]} r="10" />}
              <text x="425" y="205">Woolworths</text><text x="160" y="295">Dis-Chem</text><text x="160" y="165">Adidas</text><text x="145" y="105">Food Court</text>
            </svg>
          </div>

          <div className="instruction-card">
            <span className="direction">↑</span>
            <div><small>Next</small><strong>{destination.floor === 'upper' ? 'Continue to the upper-level access point' : 'Continue along the main corridor'}</strong><p>We will alert you before the next decision point.</p></div>
          </div>
        </section>
      )}
    </main>
  );
}
