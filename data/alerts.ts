/*
 * Tipos dos alertas. Os dados vêm do back-end (services/alertService.ts).
 * Os ícones e as cores de cada tipo ficam na tela (alertas.tsx).
 */

export type AlertKind =
  | 'vaccine-late'
  | 'vaccine-soon'
  | 'food'
  | 'water'
  | 'pattern'
  | 'device'
  | 'activity';

export type PetAlert = {
  id: string;
  petId: string;
  kind: AlertKind;
  title: string;
  description: string;
  time: string;
  read: boolean;
};
