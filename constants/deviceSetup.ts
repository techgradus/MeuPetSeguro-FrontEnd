import type { Ionicons } from '@expo/vector-icons';
import type { DeviceType } from '@/constants/deviceTypes';

/**
 * O que a pessoa conecta no assistente "Novo dispositivo" (equipamentos físicos):
 * - colar: uma placa, um código (COLAR-<ID>);
 * - estação de potes: uma placa com duas balanças, um código na etiqueta (ESTACAO-<ID>).
 *   No servidor ela vira dois dispositivos: pote de comida (COMIDA-<ID>) e pote de água (AGUA-<ID>).
 */
export type SetupKind = 'colar' | 'estacao';

type IconName = keyof typeof Ionicons.glyphMap;

export type SetupOption = {
  kind: SetupKind;
  label: string;
  description: string;
  icon: IconName;
  color: string;
  softColor: string;
  /** Título da etapa "Prepare o dispositivo" */
  turnOn: string;
  /** Prefixo do código impresso na etiqueta */
  codePrefix: string;
  codeExample: string;
  /** Tipos de dispositivo que este equipamento vincula ao pet */
  covers: DeviceType[];
};

export const SETUP_OPTIONS: SetupOption[] = [
  {
    kind: 'colar',
    label: 'Colar do pet',
    description: 'Atividade e rotina',
    icon: 'paw-outline',
    color: '#00857C',
    softColor: '#C8F0EC',
    turnOn: 'Ligue o colar',
    codePrefix: 'COLAR',
    codeExample: 'COLAR-1A2B3C',
    covers: ['colar'],
  },
  {
    kind: 'estacao',
    label: 'Estação de potes',
    description: 'Comida e água na mesma base',
    icon: 'restaurant-outline',
    color: '#E08E00',
    softColor: '#FFF0D5',
    turnOn: 'Ligue a estação',
    codePrefix: 'ESTACAO',
    codeExample: 'ESTACAO-1A2B3C',
    covers: ['comida', 'agua'],
  },
];

export const getSetupOption = (kind: SetupKind) =>
  SETUP_OPTIONS.find((option) => option.kind === kind) ?? SETUP_OPTIONS[0];

/** Código em maiúsculas e sem espaços. */
export const normalizeSetupCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, '');

/** Mesma regra do back-end: PREFIXO-<ID de 4 a 12 letras/números>. */
export function validateSetupCode(kind: SetupKind, raw: string): string | null {
  const code = normalizeSetupCode(raw);
  if (!code) return 'Informe o código do dispositivo.';

  const { codePrefix, codeExample } = getSetupOption(kind);
  if (!new RegExp(`^${codePrefix}-[A-Z0-9]{4,12}$`).test(code)) {
    return `O código começa com ${codePrefix}- e fica na etiqueta. Exemplo: ${codeExample}`;
  }
  return null;
}

/** ID do chip, a parte depois do prefixo (ESTACAO-1A2B3C -> 1A2B3C). */
export const setupIdFromCode = (code: string) => code.split('-').slice(1).join('-').toUpperCase();

/** Nome da rede Wi-Fi que o dispositivo abre para ser configurado (MEUPET-<ID>). */
export const portalNetworkName = (code: string) => `MEUPET-${setupIdFromCode(code) || 'XXXXXX'}`;

export type SetupStatus = 'free' | 'linked' | 'partial';

/** O pet já tem este equipamento? "partial" = só um dos potes (vinculado antes, avulso). */
export function getSetupStatus(kind: SetupKind, devices: { type: DeviceType }[]): SetupStatus {
  const { covers } = getSetupOption(kind);
  const linked = covers.filter((type) => devices.some((device) => device.type === type)).length;
  if (linked === 0) return 'free';
  return linked === covers.length ? 'linked' : 'partial';
}