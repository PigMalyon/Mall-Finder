import { useEffect, useMemo, useState } from 'react';
import { edges, nodes, places, type Place } from './data';
import { pathData, routePoint, shortestPath } from './routing';
import { searchPlaces } from './search';

function instructionFor(progress: number, destination: Place) {
  if (progress >= 1) return { direction: '✓', label: 'Journey complete', title: `Welcome to ${destination.name}`, detail: 'You are at the correct customer entrance.' };
  if (progress > .82) return { direction: '↑', label: 'Almost there', title: `${destination.name} is directly ahead`, detail: 'The entrance will highlight when you arrive.' };
  if (progress > .56) return { direction: '↱', label: 'Next', title: 'Follow the corridor around the corner', detail: 'You are still on the correct route.' };
  if (progress > .28) return { direction: '↑', label: 'Continue', title: 'Walk past the next landmark', detail: 'No action needed yet.' };
  return { direction: '↑', label: 'Start', title: 'Continue along the main corridor', detail: 'We will alert you before the next decision point.' };
}

export default function App() {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<Place | null>(null);
  const [start, setStart] = useState('east');
  const [progress, setProgress] = useState(0);

  const results = useMemo(() => searchPlaces(places, query), [query]);
  const route = destination?.floor === 'ground' ? shortestPath(start, destination.nodeId) : [];
  const routePath = pathData(route);
  const marker = routePoint(route, progress);
  const arrived = progress >= 1;
  const instruction = destination ? instructionFor(progress, destination) : null;

  useEffect(() => {
    if (!destination || destination.floor !== 'ground') return;
    setProgress(0);
    const startedAt = performance.now();
    const duration = 9000;
    const timer = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - startedAt) / duration);
      setProgress(next);
      if (next >= 1) window.clearInterval(timer);
    }, 80);
    return () => window.clearInterval(timer);
  }, [destination, start]);

  function beginJourney(place: Place) {
    setProgress(0);
    setDestination(place);
  }

  function restartJourney() {
    setProgress(0);
    const current = destination;
    setDestination(null);
    window.setTimeout(() => setDestination(current), 0);
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
            {query && results.length === 0 && (
              <div className="empty-state">
                <strong>No matching place found</strong>
                <span>Try a store name, category, product type or facility.</span>
                <button onClick={() => setQuery('')}>Clear search</button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="navigation-view">
          <div className="journey-card">
            <button className="back-button" onClick={() => setDestination(null)}>‹</button>
            <div><small>{arrived ? 'Welcome to' : 'Going to'}</small><h2>{destination.name}</h2><p>{arrived ? 'You are at the customer entrance' : destination.floor === 'upper' ? 'Upper-level transfer required' : `${Math.max(1, Math.ceil((1 - progress) * 2))} min remaining`}</p></div>
            <span className={`route-status ${arrived ? 'arrived' : 'walking'}`}>{arrived ? '✓ Arrived' : '✓ On route'}</span>
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
              {destination.floor === 'ground' && <path className="completed-route" d={routePath} />}
              {destination.floor === 'ground' && <path className="active-route" pathLength="100" strokeDasharray={`${Math.max(0, 100 - progress * 100)} 100`} strokeDashoffset={-progress * 100} d={routePath} />}
              {destination.floor === 'ground' && !arrived && (
                <g className="moving-marker" transform={`translate(${marker.x} ${marker.y}) rotate(${marker.angle})`}>
                  <circle className="position-pulse" r="17" />
                  <g className="person">
                    <circle cy="-9" r="4.8" />
                    <path className="body" d="M0-3 L1 7" />
                    <path className="arm arm-left" d="M0 0 L-7 5" />
                    <path className="arm arm-right" d="M0 0 L7 4" />
                    <path className="leg leg-left" d="M1 7 L-6 15" />
                    <path className="leg leg-right" d="M1 7 L8 14" />
                  </g>
                </g>
              )}
              {destination.floor === 'ground' && arrived && (
                <g transform={`translate(${nodes[destination.nodeId][0]} ${nodes[destination.nodeId][1]})`}>
                  <circle className="arrival-glow" r="24" />
                  <circle className="destination" r="10" />
                </g>
              )}
              {destination.floor === 'ground' && !arrived && <circle className="destination" cx={nodes[destination.nodeId][0]} cy={nodes[destination.nodeId][1]} r="10" />}
              <text x="425" y="205">Woolworths</text><text x="160" y="295">Dis-Chem</text><text x="160" y="165">Adidas</text><text x="145" y="105">Food Court</text>
            </svg>
          </div>

          {instruction && (
            <div className={`instruction-card ${arrived ? 'arrived' : 'walking'}`}>
              <span className="direction">{instruction.direction}</span>
              <div><small>{instruction.label}</small><strong>{instruction.title}</strong><p>{instruction.detail}</p></div>
              {arrived && <button className="restart-button" onClick={restartJourney}>Replay</button>}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
