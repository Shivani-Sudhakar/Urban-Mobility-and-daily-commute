// routingEngine.js
import { Client } from "@googlemaps/google-maps-services-js";
import dotenv from 'dotenv';

dotenv.config();

const googleMapsClient = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * AI Multi-Modal Routing Engine using Live Google Maps Data
 * @param {string} fromLocation - User input source location (e.g., "Central")
 * @param {string} toLocation - User input destination location (e.g., "Guindy")
 */
export async function computeAIRoutes(fromLocation, toLocation) {
  // Safe fallback if API key is unconfigured or dry during a presentation demo
  if (!API_KEY || API_KEY.includes('YourActualCopiedGoogleKey')) {
    console.warn("⚠️ Google Maps API Key missing! Dropping back to simulated fallback metrics.");
    return getSimulatedFallback(fromLocation, toLocation);
  }

  try {
    // 1. Fetch real geographic matrix parameters from Google Maps API
    const response = await googleMapsClient.distanceMatrix({
      params: {
        origins: [`${fromLocation}, Chennai, Tamil Nadu`],
        destinations: [`${toLocation}, Chennai, Tamil Nadu`],
        mode: "driving", 
        key: API_KEY,
      },
      timeout: 5000,
    });

    const element = response.data.rows[0].elements[0];

    if (element.status !== "OK") {
      throw new Error(`Google Maps could not parse locations: ${element.status}`);
    }

    const distanceKm = element.distance.value / 1000; // Meters to KM conversion
    const baseDrivingTimeMins = Math.round(element.duration.value / 60); // Seconds to Minutes

    // 2. AI Traffic Variable Mapping
    const currentHour = new Date().getHours();
    const isPeakTraffic = currentHour >= 17 && currentHour <= 20; // Peak traffic hours (5 PM - 8 PM)
    const trafficMultiplier = isPeakTraffic ? 1.4 : 1.0;

    // --- TRANSIT OPTION 1: CHENNAI METRO RAIL ---
    // Unaffected by road traffic bottlenecks. 
    // Estimated at ~40 km/h average speed. Ticketing: base ₹10 + ₹3 per kilometer.
    const metroTime = Math.round((distanceKm / 40) * 60) + 6; // Adding 6 mins platform boarding buffer
    const metroCost = Math.min(60, 10 + Math.round(distanceKm * 3)); 

    // --- TRANSIT OPTION 2: MTC LOCAL BUS SERVICE ---
    // Highly affordable but scales up significantly during heavy traffic delays.
    const busTime = Math.round(baseDrivingTimeMins * 1.3 * trafficMultiplier); 
    const busCost = Math.min(25, 5 + Math.round(distanceKm * 1.2)); // Government capped rate at ₹25

    // --- TRANSIT OPTION 3: AUTO RICKSHAW / CONNECT ---
    // Faster maneuvers through lanes but significantly pricier.
    const autoTime = Math.round(baseDrivingTimeMins * 0.9 * trafficMultiplier);
    const autoCost = 35 + Math.round(distanceKm * 15); // Base ₹35 flagdown + ₹15/km

    // 3. Compile Options Structure
    const transitOptions = [
      {
        mode: 'Chennai Metro Rail',
        time: metroTime,
        cost: metroCost,
        distance: distanceKm.toFixed(1),
        description: 'Fixed-rail underground track layout bypassing road congestion entirely.'
      },
      {
        mode: 'MTC Local Bus Network',
        time: busTime,
        cost: busCost,
        distance: distanceKm.toFixed(1),
        description: `High-economy commuter line.${isPeakTraffic ? ' Anticipate major road delays due to rush hour bottleneck nodes.' : ''}`
      },
      {
        mode: 'Namma Auto Rickshaw Connect',
        time: autoTime,
        cost: autoCost,
        distance: distanceKm.toFixed(1),
        description: 'Direct door-to-door transit featuring automated NammaCard digital balance deduction.'
      }
    ];

    // 4. Sort to pick absolute best outcomes
    const fastest = [...transitOptions].sort((a, b) => a.time - b.time)[0];
    const cheapest = [...transitOptions].sort((a, b) => a.cost - b.cost)[0];

    return { fastest, cheapest };

  } catch (error) {
    console.error("AI Routing engine exception caught:", error.message);
    return getSimulatedFallback(fromLocation, toLocation);
  }
}

function getSimulatedFallback(from, to) {
  return {
    fastest: { mode: 'Chennai Metro Rail (Simulated)', time: 20, cost: 40, distance: '6.5', description: 'Emergency fallback trajectory tracking.' },
    cheapest: { mode: 'MTC Local Bus Network (Simulated)', time: 45, cost: 12, distance: '6.5', description: 'Low-cost baseline alternate transit profile.' }
  };
}
