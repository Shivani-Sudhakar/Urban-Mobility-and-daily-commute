const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

export function haversineDistanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function cleanLocationName(name) {
  if (!name || name === '—') return 'Unknown Location';
  // If name contains coordinates like "13.12, 80.10" or "Location 13.12, 80.10"
  if (/(-?\d+\.\d+),\s*(-?\d+\.\d+)/.test(name)) {
    return 'Unknown Location';
  }
  return name;
}

export function formatCoords(point) {
  if (!point) return '—';
  return cleanLocationName(point.name);
}

export async function getCurrentPosition() {
  if (!navigator.geolocation) {
    return { ...CHENNAI_CENTER, accuracy: null, fromFallback: true };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          fromFallback: false,
        });
      },
      () => {
        resolve({ ...CHENNAI_CENTER, accuracy: null, fromFallback: true });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { 'User-Agent': 'NammaCard/1.0' }
    });
    const data = await res.json();
    const name = data.address?.suburb 
      || data.address?.neighbourhood
      || data.address?.city_district
      || data.address?.city
      || data.address?.town
      || 'Unknown Location';
    return name;
  } catch (err) {
    console.error(err);
  }
  return 'Unknown Location';
}

export { CHENNAI_CENTER };
