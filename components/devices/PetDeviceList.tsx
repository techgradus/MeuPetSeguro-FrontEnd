import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/petTheme';
import { getDeviceType } from '@/constants/deviceTypes';
import type { PetDevice } from '@/types/device';

type Props = {
  devices: PetDevice[];
  onRemove: (device: PetDevice) => void;
};

export function PetDeviceList({ devices, onRemove }: Props) {
  if (devices.length === 0) return null;

  return (
    <View style={styles.box}>
      {devices.map((device, index) => {
        const info = getDeviceType(device.type);
        const status = device.online
          ? `Online${device.battery != null ? ` · bateria ${device.battery}%` : ''}`
          : 'Offline';

        return (
          <View key={device.id} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View style={[styles.icon, { backgroundColor: info.softColor }]}>
              <Ionicons name={info.icon} size={18} color={info.color} />
            </View>
            <View style={styles.texts}>
              <Text style={styles.label}>{info.label}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {device.code} · {status}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onRemove(device)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remover ${info.label}`}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: '#CDEEE8', backgroundColor: '#FBFFFD',
    paddingHorizontal: 14, marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#E3ECEA' },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  meta: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMuted, marginTop: 2 },
});