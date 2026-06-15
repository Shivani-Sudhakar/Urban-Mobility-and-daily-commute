import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Search, MapPin, Flag, Navigation, Activity, CheckCircle, Wallet, AlertTriangle } from 'lucide-react';
import './AIRoutePage.css';
import TripMap from '../components/card/TripMap';
import { getBalance, loadUserData, saveUserData, deductCredits } from '../utils/storage';

export default function AIRoutePage() {
  const [view, setView] = useState('planner'); // 'planner' | 'map'
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  
  const [fromLocation, setFromLocation] = useState(null); // {lat, lon, name}
  const [toLocation, setToLocation] = useState(null);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');

  const debounceRef = useRef(null);

  // User input debounce for Nominatim
  const fetchSuggestions = async (query, setter) => {
    if (!query || query.length < 3) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`, {
        headers: { 'User-Agent': 'NammaCard/1.0' }
      });
      const data = await res.json();
      setter(data);
    } catch (err) {
      console.error('Nominatim fetch error', err);
    }
  };

  const onFromChange = (e) => {
    const val = e.target.value;
    setFromQuery(val);
    setFromLocation(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val, setFromSuggestions), 500);
  };

  const onToChange = (e) => {
    const val = e.target.value;
    setToQuery(val);
    setToLocation(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val, setToSuggestions), 500);
  };

  const handleSelectFrom = (item) => {
    setFromLocation({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), name: item.display_name });
    setFromQuery(item.display_name);
    setFromSuggestions([]);
  };

  const handleSelectTo = (item) => {
    setToLocation({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), name: item.display_name });
    setToQuery(item.display_name);
    setToSuggestions([]);
  };

  const handleSwap = () => {
    const tempQuery = fromQuery;
    const tempLoc = fromLocation;
    
    setFromQuery(toQuery);
    setFromLocation(toLocation);
    
    setToQuery(tempQuery);
    setToLocation(tempLoc);
    
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const calculateRoutes = async () => {
    if (!fromLocation || !toLocation) {
      setError('Please select valid From and To locations from the dropdown.');
      return;
    }
    
    setError('');
    setIsCalculating(true);
    setRoutes([]);

    try {
      const lat1 = fromLocation.lat;
      const lon1 = fromLocation.lon;
      const lat2 = toLocation.lat;
      const lon2 = toLocation.lon;
      
      const straightDist = haversineDistance(lat1, lon1, lat2, lon2);
      
      let roadDist = straightDist * 1.3; // Fallback
      let roadDuration = straightDist * 3.0; // Fallback

      try {
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`);
        const osrmData = await osrmRes.json();
        if (osrmData.code === 'Ok' && osrmData.routes.length > 0) {
          roadDist = osrmData.routes[0].legs[0].distance / 1000;
          roadDuration = osrmData.routes[0].legs[0].duration / 60;
        }
      } catch (err) {
        console.warn('OSRM failed, using fallback distances', err);
      }

      const distance = roadDist;
      
      const RATES = { metro: 0.8, bus: 0.5, auto: 2.0, walk: 0 };
      const SPEED = { metro: 2.5, bus: 4.0, auto: 3.0, walk: 12.0 };

      let options = [];

      // Option A: Metro + Bus (if distance > 3km)
      if (distance > 3) {
        const metroKm = distance * 0.7;
        const busKm = distance * 0.2;
        const walkKm = distance * 0.1; // 0.5km start + 0.3km end roughly
        
        const credits = (metroKm * RATES.metro) + (busKm * RATES.bus);
        const time = (walkKm * SPEED.walk) + (metroKm * SPEED.metro) + (busKm * SPEED.bus) + 5;
        
        options.push({
          id: 'metro_bus',
          title: 'Metro + Bus',
          icon: '🚇',
          credits: credits,
          time: time,
          dist: distance,
          mode: 'metro',
          steps: [
            { icon: '🚶', text: `Walk 0.5km (${Math.round(0.5 * SPEED.walk)} min)` },
            { icon: '🚇', text: `Metro (Fast Transit) (${metroKm.toFixed(1)}km · ${Math.round(metroKm * SPEED.metro)} min)` },
            { icon: '🚌', text: `Bus Connection (${busKm.toFixed(1)}km · ${Math.round(busKm * SPEED.bus)} min)` },
            { icon: '🚶', text: `Walk to dest (${Math.round(0.3 * SPEED.walk)} min)` }
          ]
        });
      }

      // Option B: Bus Only
      options.push({
        id: 'bus_only',
        title: 'Bus Only',
        icon: '🚌',
        credits: distance * RATES.bus,
        time: (distance * SPEED.bus) + 5,
        dist: distance,
        mode: 'bus',
        steps: [
          { icon: '🚶', text: `Walk 0.2km (${Math.round(0.2 * SPEED.walk)} min)` },
          { icon: '🚌', text: `Direct Bus Route (${distance.toFixed(1)}km · ${Math.round(distance * SPEED.bus)} min)` }
        ]
      });

      // Option C: Auto
      options.push({
        id: 'auto',
        title: 'Auto Rickshaw',
        icon: '🛺',
        credits: distance * RATES.auto,
        time: distance * SPEED.auto,
        dist: distance,
        mode: 'auto',
        steps: [
          { icon: '🛺', text: `Direct Auto to Destination (${distance.toFixed(1)}km · ${Math.round(distance * SPEED.auto)} min)` }
        ]
      });

      // Option D: Walk + Metro (if distance < 8km)
      if (distance < 8) {
        const metroKm = distance * 0.8;
        const walkKm = distance * 0.2;
        options.push({
          id: 'walk_metro',
          title: 'Walk + Metro',
          icon: '🚇',
          credits: metroKm * RATES.metro,
          time: (walkKm * SPEED.walk) + (metroKm * SPEED.metro),
          dist: distance,
          mode: 'metro',
          steps: [
            { icon: '🚶', text: `Walk to Station (${(walkKm/2).toFixed(1)}km · ${Math.round((walkKm/2) * SPEED.walk)} min)` },
            { icon: '🚇', text: `Metro Direct (${metroKm.toFixed(1)}km · ${Math.round(metroKm * SPEED.metro)} min)` },
            { icon: '🚶', text: `Walk to Dest (${(walkKm/2).toFixed(1)}km · ${Math.round((walkKm/2) * SPEED.walk)} min)` }
          ]
        });
      }

      // Filter options based on distance rules
      if (distance < 1.5) {
        options = options.filter(o => o.id === 'walk_metro' || o.id === 'auto');
        // Add pure walk option if very short
        options.push({
          id: 'walk_only',
          title: 'Walk',
          icon: '🚶',
          credits: 0,
          time: distance * SPEED.walk,
          dist: distance,
          mode: 'walk',
          steps: [
            { icon: '🚶', text: `Direct Walk (${distance.toFixed(1)}km · ${Math.round(distance * SPEED.walk)} min)` }
          ]
        });
      } else if (distance > 15) {
        // Prioritize Metro + Bus
        options = options.filter(o => o.id !== 'walk_only' && o.id !== 'walk_metro');
      }

      // Calculate cheapest and fastest
      let minCredits = Math.min(...options.map(o => o.credits));
      let minTime = Math.min(...options.map(o => o.time));

      const processedRoutes = options.map(o => ({
        ...o,
        isCheapest: o.credits === minCredits,
        isFastest: o.time === minTime
      }));

      // Sort: cheapest first, then fastest
      processedRoutes.sort((a, b) => a.credits - b.credits);
      
      setRoutes(processedRoutes);
      
    } catch (err) {
      setError('Route calculation failed. Please check your internet connection.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleUseRoute = (route) => {
    const currentBalance = parseFloat(getBalance());
    const routeCost = route.credits;

    if (currentBalance < routeCost) {
      setError('Credits not sufficient. Please Recharge.');
      return;
    }

    // Deduct
    deductCredits(routeCost, {
      source: fromLocation,
      destination: toLocation,
      distanceKm: route.dist,
      transportMode: route.mode
    });

    const newBalance = currentBalance - routeCost;
    saveUserData('credits', newBalance.toFixed(2));
    
    // Save Trip History
    const now = new Date();
    const tripEntry = {
      id: Date.now(),
      from: fromLocation.name.split(',')[0],
      to: toLocation.name.split(',')[0],
      credits: Number(routeCost.toFixed(2)),
      date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      mode: route.mode
    };
    
    const history = loadUserData('travelHistory', []);
    history.push(tripEntry);
    saveUserData('travelHistory', history);

    // Global dispatches
    window.dispatchEvent(new Event('updateCreditsDisplay'));
    window.dispatchEvent(new Event('updateTravelHistory'));
    window.dispatchEvent(new Event('updateAnalytics'));

    // Switch to Map View simulating navigation to Map screen
    setView('map');
  };

  const formatName = (name) => {
    if (!name) return '';
    const parts = name.split(',');
    return parts[0] + (parts[1] ? ',' + parts[1] : '');
  };

  if (view === 'map' && fromLocation && toLocation) {
    return (
      <div className="card-page card-page--map">
         <TripMap
          source={{ lat: fromLocation.lat, lng: fromLocation.lon, name: formatName(fromLocation.name) }}
          destination={{ lat: toLocation.lat, lng: toLocation.lon, name: formatName(toLocation.name) }}
          onSelectDestination={() => {}} // Not needed since destination is already set and confirmed
          onBack={() => setView('planner')}
        />
      </div>
    );
  }

  return (
    <div className="home-page" style={{ overflowY: 'auto' }}>
      <header className="home-header">
        <div className="home-header-logo">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="home-header-title">Smart Route Planner</h1>
          <p className="home-header-subtitle">Find the best route for your journey</p>
        </div>
      </header>
      
      <main className="route-planner-container">
        {error && (
          <div className="card-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="route-input-section">
          <div className="route-input-group">
            <label className="route-input-label"><MapPin size={14} /> From</label>
            <input 
              className="route-planner-input" 
              placeholder="Enter origin..." 
              value={fromQuery}
              onChange={onFromChange}
            />
            {fromSuggestions.length > 0 && (
              <div className="route-suggestions">
                {fromSuggestions.map(s => (
                  <div key={s.place_id} className="route-suggestion-item" onClick={() => handleSelectFrom(s)}>
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button className="route-swap-btn" onClick={handleSwap}>
            <ArrowUpDown size={16} />
          </button>
          
          <div className="route-input-group">
            <label className="route-input-label"><Flag size={14} /> To</label>
            <input 
              className="route-planner-input" 
              placeholder="Enter destination..." 
              value={toQuery}
              onChange={onToChange}
            />
            {toSuggestions.length > 0 && (
              <div className="route-suggestions">
                {toSuggestions.map(s => (
                  <div key={s.place_id} className="route-suggestion-item" onClick={() => handleSelectTo(s)}>
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="route-find-btn" onClick={calculateRoutes} disabled={isCalculating}>
            {isCalculating ? <span className="auth-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Search size={16} />}
            {isCalculating ? 'Calculating...' : 'Find Routes'}
          </button>
        </div>

        {isCalculating && (
          <div className="route-results-loading">
            <div className="skeleton-pulse" />
            <div className="skeleton-pulse" />
            <div className="skeleton-pulse" />
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>Calculating best routes...</p>
          </div>
        )}

        {!isCalculating && routes.length > 0 && (
          <div className="route-results">
            {routes.map(r => (
              <div key={r.id} className={`route-card ${r.isCheapest && r.isFastest ? 'route-card-highlighted' : ''}`}>
                <div className="route-card-header">
                  <span>{r.title}</span>
                  <div className="route-badges">
                    {r.isCheapest && <span className="route-badge route-badge-cheapest">CHEAPEST</span>}
                    {r.isFastest && <span className="route-badge route-badge-fastest">FASTEST</span>}
                  </div>
                </div>

                <div className="route-steps">
                  <div className="route-location">📍 {formatName(fromLocation.name)}</div>
                  {r.steps.map((step, i) => (
                    <div key={i} className="route-step">
                      <span>{step.icon}</span> {step.text}
                    </div>
                  ))}
                  <div className="route-location">🏁 {formatName(toLocation.name)}</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px', marginTop: '2px' }}>
                  <div className="route-footer-pills">
                    <div className="route-pill">⏱ {Math.round(r.time)} min</div>
                    <div className="route-pill">📏 {r.dist.toFixed(1)} km</div>
                    <div className="route-pill" style={{ color: r.isCheapest ? '#00C853' : 'inherit' }}>💳 {r.credits.toFixed(2)} cr</div>
                  </div>
                </div>

                <button className="route-use-btn" onClick={() => handleUseRoute(r)}>
                  Use This Route ➔
                </button>
              </div>
            ))}
            
            <h3 style={{ fontSize: 15, marginTop: 10, marginBottom: 8, color: 'var(--text-primary)' }}>Comparison Summary</h3>
            <table className="route-summary-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Time</th>
                  <th>Dist</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => (
                  <tr key={`summary-${r.id}`}>
                    <td>{r.title}</td>
                    <td>{Math.round(r.time)} min</td>
                    <td>{r.dist.toFixed(1)}k</td>
                    <td style={{ fontWeight: r.isCheapest ? 700 : 500, color: r.isCheapest ? '#00C853' : (r.isFastest ? '#2979FF' : 'inherit') }}>
                      {r.credits.toFixed(2)} {(r.isCheapest || r.isFastest) ? '✦' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
