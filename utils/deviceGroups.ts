import { getSetupOption } from '@/constants/deviceSetup';
import { DeviceType, getDeviceType } from '@/constants/deviceTypes';
import type { PetDevice } from '@/types/device';

/**
 * No servidor a estação de potes são dois dispositivos (COMIDA-<ID> e AGUA-<ID>), mas para a pessoa é
 * um equipamento só. Este arquivo junta os dois em um item ("grupo") para listar, contar e remover.
 */
export type DeviceGroup = {
  key: string;
  kind: DeviceType | 'estacao';
  code: string;
  devices: PetDevice[];
  onlineCount: number;
  online: boolean;
  battery: number | null;
};

const FOOD_PREFIX = 'COMIDA-';
const WATER_PREFIX = 'AGUA-';

const idOf = (code: string, prefix: string) => {
  const upper = code.toUpperCase();
  return upper.startsWith(prefix) ? upper.slice(prefix.length) : null;
};

const minBattery = (devices: PetDevice[]) => {
  const levels = devices.map((d) => d.battery).filter((b): b is number => b != null);
  return levels.length ? Math.min(...levels) : null;
};

const toGroup = (key: string, kind: DeviceGroup['kind'], code: string, devices: PetDevice[]): DeviceGroup => {
  const onlineCount = devices.filter((d) => d.online).length;
  return { key, kind, code, devices, onlineCount, online: onlineCount === devices.length, battery: minBattery(devices) };
};

export function groupDevices(devices: PetDevice[]): DeviceGroup[] {
  const foodIds = new Map<string, PetDevice>();
  const waterIds = new Map<string, PetDevice>();

  for (const device of devices) {
    if (device.type === 'comida') {
      const id = idOf(device.code, FOOD_PREFIX);
      if (id) foodIds.set(id, device);
    } else if (device.type === 'agua') {
      const id = idOf(device.code, WATER_PREFIX);
      if (id) waterIds.set(id, device);
    }
  }

  const groups: DeviceGroup[] = [];

  for (const device of devices) {
    const foodId = device.type === 'comida' ? idOf(device.code, FOOD_PREFIX) : null;
    const waterId = device.type === 'agua' ? idOf(device.code, WATER_PREFIX) : null;

    if (foodId && waterIds.has(foodId)) {
      groups.push(toGroup(`station-${foodId}`, 'estacao', `ESTACAO-${foodId}`, [device, waterIds.get(foodId)!]));
    } else if (waterId && foodIds.has(waterId)) {
      continue; // já entrou no grupo da estação, junto com o pote de comida
    } else {
      groups.push(toGroup(device.id, device.type, device.code, [device]));
    }
  }

  return groups;
}

export function getGroupInfo(group: DeviceGroup) {
  if (group.kind === 'estacao') {
    const { label, icon, color, softColor } = getSetupOption('estacao');
    return { label, icon, color, softColor };
  }
  const { label, icon, color, softColor } = getDeviceType(group.kind);
  return { label, icon, color, softColor };
}

/** Quantos equipamentos o pet (ou a casa) tem e quantos estão online. */
export function unitsSummary(devices: PetDevice[]) {
  const groups = groupDevices(devices);
  return { total: groups.length, online: groups.filter((g) => g.online).length };
}