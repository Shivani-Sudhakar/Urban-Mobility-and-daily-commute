import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { House, Route, CreditCard, BarChart3, User } from 'lucide-react';

import HomePage from './pages/HomePage';
import AIRoutePage from './pages/AIRoutePage';
import CardPage from './pages/CardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import { onUserLogin, saveUserData, loadUserData } from './utils/storage';

const API_BASE = 'http://127.0.0.1:5000/api';

export default function App() {
  // Screen state: 'loading' | 'welcome' | 'login' | 'signup' | 'otp_verify' | 'password_set' | 'app'
  const [screen, setScreen] = useState(() =>
    localStorage.getItem('token') ? 'loading' : 'welcome'
  );
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [userCredits, setUserCredits] = useState(() => {
    return loadUserData('credits', null);
  });

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state (4 digits)
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [otpCooldown, setOtpCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);

  // Password Set state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Always start fresh on the welcome screen when not logged in
  useLayoutEffect(() => {
    if (!localStorage.getItem('token')) {
      setScreen('welcome');
      setName('');
      setEmail('');
      setPassword('');
      setOtp(['', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, []);

  // 1. Silent Session Restore
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setIsLoading(true);
      fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Unauthorized');
      })
      .then(data => {
        setUser(data);
        setToken(savedToken);
        localStorage.setItem('userSession', JSON.stringify({ email: data.email }));
        onUserLogin(data.email);
        const credits = loadUserData('credits', data.credits);
        setUserCredits(credits);
        saveUserData('credits', credits);
        setScreen('app');
      })
      .catch(() => {
        localStorage.removeItem('token');
        setScreen('welcome');
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      setScreen('welcome');
    }
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // Cooldown timer logic for OTP resend
  const startCooldown = () => {
    setOtpCooldown(30);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setOtpCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const goToWelcome = () => {
    setError('');
    setPassword('');
    setOtp(['', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setScreen('welcome');
  };

  const goToLogin = () => {
    setError('');
    setPassword('');
    setScreen('login');
  };

  const goToSignup = () => {
    setError('');
    setName('');
    setEmail('');
    setScreen('signup');
  };

  // Sign up: name + email, then OTP flow
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${API_BASE}/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const data = await res.json();

      if (data.exists) {
        setError('This email is already registered. Please login.');
        return;
      }

      const otpRes = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const otpData = await otpRes.json();

      if (otpData.success) {
        setScreen('otp_verify');
        setOtp(['', '', '', '']);
        startCooldown();
      } else {
        setError(otpData.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login: email + password
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        // Get user details
        const meRes = await fetch(`${API_BASE}/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const meData = await meRes.json();
        setUser(meData);
        localStorage.setItem('userSession', JSON.stringify({ email: meData.email }));
        onUserLogin(meData.email);
        const credits = loadUserData('credits', meData.credits);
        setUserCredits(credits);
        saveUserData('credits', credits);
        setScreen('app');
        setActiveTab('home');
      } else {
        setError(data.error || 'Incorrect password. Try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Screen 2B OTP input handlers
  const handleOtpChange = (index, value) => {
    // Only accept numeric inputs
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance focus to next input
    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }

    // Auto-submit OTP once all 4 digits are entered
    if (newOtp.every(digit => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      // If current field is empty, clear the previous and move focus back
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Verify OTP submission
  const handleVerifyOtp = async (otpCodeString) => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCodeString })
      });
      const data = await res.json();

      if (data.success) {
        setScreen('password_set');
      } else {
        setError(data.error || 'Incorrect OTP');
        // Clear inputs on failure
        setOtp(['', '', '', '']);
        otpRefs[0].current.focus();
      }
    } catch (err) {
      setError('Verification error. Please try again.');
      setOtp(['', '', '', '']);
      otpRefs[0].current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP logic
  const handleResendOtp = async () => {
    if (otpCooldown > 0 || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();

      if (data.success) {
        startCooldown();
        setOtp(['', '', '', '']);
        otpRefs[0].current.focus();
      } else {
        setError(data.error || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Screen 3: Create password & register
  const handlePasswordSetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.trim().toLowerCase(), password: newPassword })
      });
      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        // Get user details to fetch credits
        const meRes = await fetch(`${API_BASE}/me`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const meData = await meRes.json();
        setUser(meData);
        localStorage.setItem('userSession', JSON.stringify({ email: meData.email }));
        onUserLogin(meData.email);
        const credits = loadUserData('credits', meData.credits);
        setUserCredits(credits);
        saveUserData('credits', credits);
        setScreen('app');
        setActiveTab('home');
      } else {
        setError(data.error || 'Failed to register account');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAuthFlow = (targetScreen = 'welcome', clearIdentity = false) => {
    setError('');
    setPassword('');
    setOtp(['', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    if (clearIdentity) {
      setName('');
      setEmail('');
    }
    setScreen(targetScreen);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userSession');
    setUser(null);
    setToken(null);
    setName('');
    setEmail('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUserCredits(null);
    setScreen('welcome');
  };

  // Global function to sync credits display
  const updateCreditsDisplay = () => {
    const saved = loadUserData('credits', null);
    if (saved !== null) {
      setUserCredits(parseFloat(saved));
    }
  };

  // Add event listener to sync across possible separate components or local storage changes
  useEffect(() => {
    window.addEventListener('storage', updateCreditsDisplay);
    window.addEventListener('updateCreditsDisplay', updateCreditsDisplay);
    return () => {
      window.removeEventListener('storage', updateCreditsDisplay);
      window.removeEventListener('updateCreditsDisplay', updateCreditsDisplay);
    };
  }, []);

  // Render Page Content based on Active Tab
  const renderTabContent = () => {
    return (
      <div className="screens-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '64px' }}>
        <div className="screen-wrapper" style={{ display: activeTab === 'home' ? 'flex' : 'none', width: '100%', height: '100%', position: 'absolute' }}>
          <HomePage user={user} userCredits={userCredits} onCreditsUpdate={(val) => { setUserCredits(val); saveUserData('credits', val); window.dispatchEvent(new Event('updateCreditsDisplay')); }} />
        </div>
        <div className="screen-wrapper" style={{ display: activeTab === 'route' ? 'flex' : 'none', width: '100%', height: '100%', position: 'absolute' }}>
          <AIRoutePage />
        </div>
        <div className="screen-wrapper" style={{ display: activeTab === 'card' ? 'flex' : 'none', width: '100%', height: '100%', position: 'absolute' }}>
          <CardPage user={user} userCredits={userCredits} />
        </div>
        <div className="screen-wrapper" style={{ display: activeTab === 'analytics' ? 'flex' : 'none', width: '100%', height: '100%', position: 'absolute' }}>
          <AnalyticsPage />
        </div>
        <div className="screen-wrapper" style={{ display: activeTab === 'profile' ? 'flex' : 'none', width: '100%', height: '100%', position: 'absolute' }}>
          <ProfilePage user={user} onLogout={handleLogout} />
        </div>
      </div>
    );
  };

  // Loading indicator for silent logins / actions
  if (screen === 'loading') {
    return (
      <div className="phone-container justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#0f766e] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#64748b] text-[14px] font-medium font-inter">Loading...</p>
      </div>
    );
  }

  // Render Full App Screen or Auth Flow Screens
  return (
    <div className={`phone-container${screen !== 'app' ? ' phone-container--auth' : ''}`}>
      {screen === 'app' ? (
        // MAIN 5-TAB APP SHELL
        <div className="h-full flex flex-col justify-between" style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div className="flex-1 pb-16" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {renderTabContent()}
          </div>

          {/* Persistent Bottom Navigation Bar */}
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E5E7EB] flex justify-around items-center px-2 z-20">
            {/* Home Tab */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors cursor-pointer ${
                activeTab === 'home' ? 'text-[#0f766e]' : 'text-[#64748b]'
              }`}
            >
              <House size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">Home</span>
            </button>

            {/* AI Route Tab */}
            <button
              onClick={() => setActiveTab('route')}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors cursor-pointer ${
                activeTab === 'route' ? 'text-[#0f766e]' : 'text-[#64748b]'
              }`}
            >
              <Route size={20} strokeWidth={activeTab === 'route' ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">AI Route</span>
            </button>

            {/* Card Tab */}
            <button
              onClick={() => setActiveTab('card')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors cursor-pointer ${
                activeTab === 'card' ? 'text-[#0f766e]' : 'text-[#64748b]'
              }`}
            >
              <CreditCard size={20} strokeWidth={activeTab === 'card' ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">Card</span>
            </button>

            {/* Analytics Tab */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'text-[#0f766e]' : 'text-[#64748b]'
              }`}
            >
              <BarChart3 size={20} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">Analytics</span>
            </button>

            {/* Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'text-[#0f766e]' : 'text-[#64748b]'
              }`}
            >
              <User size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-tight">Profile</span>
            </button>
          </nav>
        </div>
      ) : (
        <AuthPage
          screen={screen}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          otp={otp}
          otpRefs={otpRefs}
          otpCooldown={otpCooldown}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          showNewPassword={showNewPassword}
          setShowNewPassword={setShowNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          isLoading={isLoading}
          error={error}
          onLoginSubmit={handleLoginSubmit}
          onSignupSubmit={handleSignupSubmit}
          onOtpChange={handleOtpChange}
          onOtpKeyDown={handleOtpKeyDown}
          onResendOtp={handleResendOtp}
          onPasswordSetSubmit={handlePasswordSetSubmit}
          onGoToWelcome={goToWelcome}
          onGoToLogin={goToLogin}
          onGoToSignup={goToSignup}
          onResetAuth={resetAuthFlow}
        />
      )}
    </div>
  );
}
