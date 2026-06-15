import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { formatCredits } from '../utils/credits';
import { colors } from '../theme';

export default function VirtualCard({ userName, balance, userId }) {
  return (
    <View style={styles.card}>
      <View style={styles.shine} />
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <View style={styles.chip} />
          <View>
            <Text style={styles.brandLabel}>Namma Card</Text>
            <Text style={styles.brandCity}>Chennai Transit</Text>
          </View>
        </View>
        <View style={styles.qrWrap}>
          <QRCode value={userId} size={56} backgroundColor="transparent" color="#ffffff" />
        </View>
      </View>

      <View style={styles.body}>
        <View>
          <Text style={styles.fieldLabel}>Card Holder</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <View style={styles.balanceBlock}>
          <Text style={styles.fieldLabel}>Balance</Text>
          <Text style={styles.balance}>
            {formatCredits(balance)} <Text style={styles.balanceUnit}>credits</Text>
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ID: {userId}</Text>
        <Text style={styles.footerText}>₹1 = 2 credits</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardGradientStart,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  shine: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  brandLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  brandCity: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  qrWrap: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 8,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  balanceBlock: {
    alignItems: 'flex-end',
  },
  balance: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.85,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
});
