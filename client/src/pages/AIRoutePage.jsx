import React from 'react';

export default function AIRoutePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-header-logo">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <div>
          <h1 className="home-header-title">AI Route</h1>
          <p className="home-header-subtitle">Smart route planning</p>
        </div>
      </header>
      <main className="home-main">
        {/* Content area */}
      </main>
    </div>
  );
}
