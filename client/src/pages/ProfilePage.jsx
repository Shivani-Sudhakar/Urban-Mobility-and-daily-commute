import React from 'react';

function initialsFromName(name) {
  if (!name) return 'U';
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  const out = (first + last).toUpperCase();
  return out || 'U';
}

export default function ProfilePage({ user, userCredits, onLogout }) {
  const name = user?.name || 'N/A';
  const email = user?.email || 'N/A';
  const creditsNum = typeof userCredits === 'number' ? userCredits : Number(userCredits);
  const creditsText = Number.isFinite(creditsNum) ? `${creditsNum.toFixed(2)} cr` : 'N/A';

  // Optional profile pic support (best-effort; backend may provide different keys)
  const avatarUrl = user?.avatarUrl || user?.profilePic || user?.avatar;

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
            <p className="home-header-subtitle">Your account details</p>
          </div>
        </header>

        <main className="home-main">
          <div
            className="home-recharge-card"
            style={{ padding: 18, borderRadius: 16, position: 'relative' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(15,118,110,0.04))',
                  border: '1.5px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#0f766e' }}>
                    {initialsFromName(name)}
                  </span>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 4
                  }}
                >
                  Name
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#1e293b',
                    wordBreak: 'break-word'
                  }}
                >
                  {name}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 4
                  }}
                >
                  Email
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>
                  {email}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(15,118,110,0.06)',
                  border: '1.5px solid rgba(15,118,110,0.14)',
                  borderRadius: 12,
                  padding: '12px 14px'
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0f766e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 6
                  }}
                >
                  Credits Available
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0f766e' }}>{creditsText}</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div style={{ paddingTop: 16 }}>
        <button
          onClick={onLogout}
          className="card-btn-primary"
          style={{ background: '#EF4444', fontWeight: 800 }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

