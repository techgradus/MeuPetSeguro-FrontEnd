import { ImageSourcePropType } from 'react-native';

export type Species = 'Cachorro' | 'Gato';

export type Pet = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;      // anos
  weight: string;   // kg (formato pt-BR: "28,9")
  photo?: ImageSourcePropType;
  vaccines: { upToDate: number; pending: number };
  device?: { name: string; linked: boolean };
};

export type PetFormValues = Pick<Pet, 'name' | 'species' | 'breed' | 'age' | 'weight'>;
