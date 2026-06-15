import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, X, Loader2 } from 'lucide-react';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const sourceIcon = L.divIcon({
  className: 'card-map-marker card-map-marker--source',
  html: '<span>A</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const destIcon = L.divIcon({
  className: 'card-map-marker card-map-marker--dest',
  html: '<span>B</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapClickHandler({ onSelectDestination }) {
  useMapEvents({
    click(e) {
      onSelectDestination({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Auto-fit bounds when destination changes
function FitBounds({ source, destination }) {
  const map = useMap();

  useEffect(() => {
    if (source && destination) {
      const bounds = L.latLngBounds(
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [map, source, destination]);

  return null;
}

export default function TripMap({ source, destination, onSelectDestination, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  const center = useMemo(() => {
    if (destination) {
      return [
        (source.lat + destination.lat) / 2,
        (source.lng + destination.lng) / 2,
      ];
    }
    return [source.lat, source.lng];
  }, [source, destination]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search using Nominatim
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (value.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: value.trim(),
          format: 'json',
          limit: '6',
          addressdetails: '1',
        });

        // Bias search near the user's current location
        if (source) {
          params.set('viewbox', `${source.lng - 0.5},${source.lat + 0.5},${source.lng + 0.5},${source.lat - 0.5}`);
          params.set('bounded', '0');
        }

        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        const data = await res.json();

        setSearchResults(
          data.map((item) => ({
            id: item.place_id,
            name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: item.type,
          }))
        );
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, [source]);

  const handleSelectResult = useCallback(
    (result) => {
      setSearchQuery(result.name.split(',')[0]); // Show short name
      setShowResults(false);
      setSearchResults([]);
      onSelectDestination({ lat: result.lat, lng: result.lng, name: result.name.split(',')[0] });
    },
    [onSelectDestination]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

  return (
    <div className="card-map-screen">
      <div className="card-map-header">
        <button type="button" className="card-back-link" onClick={onBack}>
          &larr; Back
        </button>
        <div>
          <h2>Select Destination</h2>
          <p>Search for a place or tap on the map</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-search-container">
        <div className="card-search-bar">
          <Search size={16} className="card-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search destination..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="card-search-input"
            id="destination-search"
          />
          {isSearching && <Loader2 size={16} className="card-search-spinner" />}
          {searchQuery && !isSearching && (
            <button type="button" className="card-search-clear" onClick={clearSearch} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="card-search-results" ref={resultsRef}>
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                className="card-search-item"
                onClick={() => handleSelectResult(result)}
              >
                <MapPin size={14} className="card-search-item-icon" />
                <span className="card-search-item-text">{result.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card-map-wrap">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom
          className="card-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelectDestination={onSelectDestination} />
          <FitBounds source={source} destination={destination} />
          <Marker position={[source.lat, source.lng]} icon={sourceIcon}>
            <Popup>Your Location (A)</Popup>
          </Marker>
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
              <Popup>Destination (B)</Popup>
            </Marker>
          )}
          <Circle
            center={[source.lat, source.lng]}
            radius={source.accuracy || 40}
            pathOptions={{ color: '#0f766e', fillColor: '#0f766e', fillOpacity: 0.12 }}
          />
        </MapContainer>
      </div>
    </div>
  );
}
