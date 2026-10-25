import { validateEmail, validatePassword } from '@/utils/validators';
import { validatePetForm } from '@/utils/petValidation';

describe('validateEmail', () => {
  it('exige o e-mail', () => {
    expect(validateEmail('   ')).toBe('Informe seu e-mail.');
  });

  it.each(['ana', 'ana@', 'ana@site', 'ana @site.com'])('rejeita "%s"', (email) => {
    expect(validateEmail(email)).toBe('Digite um e-mail válido.');
  });

  it('aceita e-mail válido, ignorando espaços nas pontas', () => {
    expect(validateEmail('  ana@meupet.com.br ')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('exige a senha', () => {
    expect(validatePassword('')).toBe('Informe sua senha.');
  });

  it('exige ao menos 6 caracteres', () => {
    expect(validatePassword('12345')).toBe('A senha deve ter ao menos 6 caracteres.');
    expect(validatePassword('123456')).toBeNull();
  });
});

describe('validatePetForm', () => {
  const valid = { name: 'Rex', breed: 'Vira-lata', age: '3', weight: '12,5' };

  it('aceita um formulário válido (peso com vírgula)', () => {
    expect(validatePetForm(valid)).toEqual({});
  });

  it('aponta todos os campos inválidos de uma vez', () => {
    expect(validatePetForm({ name: ' ', breed: '', age: '-1', weight: '0' })).toEqual({
      name: 'Informe o nome do pet.',
      breed: 'Informe a raça.',
      age: 'Idade inválida.',
      weight: 'Peso inválido.',
    });
  });

  it('rejeita idade e peso que não são números', () => {
    const errors = validatePetForm({ ...valid, age: 'abc', weight: '' });
    expect(errors.age).toBe('Idade inválida.');
    expect(errors.weight).toBe('Peso inválido.');
  });
});
