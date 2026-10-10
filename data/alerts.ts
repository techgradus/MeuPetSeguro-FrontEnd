import type { PetId } from '@/data/pets';
 
/*
 * Dados mock dos alertas. Quando existir API/serviço, troque aqui.
 * Os ícones e as cores de cada tipo ficam na tela (alertas.tsx).
 */
 
export type AlertKind =
  | 'vaccine-late'
  | 'vaccine-soon'
  | 'water'
  | 'pattern'
  | 'camera'
  | 'meal'
  | 'activity';
 
export type PetAlert = {
  id: string;
  petId: PetId;
  kind: AlertKind;
  title: string;
  description: string;
  time: string;
  read: boolean;
};
 
export const alerts: PetAlert[] = [
  {
    id: '1',
    petId: 'Rex',
    kind: 'vaccine-late',
    title: 'Vacina atrasada',
    description: 'A dose de Giárdia venceu em 22 de agosto.',
    time: 'Hoje, 09:10',
    read: false,
  },
  {
    id: '2',
    petId: 'Mia',
    kind: 'vaccine-soon',
    title: 'Próxima dose em breve',
    description: 'A Leucemia Felina vence em 29 de setembro.',
    time: 'Hoje, 08:42',
    read: false,
  },
  {
    id: '3',
    petId: 'Rex',
    kind: 'water',
    title: 'Nível de água baixo',
    description: 'O pote da cozinha está com 18%.',
    time: 'Há 12 min',
    read: false,
  },
  {
    id: '4',
    petId: 'Rex',
    kind: 'pattern',
    title: 'Mudança no padrão',
    description: 'A atividade ficou 40% abaixo da média.',
    time: 'Há 1h',
    read: false,
  },
  {
    id: '5',
    petId: 'Mia',
    kind: 'camera',
    title: 'Câmera desconectada',
    description: 'Câmera do quarto está offline.',
    time: 'Há 3h',
    read: false,
  },
  {
    id: '6',
    petId: 'Mia',
    kind: 'meal',
    title: 'Horário da refeição',
    description: 'A refeição foi registrada normalmente às 08:14.',
    time: 'Hoje, 08:16',
    read: true,
  },
  {
    id: '7',
    petId: 'Rex',
    kind: 'activity',
    title: 'Pouca atividade',
    description: 'Repouso por mais de 4h.',
    time: 'Ontem, 17:42',
    read: true,
  },
];
 