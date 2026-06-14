import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthPage({
  screen,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  otp,
  otpRefs,
  otpCooldown,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  error,
  onLoginSubmit,
  onSignupSubmit,
  onOtpChange,
  onOtpKeyDown,
  onResendOtp,
  onPasswordSetSubmit,
  onGoToWelcome,
  onGoToLogin,
  onGoToSignup,
  onResetAuth,
}) {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const otp0Ref = useRef(null);

  useEffect(() => {
    if (screen === 'signup') {
      nameRef.current?.focus();
    }
    if (screen === 'login') {
      emailRef.current?.focus();
    }
    if (screen === 'otp_verify') {
      otp0Ref.current?.focus();
    }
  }, [screen]);

  const emailAlreadyExists =
    error === 'This email is already registered. Please login.';

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-logo">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="auth-title">namma card</h1>
        <p className="auth-subtitle">Chennai Urban Commute</p>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          {error && (
            <div className="auth-error" role="alert">
              {error}
              {emailAlreadyExists && (
                <button
                  type="button"
                  className="auth-error-link"
                  onClick={onGoToLogin}
                >
                  Go to Login
                </button>
              )}
            </div>
          )}

          {screen === 'welcome' && (
            <div className="auth-form">
              <div className="auth-form-header auth-welcome-header">
                <h2>Welcome to Namma Card</h2>
                <p>Your smart companion for Chennai urban commute.</p>
              </div>

              <button
                type="button"
                className="auth-btn-primary"
                onClick={onGoToLogin}
              >
                Login
              </button>

              <button
                type="button"
                className="auth-btn-secondary"
                onClick={onGoToSignup}
              >
                Sign Up
              </button>
            </div>
          )}

          {screen === 'login' && (
            <form onSubmit={onLoginSubmit} className="auth-form">
              <button type="button" className="auth-back-link" onClick={onGoToWelcome}>
                &larr; Back
              </button>

              <div className="auth-form-header">
                <h2>Login</h2>
                <p>Enter your email and password to continue.</p>
              </div>

              <div className="auth-field">
                <label htmlFor="login-email">Email Address</label>
                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : 'Login'}
              </button>

              <button type="button" className="auth-btn-secondary" onClick={onGoToSignup}>
                Don&apos;t have an account? Sign Up
              </button>
            </form>
          )}

          {screen === 'signup' && (
            <form onSubmit={onSignupSubmit} className="auth-form">
              <button type="button" className="auth-back-link" onClick={onGoToWelcome}>
                &larr; Back
              </button>

              <div className="auth-form-header">
                <h2>Sign Up</h2>
                <p>Enter your name and email address to create an account.</p>
              </div>

              <div className="auth-field">
                <label htmlFor="name">Your Name</label>
                <input
                  ref={nameRef}
                  id="name"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="e.g. Adyar Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : 'Continue'}
              </button>

              <button type="button" className="auth-btn-secondary" onClick={onGoToLogin}>
                Already have an account? Login
              </button>
            </form>
          )}

          {screen === 'otp_verify' && (
            <div className="auth-form">
              <button type="button" className="auth-back-link" onClick={() => onResetAuth('signup')}>
                &larr; Back to sign up
              </button>

              <div className="auth-form-header">
                <span className="auth-kicker">Verification Required</span>
                <h2>Verify Email</h2>
                <p>
                  We&apos;ve sent a 4-digit code to{' '}
                  <strong>{email.trim().toLowerCase()}</strong>
                </p>
              </div>

              <div className="auth-otp-row">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs[index].current = el;
                      if (index === 0) otp0Ref.current = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => onOtpChange(index, e.target.value)}
                    onKeyDown={(e) => onOtpKeyDown(index, e)}
                    className="auth-otp-input"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              <div className="auth-resend-row">
                <span>Didn&apos;t receive the OTP?</span>
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={otpCooldown > 0 || isLoading}
                  className="auth-resend-btn"
                >
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <button type="button" className="auth-btn-secondary" onClick={() => onResetAuth('signup')}>
                Go Back
              </button>
            </div>
          )}

          {screen === 'password_set' && (
            <form onSubmit={onPasswordSetSubmit} className="auth-form">
              <div className="auth-form-header">
                <span className="auth-kicker">Final Step</span>
                <h2>Set Password</h2>
                <p>Create a password for <strong>{email}</strong></p>
              </div>

              <div className="auth-field">
                <label htmlFor="new-password">Create Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                {isLoading ? <span className="auth-spinner" /> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="auth-footer">
        &copy; {new Date().getFullYear()} CHENNAI SMART CITY LTD. &bull; SECURE AUTH
      </footer>
    </div>
  );
}
