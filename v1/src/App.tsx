import { useEffect, useMemo, useRef, useState } from 'react';
import { edges, nodes, places, type Place } from './data';
import { buildJourneyInstructions, instructionAtProgress, nextDecisionProgress } from './instructions';
import { pathData, routePoint, shortestPath } from './routing';
import { searchPlaces } from './search';

type ParkingRecord = {
  section: string;
  entrance: 'west' | 'south' | 'east' | 'north';
  savedAt: number;
};

type View = 'home' | 'saved' | 'car';

const PARKING_KEY = 'mall-finder-parking-v1';
const FAVOURITES_KEY = 'mall-finder-favourites-v1';

function loadParking(): ParkingRecord | null {
  try {
    const raw = localStorage.getItem(PARKING_KEY);
    return raw ? JSON.parse(raw) as ParkingRecord : null;
  } catch {
    return null;
  }
}

function loadFavourites(): string[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<Place | null>(null);
  const [start, setStart] = useState('east');
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState<View>('home');
  const [parking, setParking] = useState<ParkingRecord | null>(() => loadParking());
  const [parkingSection, setParkingSection] = useState('Blue B14');
  const [parkingEntrance, setParkingEntrance] = useState<ParkingRecord['entrance']>('east');
  const [favourites, setFavourites] = useState<string[]>(() => loadFavourites());
  const lastMilestone = useRef(-1);

  const results = useMemo(() => searchPlaces(places, query), [query]);
  const savedPlaces = useMemo(() => places.filter((place) => favourites.includes(place.id)), [favourites]);
  const route = destination?.floor === 'ground' ? shortestPath(start, destination.nodeId) : [];
  const routePath = pathData(route);
  const marker = routePoint(route, progress);
  const arrived = progress >= 1;
  const journeyInstructions = useMemo(
    () => destination ? buildJourneyInstructions(route, destination) : [],
    [destination, route.join('|')]
  );
  const instruction = journeyInstructions.length ? instructionAtProgress(journeyInstructions, progress) : null;
  const nextDecision = journeyInstructions.length ? nextDecisionProgress(journeyInstructions, progress) : 1;
  const decisionDistance = Math.max(0, Math.round((nextDecision - progress) * 140));

  useEffect(() => {
    if (!destination || destination.floor !== 'ground') return;
    setProgress(0);
    lastMilestone.current = -1;
    const startedAt = performance.now();
    const duration = 9000;
    const timer = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - startedAt) / duration);
      setProgress(next);
      if (next >= 1) window.clearInterval(timer);
    }, 80);
    return () => window.clearInterval(timer);
  }, [destination, start]);

  useEffect(() => {
    if (!instruction || instruction.milestone === lastMilestone.current) return;
    lastMilestone.current = instruction.milestone;
    if ('vibrate' in navigator) navigator.vibrate(instruction.milestone >= 1 ? [70, 45, 70] : 55);
  }, [instruction]);

  function beginJourney(place: Place, origin = start) {
    setStart(origin);
    setProgress(0);
    setDestination(place);
  }

  function restartJourney() {
    setProgress(0);
    const current = destination;
    setDestination(null);
    window.setTimeout(() => setDestination(current), 0);
  }

  function toggleFavourite(id: string) {
    setFavourites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function saveParking() {
    const next: ParkingRecord = { section: parkingSection.trim() || 'Saved parking', entrance: parkingEntrance, savedAt: Date.now() };
    localStorage.setItem(PARKING_KEY, JSON.stringify(next));
    setParking(next);
  }

  function clearParking() {
    localStorage.removeItem(PARKING_KEY);
    setParking(null);
  }

  function returnToCar() {
    if (!parking) return;
    const carPlace: Place = {
      id: 'my-car',
      name: `My Car · ${parking.section}`,
      category: 'Parking',
      floor: 'ground',
      icon: '🚗',
      nodeId: parking.entrance,
      keywords: ['car', 'parking', 'vehicle']
    };
    setView('home');
    beginJourney(carPlace, 'hub');
  }

  function chooseShortcut(value: string) {
    setView('home');
    setQuery(value);
  }

  function renderPlaceCard(place: Place) {
    const saved = favourites.includes(place.id);
    return (
      <article className="place-card" key={place.id}>
        <div className="place-icon">{place.icon}</div>
        <div className="place-copy"><strong>{place.name}</strong><span>{place.category} · {place.floor === 'ground' ? 'Ground floor' : 'Upper level'}</span></div>
        <button className={`favourite-button ${saved ? 'saved' : ''}`} aria-label={saved ? `Remove ${place.name} from saved` : `Save ${place.name}`} onClick={() => toggleFavourite(place.id)}>{saved ? '★' : '☆'}</button>
        <button className="route-button" onClick={() => beginJourney(place)}>Take me there</button>
      </article>
    );
  }

  if (destination) {
    return (
      <main className="app-shell">
        <section className="navigation-view">
          <div className="journey-card">
            <button className="back-button" onClick={() => setDestination(null)}>‹</button>
            <div><small>{arrived ? 'Welcome to' : 'Going to'}</small><h2>{destination.name}</h2><p>{arrived ? 'You are at the customer entrance' : destination.floor === 'upper' ? 'Upper-level transfer required' : `${Math.max(1, Math.ceil((1 - progress) * 2))} min remaining`}</p></div>
            <span className={`route-status ${arrived ? 'arrived' : 'walking'}`}>{arrived ? '✓ Arrived' : '✓ On route'}</span>
          </div>

          {destination.floor === 'ground' && destination.id !== 'my-car' && (
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
                    <circle cy="-9" r="4.8" /><path className="body" d="M0-3 L1 7" />
                    <path className="arm arm-left" d="M0 0 L-7 5" /><path className="arm arm-right" d="M0 0 L7 4" />
                    <path className="leg leg-left" d="M1 7 L-6 15" /><path className="leg leg-right" d="M1 7 L8 14" />
                  </g>
                </g>
              )}
              {destination.floor === 'ground' && arrived && (
                <g transform={`translate(${nodes[destination.nodeId][0]} ${nodes[destination.nodeId][1]})`}>
                  <circle className="arrival-glow" r="24" /><circle className="destination" r="10" />
                </g>
              )}
              {destination.floor === 'ground' && !arrived && <circle className="destination" cx={nodes[destination.nodeId][0]} cy={nodes[destination.nodeId][1]} r="10" />}
              <text x="425" y="205">Woolworths</text><text x="160" y="295">Dis-Chem</text><text x="160" y="165">Adidas</text><text x="145" y="105">Food Court</text>
            </svg>
          </div>

          {destination.floor === 'upper' && (
            <div className="upper-level-card"><span>↟</span><div><strong>Continue to the upper level</strong><p>Use the accessible lift or escalator at the central atrium.</p></div></div>
          )}

          {instruction && (
            <div className={`instruction-card ${arrived ? 'arrived' : 'walking'}`}>
              <span className="direction">{instruction.direction}</span>
              <div><small>{instruction.label}</small><strong>{instruction.title}</strong><p>{instruction.detail}</p>{!arrived && decisionDistance > 0 && <em className="decision-distance">Decision point in about {decisionDistance} m</em>}</div>
              {arrived && <button className="restart-button" onClick={restartJourney}>Replay</button>}
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell with-bottom-nav">
      {view === 'home' && (
        <>
          <header className="hero">
            <div className="brand-row"><strong>Mall Finder</strong><span>Vaal Mall</span></div>
            <h1>Where are you going today?</h1>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stores, food or facilities" />
          </header>
          <section className="content">
            {parking && (
              <button className="return-car-card" onClick={returnToCar}>
                <span>🚗</span><div><small>Parking saved</small><strong>Return to {parking.section}</strong><em>Near {parking.entrance} entrance</em></div><b>›</b>
              </button>
            )}
            {!query && (
              <div className="shortcut-grid" aria-label="Quick destinations">
                <button onClick={() => chooseShortcut('toilet')}><span>WC</span>Toilets</button>
                <button onClick={() => chooseShortcut('ATM')}><span>ATM</span>Cash</button>
                <button onClick={() => chooseShortcut('food')}><span>🍽</span>Food</button>
                <button onClick={() => chooseShortcut('information')}><span>i</span>Help</button>
              </div>
            )}
            <div className="section-heading"><h2>{query ? 'Search results' : 'Popular destinations'}</h2><small>{results.length} places</small></div>
            <div className="results">
              {results.map(renderPlaceCard)}
              {query && results.length === 0 && (
                <div className="empty-state"><strong>No matching place found</strong><span>Try a store name, category, product type or facility.</span><button onClick={() => setQuery('')}>Clear search</button></div>
              )}
            </div>
          </section>
        </>
      )}

      {view === 'saved' && (
        <section className="saved-view">
          <div className="page-heading"><div><small>Your places</small><h1>Saved</h1></div><span>{savedPlaces.length}</span></div>
          <div className="results">
            {savedPlaces.map(renderPlaceCard)}
            {savedPlaces.length === 0 && <div className="empty-state"><strong>No saved places yet</strong><span>Tap the star beside a store or facility to keep it here.</span><button onClick={() => setView('home')}>Browse places</button></div>}
          </div>
        </section>
      )}

      {view === 'car' && (
        <section className="parking-view">
          <div className="parking-header"><span>🚗</span><div><small>My Car</small><h1>{parking ? parking.section : 'Save your parking'}</h1></div></div>
          {parking ? (
            <div className="parking-card saved">
              <span className="parking-check">✓</span><h2>Vehicle saved</h2><p>Near the {parking.entrance} entrance</p>
              <button className="primary-action" onClick={returnToCar}>Take me back</button>
              <button className="text-action" onClick={clearParking}>Delete parking</button>
            </div>
          ) : (
            <div className="parking-card">
              <label>Parking section<input value={parkingSection} onChange={(event) => setParkingSection(event.target.value)} placeholder="e.g. Blue B14" /></label>
              <label>Closest entrance<select value={parkingEntrance} onChange={(event) => setParkingEntrance(event.target.value as ParkingRecord['entrance'])}><option value="west">West</option><option value="south">South</option><option value="east">East</option><option value="north">North</option></select></label>
              <button className="primary-action" onClick={saveParking}>Save my parking</button>
            </div>
          )}
        </section>
      )}

      <nav className="bottom-nav" aria-label="Main navigation">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><span>⌂</span>Home</button>
        <button className={view === 'saved' ? 'active' : ''} onClick={() => setView('saved')}><span>★</span>Saved</button>
        <button className={view === 'car' ? 'active' : ''} onClick={() => setView('car')}><span>🚗</span>My Car</button>
      </nav>
    </main>
  );
}