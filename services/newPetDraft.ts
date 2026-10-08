import { PetFormValues } from '@/types/pet';

/**
 * Rascunho do cadastro de novo pet, compartilhado entre as 4 etapas.
 * Fica só em memória; ao integrar o back-end pode virar um contexto ou store.
 */
export type NewPetDraft = PetFormValues & { notes: string; photoUri?: string };

const EMPTY: NewPetDraft = {
  name: '',
  species: 'Cachorro',
  breed: '',
  age: '',
  weight: '',
  notes: '',
  photoUri: undefined,
};

let draft: NewPetDraft = { ...EMPTY };

export const newPetDraft = {
  get: (): NewPetDraft => draft,
  set: (partial: Partial<NewPetDraft>) => {
    draft = { ...draft, ...partial };
  },
  reset: () => {
    draft = { ...EMPTY };
  },
};
