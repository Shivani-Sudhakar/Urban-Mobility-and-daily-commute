import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

const MODES = [
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'metro', label: 'Metro', emoji: '🚇' },
  { id: 'auto', label: 'Auto', emoji: '🛺' },
];

export default function TransportSelector({ value, onChange }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Transport Mode</Text>
      <View style={styles.pills}>
        {MODES.map((mode) => {
          const active = value === mode.id;
          return (
            <TouchableOpacity
              key={mode.id}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onChange(mode.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillEmoji}>{mode.emoji}</Text>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  pills: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillEmoji: {
    fontSize: 16,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pillTextActive: {
    color: '#fff',
  },
});
