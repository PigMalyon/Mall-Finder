import { useEffect, useMemo, useState } from 'react';
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

function pathData(route: string[]) {
  return route.map((node, index) => `${index === 0 ? 'M' : 'L'} ${nodes[node][0]} ${nodes[node][1]}`).join(' ');
}

export default function App() {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<Place | null>(null);
  const [start, setStart] = useState('east');
  const [journeyState, setJourneyState] = useState<'walking' | 'arrived'>('walking');

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return places.slice(0, 5);
    return places.filter((place) => [place.name, place.category, ...place.keywords].join(' ').toLowerCase().includes(value));
  }, [query]);

  const route = destination?.floor === 'ground' ? shortestPath(start, destination.nodeId) : [];
  const routePath = pathData(route);

  useEffect(() => {
    if (!destination || destination.floor !== 'ground') return;
    setJourneyState('walking');
    const timer = window.setTimeout(() => setJourneyState('arrived'), 8500);
    return () => window.clearTimeout(timer);
  }, [destination, start]);

  function beginJourney(place: Place) {
    setJourneyState('walking');
    setDestination(place);
  }

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
                <button onClick={() => beginJourney(place)}>Take me there</button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="navigation-view">
          <div className="journey-card">
            <button className="back-button" onClick={() => setDestination(null)}>‹</button>
            <div><small>{journeyState === 'arrived' ? 'Welcome to' : 'Going to'}</small><h2>{destination.name}</h2><p>{journeyState === 'arrived' ? 'You are at the customer entrance' : destination.floor === 'upper' ? 'Upper-level transfer required' : 'About a 2 minute walk'}</p></div>
            <span className={`route-status ${journeyState}`}>{journeyState === 'arrived' ? '✓ Arrived' : '✓ On route'}</span>
          </div>

          {destination.floor === 'ground' && (
            <div className="start-picker" aria-label="Choose starting entrance">
              {['west', 'south', 'east', 'north'].map((entrance) => (
                <button key={entrance} className={start === entrance ? 'selected' : ''} onClick={() => setStart(entrance)}>{entrance}</button>
              ))}
            </div>
          )}

          <div className="map-canvas">
            <svg viewBox="0 0 590 410" role="img" aria-label={`Route to ${destination.name}`}>
              {edges.map(([a, b]) => <line key={`${a}-${b}`} className="corridor" x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />)}
              {destination.floor === 'ground' && <path id="activeRoutePath" className="active-route" d={routePath} />}
              {destination.floor === 'ground' && journeyState === 'walking' && (
                <g className="moving-marker">
                  <circle className="position-pulse" r="17" />
                  <g className="person">
                    <circle cy="-9" r="4.8" />
                    <path className="body" d="M0-3 L1 7" />
                    <path className="arm arm-left" d="M0 0 L-7 5" />
                    <path className="arm arm-right" d="M0 0 L7 4" />
                    <path className="leg leg-left" d="M1 7 L-6 15" />
                    <path className="leg leg-right" d="M1 7 L8 14" />
                  </g>
                  <animateMotion dur="8s" fill="freeze" rotate="auto" path={routePath} />
                </g>
              )}
              {destination.floor === 'ground' && journeyState === 'arrived' && (
                <g transform={`translate(${nodes[destination.nodeId][0]} ${nodes[destination.nodeId][1]})`}>
                  <circle className="arrival-glow" r="24" />
                  <circle className="destination" r="10" />
                </g>
              )}
              {destination.floor === 'ground' && journeyState === 'walking' && <circle className="destination" cx={nodes[destination.nodeId][0]} cy={nodes[destination.nodeId][1]} r="10" />}
              <text x="425" y="205">Woolworths</text><text x="160" y="295">Dis-Chem</text><text x="160" y="165">Adidas</text><text x="145" y="105">Food Court</text>
            </svg>
          </div>

          <div className={`instruction-card ${journeyState}`}>
            <span className="direction">{journeyState === 'arrived' ? '✓' : '↑'}</span>
            <div><small>{journeyState === 'arrived' ? 'Journey complete' : 'Next'}</small><strong>{journeyState === 'arrived' ? `Welcome to ${destination.name}` : destination.floor === 'upper' ? 'Continue to the upper-level access point' : 'Continue along the main corridor'}</strong><p>{journeyState === 'arrived' ? 'The highlighted point is the correct customer entrance.' : 'We will alert you before the next decision point.'}</p></div>
          </div>
        </section>
      )}
    </main>
  );
}
