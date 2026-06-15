import { INITIAL_BALANCE } from './credits';

// --- User Isolation Helpers ---

export function getCurrentUserEmail() {
  const session = localStorage.getItem('userSession');
  if (session) {
    try {
      return JSON.parse(session).email || 'guest';
    } catch {
      return 'guest';
    }
  }
  return 'guest';
}

export function getUserKey(key) {
  const email = getCurrentUserEmail();
  return `${email}_${key}`;
}

export function saveUserData(key, value) {
  localStorage.setItem(getUserKey(key), JSON.stringify(value));
}

export function loadUserData(key, fallback) {
  try {
    const val = localStorage.getItem(getUserKey(key));
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export function initNewUser() {
  const existing = localStorage.getItem(getUserKey('credits'));
  if (existing === null) {
    saveUserData('credits', 100.00);
    saveUserData('travelHistory', []);
  }
}

export function onUserLogin(email) {
  initNewUser();
  window.dispatchEvent(new Event('updateCreditsDisplay'));
  window.dispatchEvent(new Event('updateTravelHistory'));
  window.dispatchEvent(new Event('updateAnalytics'));
}

// --- Old Helpers (refactored to use new helpers) ---

export function getUserId() {
  return getCurrentUserEmail();
}

export function getBalance() {
  return parseFloat(loadUserData('credits', INITIAL_BALANCE));
}

export function setBalance(amount) {
  saveUserData('credits', amount);
}

export function getTransactions() {
  return loadUserData('transactions', []);
}

export function saveTransaction(transaction) {
  const list = getTransactions();
  list.unshift(transaction);
  saveUserData('transactions', list);
}

export function deductCredits(amount, trip) {
  const balance = getBalance();
  const newBalance = Math.max(0, balance - amount);

  setBalance(newBalance);
  saveTransaction({
    ...trip,
    creditsDeducted: amount,
    remainingBalance: newBalance,
    timestamp: new Date().toISOString(),
  });

  return newBalance;
}
