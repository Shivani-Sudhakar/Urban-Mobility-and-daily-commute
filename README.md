# 🚌 Namma Card — Chennai Commuter Transit App

> One card. Every route. Zero friction.

Namma Card is a unified digital transit wallet for Chennai commuters. Scan a QR, pick your destination on a live map, and pay across Bus, Metro, and Auto — all from one app. Every trip is logged, every credit tracked, and every route optimised.

---

## 📱 What It Does

Chennai's transit system is fragmented — MTC buses run on cash, the Metro uses tokens, and autos have no digital trail. Namma Card fixes this with a single app that handles payment, navigation, and spending analytics for all three.

---

## ✨ Features

### 🔲 QR Scan & Ride
Each user account has a unique QR code embedded in their card. Tapping "Scan QR" or "Travel" pops up the QR with a live scanning animation (sweep line + corner brackets). After scanning, the map opens automatically.

### 🗺️ Live Map with GPS
Built on **Leaflet.js** and **OpenStreetMap** — completely free, no API key required. The app detects your current location via `navigator.geolocation` and reverse-geocodes it to a readable area name using Nominatim. You enter your destination in a floating search bar, a route is drawn, and the app asks:

> *"Confirm ride from Anna Nagar to Egmore?"*

### 💳 Credit Wallet
Credits are deducted per trip based on distance and transport type. Balances are rounded to 2 decimal places and synced in real time across both the Home screen and Card screen. If credits fall short, the app blocks the ride and shows:

> *"Credits not sufficient. Please Recharge."*

### 🕐 Travel History
Every confirmed trip is saved with origin, destination, credits spent, date, and time — displayed in reverse chronological order below the card on the Home screen with a summary of total trips and total credits spent.

### 📊 Smart Analytics
The analytics page rebuilds itself after every trip from live data:

- Total trips, total credits spent, average per trip, peak travel day
- Bar chart — trips by day of week
- Line chart — spending trend over last 7 trips
- Most visited destination and most frequent origin
- Highest and lowest credit trips
- Peak travel hour

### 🛣️ Smart Route Planner
Enter any two locations and get route options ranked by cost and speed — just like Chennai One:

| Route | Example Time | Example Cost |
|---|---|---|
| 🚇 Metro + Bus | 25 min | 4.50 cr |
| 🚌 Bus Only | 38 min | 2.90 cr |
| 🛺 Auto | 19 min | 11.60 cr |

Badges highlight the **cheapest** and **fastest** option. Tapping "Use This Route" books the trip, deducts credits, and saves it to history.

### 👤 Per-User Data Isolation
All data — credits, travel history, analytics — is scoped to the logged-in email address. Switching accounts instantly loads that user's private data. No data leaks between accounts.

---

## 🗂️ App Screens

| Screen | Description |
|---|---|
| **Home** | Card widget with balance + travel history list |
| **Card** | Full card view, QR scan trigger |
| **Map** | Live GPS map, destination search, ride confirmation |
| **Analytics** | Charts, stats, route insights |
| **Route Planner** | A → B comparison with cheapest/fastest badges |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Maps | Leaflet.js + OpenStreetMap |
| Geocoding | Nominatim API (free, no key) |
| Routing | OSRM Project (free, no key) |
| QR Generation | qrcodejs (CDN) |
| Charts | Chart.js |
| Storage | localStorage (per-email scoped keys) |

**Zero paid APIs.** No Google Maps. No Mapbox. No backend required.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/namma-card.git
cd namma-card
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📐 Data Structure

### User Credits
```
localStorage key: {email}_credits
value: "342.50"
```

### Travel History Entry
```json
{
  "id": 1718430000000,
  "from": "Anna Nagar",
  "to": "Egmore",
  "credits": 4.50,
  "date": "15 Jun 2026",
  "time": "09:14 AM"
}
```

```
localStorage key: {email}_travelHistory
value: JSON array of entries
```

---

## 💡 Credit Rates

| Transport | Rate |
|---|---|
| 🚇 Metro | 0.80 credits / km |
| 🚌 Bus | 0.50 credits / km |
| 🛺 Auto | 2.00 credits / km |
| 🚶 Walk | Free |

Distance is calculated using the **OSRM routing API** for actual road distance. Falls back to the Haversine formula if the API is unavailable.

---

## 🔐 Account Isolation

Every piece of user data is namespaced by email:

```
priya@gmail.com_credits       → 342.50
priya@gmail.com_travelHistory → [...]

arjun@gmail.com_credits       → 89.20
arjun@gmail.com_travelHistory → [...]
```

Logging out preserves data in storage but clears the active session. Logging back in restores everything exactly as left.

---

## 📍 Location & Maps

- **Current location** — detected via `navigator.geolocation.getCurrentPosition()`
- **Reverse geocoding** — Nominatim converts GPS coordinates to readable area names (suburb → neighbourhood → city)
- **Destination search** — Nominatim autocomplete restricted to India (`countrycodes=in`), debounced at 400ms
- **Map tiles** — OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
- **Road routing** — OSRM (`https://router.project-osrm.org`)

---

## 📁 Project Structure

```
namma-card/
├── public/
├── src/
│   ├── screens/
│   │   ├── Home.jsx
│   │   ├── Card.jsx
│   │   ├── Map.jsx
│   │   ├── Analytics.jsx
│   │   └── RoutePlanner.jsx
│   ├── components/
│   │   ├── QRModal.jsx
│   │   ├── TravelHistory.jsx
│   │   ├── RouteCard.jsx
│   │   └── BottomNav.jsx
│   ├── utils/
│   │   ├── storage.js      # per-user localStorage helpers
│   │   ├── geo.js          # Haversine + Nominatim + OSRM
│   │   └── credits.js      # deduction + formatting
│   └── App.jsx
├── index.html
└── package.json
```

---

## 🗺️ Roadmap

- [ ] Backend sync (Firebase / Supabase)
- [ ] Offline mode with cached map tiles
- [ ] Push notifications for low credits
- [ ] Recharge flow integration
- [ ] Multi-city support beyond Chennai
- [ ] NFC tap support alongside QR

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">Built for Chennai. Powered by open source.</p>
