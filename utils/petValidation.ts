export type PetFormErrors = Partial<Record<'name' | 'breed' | 'age' | 'weight', string>>;

const toNumber = (v: string) => Number(v.replace(',', '.'));

export function validatePetForm(v: {
  name: string;
  breed: string;
  age: string;
  weight: string;
}): PetFormErrors {
  const errors: PetFormErrors = {};
  if (!v.name.trim()) errors.name = 'Informe o nome do pet.';
  if (!v.breed.trim()) errors.breed = 'Informe a raça.';
  if (v.age === '' || isNaN(toNumber(v.age)) || toNumber(v.age) < 0) errors.age = 'Idade inválida.';
  if (v.weight === '' || isNaN(toNumber(v.weight)) || toNumber(v.weight) <= 0) errors.weight = 'Peso inválido.';
  return errors;
}
