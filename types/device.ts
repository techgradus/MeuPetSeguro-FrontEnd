import type { DeviceType } from '@/constants/deviceTypes';

export type PetDevice = {
  id: string;
  type: DeviceType;
  code: string;
  online: boolean;
  battery: number | null;
  lastSyncAt: string | null;
};