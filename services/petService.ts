import { Pet, PetFormValues } from '@/types/pet';

/**
 * Camada de dados dos pets (MOCK).
 * Ao integrar o back-end, troque o corpo destas funções por chamadas à API.
 */
const MOCK_PETS: Pet[] = [
  {
    id: 'rex',
    name: 'Rex',
    species: 'Cachorro',
    breed: 'Golden Retriever',
    age: '4',
    weight: '28,9',
    photo: require('@/assets/images/pet-perfil.jpeg'),
    vaccines: { upToDate: 2, pending: 2 },
    device: { name: 'Colar MeuPet One', linked: true },
  },
  {
    id: 'mia',
    name: 'Mia',
    species: 'Gato',
    breed: 'SRD',
    age: '3',
    weight: '4,2',
    photo: require('@/assets/images/mia-perfil.jpeg'),
    vaccines: { upToDate: 3, pending: 0 },
    device: undefined,
  },
];

const fakeDelay = (ms = 700) => new Promise<void>((res) => setTimeout(res, ms));

export type NewPetInput = PetFormValues & { notes?: string; photoUri?: string };

export const petService = {
  async list(): Promise<Pet[]> {
    // TODO: GET /pets
    return MOCK_PETS.map((p) => ({ ...p }));
  },

  async update(id: string, values: PetFormValues): Promise<void> {
    // TODO: PUT /pets/:id
    await fakeDelay();
  },

  /** Cadastra um novo pet (sem dispositivo vinculado). */
  async add(input: NewPetInput): Promise<Pet> {
    // TODO: POST /pets
    await fakeDelay();
    const pet: Pet = {
      id: `pet-${Date.now()}`,
      name: input.name.trim(),
      species: input.species,
      breed: input.breed.trim(),
      age: input.age,
      weight: input.weight,
      notes: input.notes?.trim() || undefined,
      photo: input.photoUri ? { uri: input.photoUri } : undefined,
      vaccines: { upToDate: 0, pending: 0 },
      device: undefined,
    };
    MOCK_PETS.push(pet);
    return pet;
  },
};