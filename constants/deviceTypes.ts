import type { Ionicons } from '@expo/vector-icons';

export type DeviceType = 'colar' | 'comida' | 'agua';

type IconName = keyof typeof Ionicons.glyphMap;

export type DeviceTypeInfo = {
  type: DeviceType;
  label: string;
  description: string;
  icon: IconName;
  color: string;      // cor do ícone
  softColor: string;  // fundo do ícone
  turnOn: string;     // título da etapa "Prepare o dispositivo"
};

export const DEVICE_TYPES: DeviceTypeInfo[] = [
  { type: 'colar', label: 'Colar do pet', description: 'Atividade e rotina', icon: 'paw-outline', color: '#00857C', softColor: '#C8F0EC', turnOn: 'Ligue o colar' },
  { type: 'comida', label: 'Pote de comida', description: 'Nível e consumo', icon: 'restaurant-outline', color: '#E08E00', softColor: '#FFF0D5', turnOn: 'Ligue o pote' },
  { type: 'agua', label: 'Pote de água', description: 'Nível e hidratação', icon: 'water-outline', color: '#6FB1DD', softColor: '#DCEAF3', turnOn: 'Ligue o pote' },
];

export const getDeviceType = (type: DeviceType) =>
  DEVICE_TYPES.find((d) => d.type === type) ?? DEVICE_TYPES[0];
