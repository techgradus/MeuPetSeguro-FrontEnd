import { api, fileUrl } from '@/services/api';
import { type ApiDevice, deviceFromApi } from '@/services/deviceService';
import { Pet, PetFormValues, Species } from '@/types/pet';
import { appendPhoto } from '@/utils/appendPhoto';

type ApiPet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  weightKg: number | null;
  notes: string | null;
  photoUrl: string | null;
  devices?: ApiDevice[];
};

export type NewPetInput = PetFormValues & { notes?: string; photoUri?: string };

export type PetEditValues = PetFormValues & { notes?: string };

const UPLOAD_TIMEOUT_MS = 30000;

const toNumber = (v: string) => Number(v.replace(',', '.'));

function ageFromBirthDate(iso: string | null): string {
  if (!iso) return '';
  const birth = new Date(iso);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years -= 1;
  return String(Math.max(0, years));
}

function birthDateFromAge(age: string): string | undefined {
  const years = toNumber(age);
  if (age === '' || isNaN(years) || years < 0) return undefined;
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString();
}

function fromApi(p: ApiPet): Pet {
  return {
    id: p.id,
    name: p.name,
    species: (p.species === 'Gato' ? 'Gato' : 'Cachorro') as Species,
    breed: p.breed ?? '',
    age: ageFromBirthDate(p.birthDate),
    weight: p.weightKg == null ? '' : String(p.weightKg).replace('.', ','),
    notes: p.notes ?? undefined,
    photo: p.photoUrl ? { uri: fileUrl(p.photoUrl) } : undefined,
    vaccines: { upToDate: 0, pending: 0 },
    devices: (p.devices ?? []).map(deviceFromApi),
  };
}

type PetFields = {
  name?: string;
  species?: Species;
  breed?: string;
  birthDate?: string;
  weight?: string;
  notes?: string;
  photoUri?: string;
};

async function buildForm(f: PetFields): Promise<FormData> {
  const form = new FormData();
  if (f.name?.trim()) form.append('name', f.name.trim());
  if (f.species) form.append('species', f.species);
  if (f.breed?.trim()) form.append('breed', f.breed.trim());
  if (f.birthDate) form.append('birthDate', f.birthDate);
  if (f.weight && toNumber(f.weight) > 0) form.append('weightKg', String(toNumber(f.weight)));
  if (f.notes !== undefined) form.append('notes', f.notes.trim());
  if (f.photoUri) await appendPhoto(form, f.photoUri);
  return form;
}

export const petService = {
  async list(): Promise<Pet[]> {
    const pets = await api<ApiPet[]>('/pets', { auth: true });
    return pets.map(fromApi).reverse();
  },

  /** Cadastra um novo pet (sem dispositivo vinculado). */
  async add(input: NewPetInput): Promise<Pet> {
    const form = await buildForm({
      name: input.name,
      species: input.species,
      breed: input.breed,
      birthDate: birthDateFromAge(input.age),
      weight: input.weight,
      notes: input.notes?.trim() || undefined,
      photoUri: input.photoUri,
    });
    const pet = await api<ApiPet>('/pets', {
      method: 'POST',
      body: form,
      auth: true,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
    return fromApi(pet);
  },

  async update(current: Pet, values: PetEditValues): Promise<Pet> {
    const form = await buildForm({
      name: values.name,
      species: values.species,
      breed: values.breed,
      birthDate: values.age !== current.age ? birthDateFromAge(values.age) : undefined,
      weight: values.weight,
      notes: values.notes ?? '',
    });
    const pet = await api<ApiPet>(`/pets/${current.id}`, { method: 'PUT', body: form, auth: true });
    return fromApi(pet);
  },

  async updatePhoto(id: string, photoUri: string): Promise<Pet> {
    const form = await buildForm({ photoUri });
    const pet = await api<ApiPet>(`/pets/${id}`, {
      method: 'PUT',
      body: form,
      auth: true,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
    return fromApi(pet);
  },

  async remove(id: string): Promise<void> {
    await api(`/pets/${id}`, { method: 'DELETE', auth: true });
  },
};