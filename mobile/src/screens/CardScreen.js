import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VirtualCard from '../components/VirtualCard';
import TransportSelector from '../components/TransportSelector';
import { getBalance, getUserId } from '../utils/storage';
import { colors } from '../theme';

export default function CardScreen({ navigation }) {
  const [balance, setBalance] = useState(50);
  const [userId, setUserId] = useState('USER_001');
  const [transportMode, setTransportMode] = useState('bus');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [storedBalance, storedUserId] = await Promise.all([getBalance(), getUserId()]);
    setBalance(storedBalance);
    setUserId(storedUserId);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleStartScan = () => {
    navigation.navigate('QRScanner', { transportMode });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>💳</Text>
          </View>
          <View>
            <Text style={styles.title}>Namma Card</Text>
            <Text style={styles.subtitle}>Your virtual transit card</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <>
            <VirtualCard userName="Namma Card User" balance={balance} userId={userId} />
            <TransportSelector value={transportMode} onChange={setTransportMode} />

            <TouchableOpacity style={styles.scanBtn} onPress={handleStartScan} activeOpacity={0.85}>
              <Text style={styles.scanBtnIcon}>📷</Text>
              <Text style={styles.scanBtnText}>Scan QR & Start Trip</Text>
            </TouchableOpacity>

            <Text style={styles.offlineNote}>
              Balance & deductions work offline. Map & GPS need permission.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  loader: {
    marginTop: 60,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnIcon: {
    fontSize: 18,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  offlineNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 16,
    lineHeight: 18,
  },
});
