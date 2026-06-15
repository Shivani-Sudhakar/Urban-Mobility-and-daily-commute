import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCoords } from '../utils/location';
import { formatCredits } from '../utils/credits';
import { colors } from '../theme';

export default function TripReceiptScreen({ navigation, route }) {
  const { receipt } = route.params;

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Card' }],
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Trip Confirmed</Text>
          <Text style={styles.subtitle}>Your credits have been deducted offline.</Text>

          <View style={styles.details}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>From (A)</Text>
              <Text style={styles.rowValue}>{formatCoords(receipt.source)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>To (B)</Text>
              <Text style={styles.rowValue}>{formatCoords(receipt.destination)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Distance</Text>
              <Text style={styles.rowValue}>{receipt.distanceKm.toFixed(2)} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Mode</Text>
              <Text style={[styles.rowValue, styles.capitalize]}>{receipt.transportMode}</Text>
            </View>
            <View style={[styles.row, styles.rowHighlight]}>
              <Text style={styles.rowLabel}>Credits Deducted</Text>
              <Text style={[styles.rowValue, styles.deducted]}>
                -{formatCredits(receipt.creditsDeducted)}
              </Text>
            </View>
            <View style={[styles.row, styles.rowBalance]}>
              <Text style={styles.rowLabel}>Remaining Balance</Text>
              <Text style={[styles.rowValue, styles.balanceValue]}>
                {formatCredits(receipt.remainingBalance)} credits
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Back to Card</Text>
          </TouchableOpacity>
        </View>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d1fae5',
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 64,
    marginBottom: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  details: {
    width: '100%',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdfa',
  },
  rowHighlight: {
    backgroundColor: '#fef2f2',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginTop: 4,
  },
  rowBalance: {
    backgroundColor: '#ecfdf5',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '55%',
    textAlign: 'right',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  deducted: {
    color: colors.error,
  },
  balanceValue: {
    color: colors.primary,
    fontSize: 16,
  },
  doneBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
