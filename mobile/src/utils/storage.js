import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_BALANCE } from './credits';

const BALANCE_KEY = 'nammacard_balance';
const TRANSACTIONS_KEY = 'nammacard_transactions';
const USER_ID_KEY = 'nammacard_user_id';

export async function getUserId() {
  let id = await AsyncStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'USER_001';
    await AsyncStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export async function getBalance() {
  const stored = await AsyncStorage.getItem(BALANCE_KEY);
  if (stored === null) {
    await AsyncStorage.setItem(BALANCE_KEY, String(INITIAL_BALANCE));
    return INITIAL_BALANCE;
  }
  return parseFloat(stored);
}

export async function setBalance(amount) {
  await AsyncStorage.setItem(BALANCE_KEY, String(amount));
}

export async function getTransactions() {
  try {
    const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTransaction(transaction) {
  const list = await getTransactions();
  list.unshift(transaction);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
}

export async function deductCredits(amount, trip) {
  const balance = await getBalance();
  const newBalance = Math.max(0, balance - amount);

  await setBalance(newBalance);
  await saveTransaction({
    ...trip,
    creditsDeducted: amount,
    remainingBalance: newBalance,
    timestamp: new Date().toISOString(),
  });

  return newBalance;
}
