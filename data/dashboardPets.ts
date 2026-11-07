import type { Pet as DashboardBase } from '@/data/pets';
import type { Pet } from '@/types/pet';

export type DashboardPet = DashboardBase;

export function toDashboardPet(pet: Pet): DashboardPet {
  const hasDevices = pet.devices.length > 0;

  return {
    id: pet.id,
    name: pet.name,
    type: pet.species,
    breed: pet.breed,
    emoji: pet.species === 'Gato' ? '🐱' : pet.species === 'Cachorro' ? '🐶' : '🐾',
    photo: pet.photo ?? null,
    online: pet.devices.some((d) => d.online),
    status: hasDevices ? 'Aguardando dados' : 'Sem dispositivos',
    message: [`${pet.name} está`, hasDevices ? 'aguardando dados' : 'sem dispositivos'],
    activity: 'Sem dados',
    activityTime: '',
    food: 0,
    water: 0,
    foodDescription: 'Sem dados',
    waterDescription: 'Sem dados',
    insight: `Ainda não há insights para ${pet.name}.`,
  };
}