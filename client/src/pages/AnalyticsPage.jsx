import React, { useEffect, useState, useRef } from 'react';
import { Route, CreditCard, Clock, Calendar, BarChart3, TrendingUp, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import { cleanLocationName } from '../utils/location';
import { loadUserData } from '../utils/storage';

const getDaysArray = (days) => {
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push(d);
  }
  return arr;
};

export default function AnalyticsPage() {
  const [history, setHistory] = useState([]);
  
  const tripChartRef = useRef(null);
  const spendChartRef = useRef(null);
  const tripCanvasRef = useRef(null);
  const spendCanvasRef = useRef(null);

  const loadData = () => {
    const data = loadUserData('travelHistory', []);
    setHistory(data);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('updateAnalytics', loadData);
    return () => window.removeEventListener('updateAnalytics', loadData);
  }, []);

  // Compute metrics
  const totalTrips = history.length;
  const totalCredits = history.reduce((acc, curr) => acc + (curr.credits || 0), 0);
  const avgCredits = totalTrips > 0 ? (totalCredits / totalTrips) : 0;

  // Most active day
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  history.forEach(h => {
    // If h.timestamp exists, use it, else parse h.date (e.g. 15 Jun 2026)
    let d;
    if (h.timestamp) d = new Date(h.timestamp);
    else if (h.date) d = new Date(h.date);
    else d = new Date();
    
    // getDay() returns 0 for Sunday, 1 for Monday etc.
    const day = d.getDay();
    const adjustedDay = day === 0 ? 6 : day - 1; // Mon=0 ... Sun=6
    dayCounts[adjustedDay]++;
  });
  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let mostActiveDayStr = "-";
  if (totalTrips > 0) {
    let maxIdx = 0;
    for(let i=1; i<7; i++) {
      if(dayCounts[i] > dayCounts[maxIdx]) maxIdx = i;
    }
    mostActiveDayStr = daysLabels[maxIdx];
  }

  // Draw Charts
  useEffect(() => {
    if (!history.length || !window.Chart) return;
    
    const accent = '#0f766e';
    const accentLight = 'rgba(15, 118, 110, 0.2)';
    
    // 1. Trip Frequency (Bar)
    if (tripChartRef.current) tripChartRef.current.destroy();
    if (tripCanvasRef.current) {
      tripChartRef.current = new window.Chart(tripCanvasRef.current, {
        type: 'bar',
        data: {
          labels: daysLabels,
          datasets: [{
            data: dayCounts,
            backgroundColor: accent,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      });
    }

    // 2. Spending Trend (Line)
    if (spendChartRef.current) spendChartRef.current.destroy();
    if (spendCanvasRef.current) {
      // Last 7 trip dates
      const recentTrips = [...history].sort((a,b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
        return dateA - dateB;
      }).slice(-7);
      
      const spendLabels = recentTrips.map(t => {
        const d = t.timestamp ? new Date(t.timestamp) : new Date(t.date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      const spendData = recentTrips.map(t => t.credits || 0);

      spendChartRef.current = new window.Chart(spendCanvasRef.current, {
        type: 'line',
        data: {
          labels: spendLabels,
          datasets: [{
            label: 'Credits',
            data: spendData,
            borderColor: accent,
            backgroundColor: accentLight,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
    
    return () => {
      if (tripChartRef.current) tripChartRef.current.destroy();
      if (spendChartRef.current) spendChartRef.current.destroy();
    };
  }, [history]);

  // Route Insights
  let mostVisitedDest = "-";
  let destMax = 0;
  let mostFrequentOrig = "-";
  let origMax = 0;

  const destCounts = {};
  const origCounts = {};
  history.forEach(t => {
    if (t.to) {
      const toName = cleanLocationName(t.to);
      destCounts[toName] = (destCounts[toName] || 0) + 1;
      if (destCounts[toName] > destMax) {
        destMax = destCounts[toName];
        mostVisitedDest = toName;
      }
    }
    if (t.from) {
      const fromName = cleanLocationName(t.from);
      origCounts[fromName] = (origCounts[fromName] || 0) + 1;
      if (origCounts[fromName] > origMax) {
        origMax = origCounts[fromName];
        mostFrequentOrig = fromName;
      }
    }
  });

  // Trip Records
  let highestTrip = null;
  let lowestTrip = null;
  history.forEach(t => {
    if (!highestTrip || t.credits > highestTrip.credits) highestTrip = t;
    if (!lowestTrip || t.credits < lowestTrip.credits) lowestTrip = t;
  });

  // Peak Travel Time
  let peakTravelTime = "-";
  let thisWeekTrips = 0;
  let lastWeekTrips = 0;
  if (history.length > 0) {
    const hourCounts = {};
    const now = new Date();
    history.forEach(t => {
      const d = t.timestamp ? new Date(t.timestamp) : new Date(t.date + ' ' + (t.time || '12:00 PM'));
      const hour = d.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      
      const diffTime = Math.abs(now - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays <= 7) thisWeekTrips++;
      else if (diffDays <= 14) lastWeekTrips++;
    });
    
    let maxH = 0;
    let maxHC = 0;
    Object.keys(hourCounts).forEach(h => {
      if (hourCounts[h] > maxHC) {
        maxHC = hourCounts[h];
        maxH = parseInt(h);
      }
    });
    const ampm = maxH >= 12 ? 'PM' : 'AM';
    const period = maxH >= 5 && maxH < 12 ? 'Morning' : (maxH >= 12 && maxH < 17 ? 'Afternoon' : 'Evening');
    const displayH = maxH % 12 || 12;
    peakTravelTime = `${period} ${displayH} ${ampm} - ${(displayH%12)+1} ${ampm}`;
  }

  const tripsChange = thisWeekTrips - lastWeekTrips;

  if (history.length === 0) {
    return (
      <div className="analytics-page animate-fade-in flex flex-col items-center justify-center">
        <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
          <BarChart3 size={48} style={{ margin: '0 auto', opacity: 0.5, marginBottom: '16px' }} />
          <p>No trips yet — start travelling to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page animate-fade-in">
      
      {/* 2x2 Grid */}
      <div className="analytics-grid">
        <div className="analytics-stat-card">
          <Route className="stat-icon" size={20} />
          <p className="analytics-metric-value">{totalTrips}</p>
          <span className="analytics-metric-label">Total Trips</span>
        </div>
        <div className="analytics-stat-card">
          <CreditCard className="stat-icon" size={20} />
          <p className="analytics-metric-value">{totalCredits.toFixed(2)}</p>
          <span className="analytics-metric-label">Credits Spent</span>
        </div>
        <div className="analytics-stat-card">
          <TrendingUp className="stat-icon" size={20} />
          <p className="analytics-metric-value">{avgCredits.toFixed(2)}</p>
          <span className="analytics-metric-label">Avg. / Trip</span>
        </div>
        <div className="analytics-stat-card">
          <Calendar className="stat-icon" size={20} />
          <p className="analytics-metric-value" style={{ fontSize: '20px', lineHeight: '33px' }}>{mostActiveDayStr}</p>
          <span className="analytics-metric-label">Most Active Day</span>
        </div>
      </div>

      {/* Middle Section - Charts */}
      <div className="analytics-card">
        <h2 className="analytics-section-title">Trip Frequency</h2>
        <div className="analytics-chart-container">
          <canvas ref={tripCanvasRef}></canvas>
        </div>
      </div>

      <div className="analytics-card">
        <h2 className="analytics-section-title">Spending Trend</h2>
        <div className="analytics-chart-container">
          <canvas ref={spendCanvasRef}></canvas>
        </div>
      </div>

      {/* Bottom Section - Highlights */}
      <div className="analytics-card">
        <h2 className="analytics-section-title">Route Insights</h2>
        
        <div className="analytics-highlight-row">
          <div className="analytics-highlight-info">
            <div className="analytics-highlight-icon">
              <Navigation size={16} />
            </div>
            <div>
              <p className="analytics-highlight-title">{mostVisitedDest}</p>
              <p className="analytics-highlight-desc">Most visited destination</p>
            </div>
          </div>
          <div className="analytics-highlight-value">
            {destMax} <span className="analytics-highlight-subvalue">trips</span>
          </div>
        </div>

        <div className="analytics-highlight-row">
          <div className="analytics-highlight-info">
            <div className="analytics-highlight-icon">
              <Route size={16} />
            </div>
            <div>
              <p className="analytics-highlight-title">{mostFrequentOrig}</p>
              <p className="analytics-highlight-desc">Most frequent origin</p>
            </div>
          </div>
          <div className="analytics-highlight-value">
            {origMax} <span className="analytics-highlight-subvalue">trips</span>
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <h2 className="analytics-section-title">Trip Records</h2>
        
        <div className="analytics-highlight-row">
          <div className="analytics-highlight-info">
            <div className="analytics-highlight-icon">
              <Maximize2 size={16} />
            </div>
            <div>
              <p className="analytics-highlight-title">Highest Credit Trip</p>
              <p className="analytics-highlight-desc">{highestTrip ? `${cleanLocationName(highestTrip.from)} → ${cleanLocationName(highestTrip.to)}` : '-'}</p>
            </div>
          </div>
          <div className="analytics-highlight-value">
            {highestTrip ? Number(highestTrip.credits).toFixed(2) : '-'} <span className="analytics-highlight-subvalue">credits</span>
          </div>
        </div>

        <div className="analytics-highlight-row">
          <div className="analytics-highlight-info">
            <div className="analytics-highlight-icon">
              <Minimize2 size={16} />
            </div>
            <div>
              <p className="analytics-highlight-title">Lowest Credit Trip</p>
              <p className="analytics-highlight-desc">{lowestTrip ? `${cleanLocationName(lowestTrip.from)} → ${cleanLocationName(lowestTrip.to)}` : '-'}</p>
            </div>
          </div>
          <div className="analytics-highlight-value">
            {lowestTrip ? Number(lowestTrip.credits).toFixed(2) : '-'} <span className="analytics-highlight-subvalue">credits</span>
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <h2 className="analytics-section-title">Peak Travel Time</h2>
        
        <div className="analytics-highlight-row">
          <div className="analytics-highlight-info">
            <div className="analytics-highlight-icon">
              <Clock size={16} />
            </div>
            <div>
              <p className="analytics-highlight-title">{peakTravelTime}</p>
              <p className="analytics-highlight-desc">Most frequent travel hour</p>
            </div>
          </div>
          <div className="analytics-highlight-value" style={{ color: tripsChange >= 0 ? '#10b981' : '#f43f5e' }}>
            {tripsChange >= 0 ? '↑' : '↓'} {Math.abs(tripsChange)} <span className="analytics-highlight-subvalue">vs last week</span>
          </div>
        </div>
      </div>

    </div>
  );
}
