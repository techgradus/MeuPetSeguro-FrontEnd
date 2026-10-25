import { brToIso, isoToBr, maskDate } from '@/utils/dateFormat';
import { formatAlertTime } from '@/utils/formatAlertTime';

describe('maskDate', () => {
  it.each([
    ['2', '2'],
    ['2209', '22/09'],
    ['22092026', '22/09/2026'],
    ['22/09/2026999', '22/09/2026'],
    ['ab22cd09', '22/09'],
  ])('"%s" vira "%s"', (input, expected) => {
    expect(maskDate(input)).toBe(expected);
  });
});

describe('brToIso / isoToBr', () => {
  it('converte nos dois sentidos', () => {
    expect(brToIso('22/09/2026')).toBe('2026-09-22');
    expect(isoToBr('2026-09-22')).toBe('22/09/2026');
  });

  it.each(['31/02/2026', '00/01/2026', '22/13/2026', '01/01/1980', '22-09-2026', '2/9/2026'])(
    'rejeita data inválida "%s"',
    (br) => {
      expect(brToIso(br)).toBeNull();
    },
  );

  it('aceita 29/02 em ano bissexto', () => {
    expect(brToIso('29/02/2028')).toBe('2028-02-29');
  });
});

describe('formatAlertTime', () => {
  const now = new Date(2026, 9, 25, 15, 0); // 25/10/2026 15:00
  const at = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).toISOString();

  it.each([
    [at(25, 15, 0), 'Agora'],
    [at(25, 14, 48), 'Há 12 min'],
    [at(25, 12, 0), 'Há 3h'],
    [at(25, 8, 5), 'Hoje, 08:05'],
    [at(24, 17, 42), 'Ontem, 17:42'],
    [at(22, 9, 10), '22/10, 09:10'],
  ])('%s -> "%s"', (iso, expected) => {
    expect(formatAlertTime(iso, now)).toBe(expected);
  });
});
