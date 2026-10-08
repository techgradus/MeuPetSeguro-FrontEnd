import { ImageSourcePropType } from 'react-native';

/*
 * Dados mock dos pets, usados por Início, Atividade e pelas
 * demais telas. Quando existir API/serviço, troque aqui.
 */

export type PetId = 'Rex' | 'Mia';

export type Pet = {
  id: PetId;
  name: string;
  type: string;
  breed: string;
  online: boolean;
  emoji: string;
  photo: ImageSourcePropType | null;
  status: string;
  message: string[];
  activity: string;
  activityTime: string;
  food: number;
  water: number;
  foodDescription: string;
  waterDescription: string;
  insight: string;
};

export const pets: Record<PetId, Pet> = {
  Rex: {
    id: 'Rex',
    name: 'Rex',
    type: 'Cachorro',
    breed: 'Golden Retriever',
    online: true,
    emoji: '🐶',
    photo: require('@/assets/images/pet-perfil.jpeg'),
    status: 'Tudo tranquilo',
    message: ['Rex está', 'descansando'],
    activity: 'Repouso',
    activityTime: 'há 13 minutos',
    food: 68,
    water: 42,
    foodDescription: 'Nível confortável',
    waterDescription: 'Repor em breve',
    insight: 'A rotina do Rex mudou essa semana',
  },
  Mia: {
    id: 'Mia',
    name: 'Mia',
    type: 'Gato',
    breed: 'Gato rajado',
    online: true,
    emoji: '🐱',
    photo: require('@/assets/images/mia-perfil.jpeg'),
    status: 'Tudo tranquilo',
    message: ['Mia está', 'explorando a', 'casa'],
    activity: 'Leve',
    activityTime: 'Ativa agora',
    food: 54,
    water: 76,
    foodDescription: 'Repor em breve',
    waterDescription: 'Nível confortável',
    insight: 'Mia está mais ativa no período da manhã',
  },
};

export const petIds = Object.keys(pets) as PetId[];

export function isPetId(value: unknown): value is PetId {
  return typeof value === 'string' && value in pets;
}