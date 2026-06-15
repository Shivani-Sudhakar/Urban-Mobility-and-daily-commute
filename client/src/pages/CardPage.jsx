import React, { useCallback, useState, useEffect, useRef } from 'react';
import { ScanLine, AlertTriangle } from 'lucide-react';
import VirtualCard, { TransportSelector } from '../components/card/VirtualCard';
import QRScanner from '../components/card/QRScanner';
import TripMap from '../components/card/TripMap';
import TripReceipt from '../components/card/TripReceipt';
import { calculateCredits } from '../utils/credits';
import { getCurrentPosition, haversineDistanceKm, reverseGeocode } from '../utils/location';
import { deductCredits, getBalance, getUserId, loadUserData, saveUserData } from '../utils/storage';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function CardPage({ user, userCredits }) {
  const [view, setView] = useState('card');
  const [balance, setBalance] = useState(() => userCredits !== null ? userCredits : getBalance());
  const [transportMode, setTransportMode] = useState('bus');
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [scannedQr, setScannedQr] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);
  const scanTimerRef = useRef(null);

  const userId = getUserId();
  const userName = user?.name || 'Namma Card User';

  // Update balance when userCredits changes from server
  useEffect(() => {
    if (userCredits !== null) {
      setBalance(userCredits);
    }
  }, [userCredits]);

  // Check low balance on mount and after balance changes
  useEffect(() => {
    if (Number(Number(balance).toFixed(2)) <= 20.00) {
      setLowBalanceWarning(true);
    } else {
      setLowBalanceWarning(false);
    }
  }, [balance]);

  // Cleanup scan timer
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  const resetTrip = useCallback(() => {
    setSource(null);
    setDestination(null);
    setScannedQr('');
    setReceipt(null);
    setShowConfirmSheet(false);
    setError('');
  }, []);

  const handleStartScan = () => {
    setError('');

    // Check low balance first
    const currentBalance = getBalance();
    setBalance(currentBalance);
    if (Number(Number(currentBalance).toFixed(2)) <= 20.00) {
      setLowBalanceWarning(true);
      setError('Your Namma Card balance is too low. Please recharge to continue.');
      return;
    }

    // Show the QR modal with the generated QR code
    setShowQRModal(true);
    setIsScanning(true);

    scanTimerRef.current = setTimeout(async () => {
      // After showing the QR, "scan" it and proceed to GPS
      const qrValue = userId;
      setScannedQr(qrValue);

      try {
        const position = await getCurrentPosition();
        if (!position.name) {
          position.name = await reverseGeocode(position.lat, position.lng);
        }
        setSource(position);
        setDestination(null);
        // Close modal only when map is ready
        setShowQRModal(false);
        setIsScanning(false);
        setView('map');
      } catch {
        setShowQRModal(false);
        setIsScanning(false);
        setError('Could not get GPS location. Please enable location permissions.');
        setView('card');
      }
    }, 3000);
  };

  const handleSelectDestination = async (point) => {
    if (!point.name) {
      point.name = await reverseGeocode(point.lat, point.lng);
    }
    setDestination(point);
    setShowConfirmSheet(true);
  };

  const handleConfirmTrip = async () => {
    if (!source || !destination) return;

    const distanceKm = haversineDistanceKm(source, destination);
    const creditsDeducted = calculateCredits(distanceKm);

    // Final balance check before deduction
    if (Number(Number(balance).toFixed(2)) <= 20.00) {
      setError('Your Namma Card balance is too low. Please recharge to continue.');
      setShowConfirmSheet(false);
      resetTrip();
      setView('card');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/deduct-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          amount: creditsDeducted,
          tripDetails: {
            source,
            destination,
            distanceKm,
            transportMode,
            scannedQr,
          }
        })
      });
      const data = await res.json();

      if (data.success) {
        // Update local storage to sync with server
        setBalance(data.remainingBalance);
        saveUserData('credits', Number(data.remainingBalance).toFixed(2));
        
        // Save to travelHistory
        const now = new Date();
        const tripEntry = {
          id: Date.now(),
          from: source.name || 'Unknown Location',
          to: destination.name || 'Unknown Location',
          credits: Number(Number(creditsDeducted).toFixed(2)),
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          mode: transportMode
        };
        const history = loadUserData('travelHistory', []);
        history.push(tripEntry);
        saveUserData('travelHistory', history);

        window.dispatchEvent(new Event('updateCreditsDisplay'));
        window.dispatchEvent(new Event('updateTravelHistory'));
        window.dispatchEvent(new Event('updateAnalytics'));
        
        // Also save transaction locally for offline capability
        deductCredits(creditsDeducted, {
          source,
          destination,
          distanceKm,
          transportMode,
          scannedQr,
        });

        setReceipt({
          source,
          destination,
          distanceKm,
          transportMode,
          creditsDeducted,
          remainingBalance: data.remainingBalance,
        });
        setShowConfirmSheet(false);
        setView('receipt');
      } else {
        setError(data.error || 'Failed to deduct credits. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    resetTrip();
    setView('card');
  };

  if (view === 'receipt' && receipt) {
    return <TripReceipt receipt={receipt} onDone={handleDone} />;
  }

  if (view === 'map' && source) {
    return (
      <div className="card-page card-page--map">
        <TripMap
          source={source}
          destination={destination}
          onSelectDestination={handleSelectDestination}
          onBack={() => {
            resetTrip();
            setView('card');
          }}
        />

        {showConfirmSheet && destination && (
          <div className="card-bottom-sheet-backdrop" onClick={() => setShowConfirmSheet(false)}>
            <div
              className="card-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="confirm-trip-title"
            >
              <div className="card-sheet-handle" />
              <h3 id="confirm-trip-title">Confirm Trip</h3>
              <p>
                Trip from <strong>A</strong> → <strong>B</strong>?
              </p>
              <p className="card-sheet-meta">
                {haversineDistanceKm(source, destination).toFixed(2)} km ·{' '}
                <span className="capitalize">{transportMode}</span> ·{' '}
                {calculateCredits(haversineDistanceKm(source, destination)).toFixed(2)} credits
              </p>
              <div className="card-sheet-actions">
                <button
                  type="button"
                  className="card-btn-secondary"
                  onClick={() => setShowConfirmSheet(false)}
                >
                  Cancel
                </button>
                <button type="button" className="card-btn-primary" onClick={handleConfirmTrip}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-page">
      <header className="card-header">
        <div className="card-header-logo">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div>
          <h1 className="card-header-title">Namma Card</h1>
          <p className="card-header-subtitle">Your virtual transit card</p>
        </div>
      </header>

      <main className="card-main">
        {error && (
          <div className="card-error" role="alert">
            {error}
          </div>
        )}

        {lowBalanceWarning && !error && (
          <div className="card-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>Credits not sufficient. Please Recharge</span>
          </div>
        )}

        {/* Card with scanning overlay */}
        <div className="card-scan-wrapper">
          <VirtualCard userName={userName} balance={balance} userId={userId} />
          {isScanning && (
            <div className="card-scan-overlay">
              <div className="card-scan-line" />
              <p className="card-scan-text">Scanning QR...</p>
            </div>
          )}
        </div>

        <TransportSelector value={transportMode} onChange={setTransportMode} />

        <button
          type="button"
          className="card-btn-primary card-scan-btn"
          onClick={handleStartScan}
          disabled={isLoading || isScanning}
        >
          {isLoading || isScanning ? (
            <span className="auth-spinner" />
          ) : (
            <>
              <ScanLine size={18} />
              Scan QR &amp; Start Trip
            </>
          )}
        </button>

        <p className="card-offline-note">
          Balance &amp; deductions work offline. Map &amp; GPS need permission.
        </p>
      </main>

      {/* QR Code Modal - rendered when showQRModal is true */}
      {showQRModal && (
        <QRScanner
          onScan={(val) => {
            setScannedQr(val);
            setShowQRModal(false);
          }}
          onClose={() => {
            setShowQRModal(false);
            setIsScanning(false);
            if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
          }}
          onError={(msg) => setError(msg)}
        />
      )}
    </div>
  );
}
