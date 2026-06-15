import React, { useState, useEffect } from 'react';
import { Wallet, X, Check, Sparkles, AlertTriangle, Bus, TrainFront, Car, Route as RouteIcon } from 'lucide-react';
import VirtualCard from '../components/card/VirtualCard';
import { getUserId } from '../utils/storage';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function HomePage({ user, userCredits, onCreditsUpdate }) {
  const [balance, setBalance] = useState(() => userCredits !== null ? userCredits : 50);
  const [showRecharge, setShowRecharge] = useState(false);
  const [credits, setCredits] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle'); // idle | processing | success
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [travelHistory, setTravelHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('travelHistory') || '[]')
    } catch { return [] }
  });

  const loadHistory = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('travelHistory') || '[]');
      stored.sort((a, b) => b.id - a.id);
      setTravelHistory(stored);
    } catch {
      setTravelHistory([]);
    }
  };

  const userId = getUserId();
  const userName = user?.name || 'Namma Card User';

  useEffect(() => {
    if (userCredits !== null) {
      setBalance(userCredits);
    }
    loadHistory();
    const handleUpdate = () => {
      loadHistory();
    };
    window.addEventListener('creditsUpdated', handleUpdate);
    return () => window.removeEventListener('creditsUpdated', handleUpdate);
  }, [userCredits]);

  const creditsNum = parseFloat(credits) || 0;
  const amountToPay = creditsNum / 2; // ₹1 = 2 credits

  const handleRechargeClick = () => {
    setShowRecharge(true);
    setCredits('');
    setError('');
    setShowPayment(false);
    setPaymentStep('idle');
  };

  const handleCancel = () => {
    setShowRecharge(false);
    setCredits('');
    setShowPayment(false);
    setPaymentStep('idle');
    setError('');
  };

  const handleCreditsSubmit = () => {
    if (creditsNum <= 0) {
      setError('Please enter a valid number of credits');
      return;
    }
    if (creditsNum > 10000) {
      setError('Maximum recharge is 10,000 credits');
      return;
    }
    setError('');
    setShowPayment(true);
  };

  const handlePay = async () => {
    setPaymentStep('processing');
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/recharge-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ credits: creditsNum })
      });
      const data = await res.json();

      if (data.success) {
        // Simulate processing delay for animation
        await new Promise(resolve => setTimeout(resolve, 1800));
        
        setBalance(data.newBalance);
        localStorage.setItem('userCredits', String(data.newBalance));
        window.dispatchEvent(new Event('creditsUpdated'));
        if (onCreditsUpdate) onCreditsUpdate(data.newBalance);
        
        setPaymentStep('success');

        // Auto-close after success animation
        setTimeout(() => {
          setShowRecharge(false);
          setShowPayment(false);
          setPaymentStep('idle');
          setCredits('');
        }, 3000);
      } else {
        setPaymentStep('idle');
        setError(data.error || 'Recharge failed. Please try again.');
      }
    } catch (err) {
      setPaymentStep('idle');
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // GPay-style Payment Animation Overlay
  if (paymentStep === 'processing' || paymentStep === 'success') {
    return (
      <div className="home-page">
        <div className="payment-overlay">
          {paymentStep === 'processing' && (
            <div className="payment-processing">
              <div className="payment-ripple-container">
                <div className="payment-ripple payment-ripple-1" />
                <div className="payment-ripple payment-ripple-2" />
                <div className="payment-ripple payment-ripple-3" />
                <div className="payment-pulse-dot" />
              </div>
              <p className="payment-processing-text">Processing Payment...</p>
              <p className="payment-processing-amount">₹{amountToPay.toFixed(2)}</p>
            </div>
          )}
          {paymentStep === 'success' && (
            <div className="payment-success">
              {/* Confetti particles */}
              <div className="payment-confetti">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`confetti-particle confetti-${i % 5}`} style={{
                    left: `${10 + Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random() * 1.5}s`,
                  }} />
                ))}
              </div>
              <div className="payment-success-circle">
                <div className="payment-success-ring" />
                <Check size={40} strokeWidth={3} className="payment-check-icon" />
              </div>
              <h2 className="payment-success-title">Payment Successful!</h2>
              <p className="payment-success-amount">₹{amountToPay.toFixed(2)}</p>
              <div className="payment-success-details">
                <div className="payment-detail-row">
                  <span>Credits Added</span>
                  <strong>+{creditsNum}</strong>
                </div>
                <div className="payment-detail-row">
                  <span>New Balance</span>
                  <strong>{balance} credits</strong>
                </div>
              </div>
              <div className="payment-success-badge">
                <Sparkles size={14} />
                <span>Namma Card Recharged</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-logo">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"
            />
          </svg>
        </div>
        <div>
          <h1 className="home-header-title">Home</h1>
          <p className="home-header-subtitle">Welcome back, {userName.split(' ')[0]}</p>
        </div>
      </header>

      <main className="home-main">
        {/* Virtual Card */}
        <VirtualCard userName={userName} balance={balance} userId={userId} />

        {balance <= 20 && !showRecharge && (
          <div className="card-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>Credits not sufficient. Please Recharge</span>
          </div>
        )}

        {/* Recharge Button */}
        {!showRecharge && (
          <button
            type="button"
            className="home-recharge-btn"
            onClick={handleRechargeClick}
          >
            <Wallet size={18} />
            Recharge
          </button>
        )}

        {/* Recharge Flow */}
        {showRecharge && (
          <div className="home-recharge-card animate-fade-in">
            <div className="home-recharge-card-header">
              <h3>Recharge Namma Card</h3>
              <button type="button" className="home-recharge-close" onClick={handleCancel}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="card-error" role="alert">{error}</div>
            )}

            {/* Credits Input */}
            <div className="home-recharge-field">
              <label htmlFor="credits-input">Enter Credits</label>
              <div className="home-recharge-input-wrap">
                <input
                  id="credits-input"
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 100"
                  value={credits}
                  onChange={(e) => {
                    setCredits(e.target.value);
                    setShowPayment(false);
                    setError('');
                  }}
                  autoFocus
                />
                <span className="home-recharge-unit">credits</span>
              </div>
              <p className="home-recharge-rate">₹1 = 2 credits</p>
            </div>

            {/* Quick amount pills */}
            <div className="home-recharge-pills">
              {[50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`home-recharge-pill${creditsNum === val ? ' home-recharge-pill--active' : ''}`}
                  onClick={() => {
                    setCredits(String(val));
                    setShowPayment(false);
                    setError('');
                  }}
                >
                  {val}
                </button>
              ))}
            </div>

            {/* Show amount or submit */}
            {!showPayment ? (
              <button
                type="button"
                className="card-btn-primary"
                onClick={handleCreditsSubmit}
                disabled={creditsNum <= 0}
              >
                Continue
              </button>
            ) : (
              <div className="home-payment-summary animate-fade-in">
                <div className="home-payment-row">
                  <span>Credits</span>
                  <strong>{creditsNum}</strong>
                </div>
                <div className="home-payment-row home-payment-row--total">
                  <span>Amount to Pay</span>
                  <strong>₹{amountToPay.toFixed(2)}</strong>
                </div>
                <div className="home-payment-actions">
                  <button type="button" className="card-btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="card-btn-primary home-pay-btn"
                    onClick={handlePay}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="auth-spinner" />
                    ) : (
                      <>Pay ₹{amountToPay.toFixed(2)}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Travel History Section */}
        <div className="travel-history-section animate-fade-in">
          <div className="travel-history-header">
            <h3 className="travel-history-title">Travel History</h3>
            <p className="travel-history-summary">
              {travelHistory.length} trips · {travelHistory.reduce((sum, trip) => sum + trip.credits, 0).toFixed(2)} credits spent
            </p>
          </div>
          
          <div className="travel-history-list">
            {travelHistory.length === 0 ? (
              <div className="travel-history-empty">
                <RouteIcon size={32} />
                <p>No trips yet. Start your first journey!</p>
              </div>
            ) : (
              travelHistory.map((trip) => {
                let ModeIcon = Bus;
                if (trip.mode === 'metro') ModeIcon = TrainFront;
                else if (trip.mode === 'auto') ModeIcon = Car;

                return (
                  <div key={trip.id} className="travel-history-card">
                    <div className="travel-history-icon">
                      <ModeIcon size={20} />
                    </div>
                    <div className="travel-history-details">
                      <p className="travel-history-route">{trip.from} → {trip.to}</p>
                      <p className="travel-history-time">{trip.date} • {trip.time}</p>
                    </div>
                    <div className="travel-history-credits">
                      — {Number(trip.credits).toFixed(2)} credits
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
