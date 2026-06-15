import React from 'react';

export default function ProfilePage({ user, onLogout }) {
  return (
    <div className="home-page" style={{ justifyContent: 'space-between' }}>
      <div>
        <header className="home-header">
          <div className="home-header-logo">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="home-header-title">Profile</h1>
            <p className="home-header-subtitle">Manage your account</p>
          </div>
        </header>

        <main className="home-main">
          {/* User Info Card */}
          <div className="home-recharge-card">
            <div style={{ marginBottom: '16px' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '4px'
              }}>
                Name
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                {user?.name || 'N/A'}
              </span>
            </div>

            <div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'block',
                marginBottom: '4px'
              }}>
                Email Address
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#1e293b'
              }}>
                {user?.email || 'N/A'}
              </span>
            </div>
          </div>
        </main>
      </div>

      <div style={{ paddingTop: '16px' }}>
        <button
          onClick={onLogout}
          className="card-btn-primary"
          style={{
            background: '#EF4444',
            fontWeight: 700,
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
