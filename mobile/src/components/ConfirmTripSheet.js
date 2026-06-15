import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { formatCredits } from '../utils/credits';
import { colors } from '../theme';

export default function ConfirmTripSheet({
  visible,
  distanceKm,
  credits,
  transportMode,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>Confirm Trip</Text>
              <Text style={styles.subtitle}>
                Trip from <Text style={styles.bold}>A</Text> → <Text style={styles.bold}>B</Text>?
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{distanceKm.toFixed(2)} km</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.meta}>{transportMode}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.meta}>{formatCredits(credits)} credits</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.cancelBtn} onPress={onCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.confirmBtn} onPress={onConfirm}>
                  <Text style={styles.confirmText}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  metaDot: {
    marginHorizontal: 8,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
