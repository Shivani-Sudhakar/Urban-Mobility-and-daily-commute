import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatCoords } from '../../utils/location';
import { formatCredits } from '../../utils/credits';

export default function TripReceipt({ receipt, onDone }) {
  return (
    <div className="card-page card-page--receipt">
      <div className="card-receipt">
        <div className="card-receipt-icon">
          <CheckCircle2 size={40} />
        </div>
        <h2>Trip Confirmed</h2>
        <p className="card-receipt-sub">Your credits have been deducted offline.</p>

        <div className="card-receipt-details">
          <div className="card-receipt-row">
            <span>From (A)</span>
            <strong>{formatCoords(receipt.source)}</strong>
          </div>
          <div className="card-receipt-row">
            <span>To (B)</span>
            <strong>{formatCoords(receipt.destination)}</strong>
          </div>
          <div className="card-receipt-row">
            <span>Distance</span>
            <strong>{receipt.distanceKm.toFixed(2)} km</strong>
          </div>
          <div className="card-receipt-row">
            <span>Mode</span>
            <strong className="capitalize">{receipt.transportMode}</strong>
          </div>
          <div className="card-receipt-row card-receipt-row--highlight">
            <span>Credits Deducted</span>
            <strong>-{formatCredits(receipt.creditsDeducted)}</strong>
          </div>
          <div className="card-receipt-row card-receipt-row--balance">
            <span>Remaining Balance</span>
            <strong>{formatCredits(receipt.remainingBalance)} credits</strong>
          </div>
        </div>

        <button type="button" className="card-btn-primary" onClick={onDone}>
          Back to Card
        </button>
      </div>
    </div>
  );
}
