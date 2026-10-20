import { ImageSourcePropType } from 'react-native';
import type { PetDevice } from '@/types/device';

export type Species = 'Cachorro' | 'Gato';

export type Pet = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;      // anos
  weight: string;   // kg (formato pt-BR: "28,9")
  notes?: string;
  photo?: ImageSourcePropType;
  vaccines: { upToDate: number; pending: number };
  devices: PetDevice[];
};

export type PetFormValues = Pick<Pet, 'name' | 'species' | 'breed' | 'age' | 'weight'>;
