import type { SetupKind, SetupMode } from '@/constants/deviceSetup';
import type { PetDevice } from '@/types/device';

/**
 * Rascunho do assistente "Novo dispositivo", compartilhado entre as 5 etapas.
 * Fica só em memória.
 */
export type DeviceFlowOrigin = 'meus-pets' | 'config';

export type NewDeviceDraft = {
  petId?: string;
  kind?: SetupKind;
  mode?: SetupMode;
  deviceCode: string;
  /**
   * Preenchido quando o equipamento já foi vinculado ao pet (etapa "Preparar").
   * Evita vincular de novo se a pessoa voltar e avançar com o mesmo código.
   */
  registered?: { petId: string; kind: SetupKind; code: string; mode?: SetupMode; devices: PetDevice[] };
  /** Tela que abriu o assistente (define a aba ativa e para onde voltar ao concluir). */
  origin?: DeviceFlowOrigin;
};

const EMPTY: NewDeviceDraft = { deviceCode: '' };

let draft: NewDeviceDraft = { ...EMPTY };

export const newDeviceDraft = {
  get: (): NewDeviceDraft => draft,
  set: (partial: Partial<NewDeviceDraft>) => {
    draft = { ...draft, ...partial };
  },
  reset: () => {
    draft = { ...EMPTY };
  },
};
