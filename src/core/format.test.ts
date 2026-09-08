import { describe, expect, it } from 'vitest';
import {
  decimalsFor,
  formatEcho,
  formatAge,
  formatNumber,
  MAX_SCALE,
  parseNumber,
  pickScale,
} from './format.ts';

/** Intl ставит неразрывные пробелы — для сравнения приводим к обычным. */
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('pickScale', () => {
  it('мелкий курс поднимает до читаемого', () => {
    // 1 ₫ = 0,00346 ₽ → показываем «1 000 ₫ = 3,46 ₽».
    expect(pickScale(0.0034615)).toBe(1000);
  });

  it('крупный курс оставляет за единицу', () => {
    expect(pickScale(288.888)).toBe(1);
  });

  it.each([
    [1, 1],
    [0.9, 10],
    [0.1, 10],
    [0.09, 100],
  ])('%s → масштаб %s', (value, expected) => {
    expect(pickScale(value)).toBe(expected);
  });

  it('не разгоняется выше потолка', () => {
    expect(pickScale(1e-12)).toBe(MAX_SCALE);
  });

  it('мусор не ломает', () => {
    expect(pickScale(0)).toBe(1);
    expect(pickScale(Number.NaN)).toBe(1);
  });
});

describe('decimalsFor', () => {
  it.each([
    [1000, 0],
    [999.99, 2],
    [1, 2],
    [0.999, 4],
    [0.0034615, 4],
  ])('%s → %s знаков', (value, expected) => {
    expect(decimalsFor(value)).toBe(expected);
  });
});

describe('formatNumber', () => {
  it('разряды и запятая по-русски', () => {
    expect(plain(formatNumber(26000))).toBe('26 000');
    expect(plain(formatNumber(3.4615))).toBe('3,46');
  });

  it('нечисло не показывает как NaN', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('parseNumber', () => {
  it.each([
    ['90', 90],
    ['26400', 26400],
    ['3,46', 3.46],
    ['3.46', 3.46],
    ['26 400', 26400],
    ['0.0034', 0.0034],
  ])('%s → %s', (raw, expected) => {
    expect(parseNumber(raw)).toBe(expected);
  });

  it.each([['', null], ['абв', null], ['90.5.2', null], ['-90', null], ['9e5', null]])(
    '%s → null',
    (raw, expected) => {
      expect(parseNumber(raw)).toBe(expected);
    },
  );
});

describe('formatAge', () => {
  const day = 86_400_000;
  const now = 10 * day;

  it.each([
    [now, 'сегодня'],
    [now - day, 'вчера'],
    [now - 2 * day, '2 дня назад'],
    [now - 5 * day, '5 дней назад'],
  ])('%s → %s', (updatedAt, expected) => {
    expect(formatAge(updatedAt, now)).toBe(expected);
  });

  it('склоняет по-русски', () => {
    const base = 400 * day;
    expect(formatAge(base - 11 * day, base)).toBe('11 дней назад');
    expect(formatAge(base - 21 * day, base)).toBe('21 день назад');
    expect(formatAge(base - 22 * day, base)).toBe('22 дня назад');
  });
});

describe('formatEcho', () => {
  it('расставляет разряды, не навязывая дробную часть', () => {
    expect(plain(formatEcho(26400))).toBe('26 400');
    expect(plain(formatEcho(90))).toBe('90');
  });

  it('дробную часть сохраняет как есть', () => {
    expect(plain(formatEcho(3.46))).toBe('3,46');
  });

  it('нечисло даёт пустую строку — эхо просто не показываем', () => {
    expect(formatEcho(Number.NaN)).toBe('');
  });
});
