import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/petTheme';
import type { PetDevice } from '@/types/device';
import { DeviceGroup, getGroupInfo, groupDevices } from '@/utils/deviceGroups';

type Props = {
  devices: PetDevice[];
  /** Remove o equipamento inteiro (a estação de potes leva os dois potes juntos). */
  onRemove: (group: DeviceGroup) => void;
};

const statusText = (group: DeviceGroup) => {
  if (group.online) return `Online${group.battery != null ? ` · bateria ${group.battery}%` : ''}`;
  if (group.onlineCount > 0) return 'Parcialmente online';
  return 'Offline';
};

export function PetDeviceList({ devices, onRemove }: Props) {
  const groups = groupDevices(devices);
  if (groups.length === 0) return null;

  return (
    <View style={styles.box}>
      {groups.map((group, index) => {
        const info = getGroupInfo(group);
        const status = statusText(group);

        return (
          <View key={group.key} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View style={[styles.icon, { backgroundColor: info.softColor }]}>
              <Ionicons name={info.icon} size={18} color={info.color} />
            </View>
            <View style={styles.texts}>
              <Text style={styles.label}>{info.label}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {group.code} · {status}{group.devices.some((d) => d.simulated) ? ' · simulado' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onRemove(group)}
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