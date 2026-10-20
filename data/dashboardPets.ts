import { petIds, pets as samples, type Pet as DashboardBase, type PetId } from '@/data/pets';
import type { Pet } from '@/types/pet';


export type DashboardPet = DashboardBase & {
  /** Perfil de dados de exemplo usado para este pet (chave de data/pets.ts). */
  sample: PetId;
};

export function toDashboardPet(pet: Pet, index: number): DashboardPet {
  const sampleId = petIds[index % petIds.length];
  const sample = samples[sampleId];
  const withName = (text: string) => text.split(sample.name).join(pet.name);

  return {
    ...sample,
    id: pet.id,
    name: pet.name,
    type: pet.species,
    breed: pet.breed,
    emoji: pet.species === 'Gato' ? '🐱' : '🐶',
    photo: pet.photo ?? null,
    online: pet.devices.some((d) => d.online),
    message: sample.message.map(withName),
    insight: withName(sample.insight),
    sample: sampleId,
  };
}