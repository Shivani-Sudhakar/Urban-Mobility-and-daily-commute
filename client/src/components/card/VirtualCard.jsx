import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Bus, TrainFront, Car } from 'lucide-react';
import { formatCredits } from '../../utils/credits';

const MODES = [
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'metro', label: 'Metro', icon: TrainFront },
  { id: 'auto', label: 'Auto', icon: Car },
];

export default function VirtualCard({ userName, balance, userId }) {
  return (
    <div className="virtual-card">
      <div className="virtual-card-shine" />
      <div className="virtual-card-top">
        <div className="virtual-card-brand">
          <span className="virtual-card-chip" />
          <div>
            <p className="virtual-card-label">Namma Card</p>
            <p className="virtual-card-city">Chennai Transit</p>
          </div>
        </div>
        <div className="virtual-card-qr">
          <QRCodeSVG value={userId} size={56} bgColor="transparent" fgColor="#ffffff" level="M" />
        </div>
      </div>

      <div className="virtual-card-body">
        <div>
          <p className="virtual-card-field-label">Card Holder</p>
          <p className="virtual-card-name">{userName}</p>
        </div>
        <div className="virtual-card-balance-block">
          <p className="virtual-card-field-label">Balance</p>
          <p className="virtual-card-balance">
            {formatCredits(balance)} <span>credits</span>
          </p>
        </div>
      </div>

      <div className="virtual-card-footer">
        <span>ID: {userId}</span>
        <span>₹1 = 2 credits</span>
      </div>
    </div>
  );
}

export function TransportSelector({ value, onChange }) {
  return (
    <div className="card-mode-section">
      <label htmlFor="transport-mode" className="card-mode-label">
        Transport Mode
      </label>
      <div className="card-mode-select-wrap">
        <select
          id="transport-mode"
          className="card-mode-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.label}
            </option>
          ))}
        </select>
      </div>
      <div className="card-mode-pills">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const active = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              className={`card-mode-pill${active ? ' card-mode-pill--active' : ''}`}
              onClick={() => onChange(mode.id)}
            >
              <Icon size={16} />
              {mode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
