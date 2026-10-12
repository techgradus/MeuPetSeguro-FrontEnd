import { DeviceType } from '@/constants/deviceTypes';

/**
 * Rascunho do assistente "Novo dispositivo", compartilhado entre as 5 etapas.
 * Fica só em memória.
 */
export type DeviceFlowOrigin = 'meus-pets' | 'config';

export type NewDeviceDraft = {
  type?: DeviceType;
  ssid?: string;
  password: string;
  /** Tela que abriu o assistente (define a aba ativa e para onde voltar ao concluir). */
  origin?: DeviceFlowOrigin;
};

let draft: NewDeviceDraft = { password: '' };

export const newDeviceDraft = {
  get: (): NewDeviceDraft => draft,
  set: (partial: Partial<NewDeviceDraft>) => {
    draft = { ...draft, ...partial };
  },
  reset: () => {
    draft = { password: '' };
  },
};
