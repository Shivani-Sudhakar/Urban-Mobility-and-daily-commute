import { INITIAL_BALANCE } from './credits';

const BALANCE_KEY = 'userCredits';
const TRANSACTIONS_KEY = 'nammacard_transactions';
const USER_ID_KEY = 'nammacard_user_id';

export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'USER_001';
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getBalance() {
  const stored = localStorage.getItem(BALANCE_KEY);
  if (stored === null) {
    localStorage.setItem(BALANCE_KEY, String(INITIAL_BALANCE));
    return INITIAL_BALANCE;
  }
  return parseFloat(stored);
}

export function setBalance(amount) {
  localStorage.setItem(BALANCE_KEY, String(amount));
}

export function getTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(transaction) {
  const list = getTransactions();
  list.unshift(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
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
