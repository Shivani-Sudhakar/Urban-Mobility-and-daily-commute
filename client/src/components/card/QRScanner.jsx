import React, { useEffect } from 'react';

export default function QRScanner({ onScan, onClose, onError }) {
  useEffect(() => {
    // Generate QR ONLY when modal opens (this component is mounted on open)
    const container = document.getElementById('qr-code-container');
    if (container) {
      container.innerHTML = ''; // clear previous
      // In Vite ES modules, CDN globals live on window
      if (typeof window !== 'undefined' && window.QRCode) {
        new window.QRCode(container, {
          text: "ANTIGRAVITY-TRANSIT-USER-001",
          width: 196,
          height: 196,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.H
        });
      } else {
        onError?.("QRCode library not loaded");
      }
    }
  }, [onError]);

  return (
    <div id="qr-modal" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.88)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <button 
        type="button" 
        onClick={onClose} 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '28px',
          color: 'white',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: '8px'
        }}
        aria-label="Close scanner"
      >
        ×
      </button>

      <div className="scanner-frame-wrapper" style={{
        position: 'relative',
        width: '220px',
        height: '220px',
        marginBottom: '20px'
      }}>
        {/* Dedicated div for QR with hardcoded size and styling */}
        <div 
          id="qr-code-container" 
          style={{
            width: '220px',
            height: '220px',
            background: '#ffffff',
            padding: '12px',
            borderRadius: '12px',
            boxSizing: 'border-box'
          }}
        />
        
        {/* Scanning animation overlay */}
        <div className="scanner-bracket top-left"></div>
        <div className="scanner-bracket top-right"></div>
        <div className="scanner-bracket bottom-left"></div>
        <div className="scanner-bracket bottom-right"></div>
        <div className="scanner-line"></div>
      </div>

      <p className="scanner-text-pulse">
        Scanning...
      </p>
    </div>
  );
}
