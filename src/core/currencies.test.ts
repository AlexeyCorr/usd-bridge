import { describe, expect, it } from 'vitest';
import { FAVOURITE_CODES, listCurrencies, symbolOf } from './currencies.ts';

describe('symbolOf', () => {
  it.each([
    ['RUB', '₽'],
    ['USD', '$'],
    ['VND', '₫'],
    ['THB', '฿'],
    ['GEL', '₾'],
  ])('%s → %s', (code, expected) => {
    expect(symbolOf(code)).toBe(expected);
  });

  it('валюты без своего знака подписываются кодом', () => {
    expect(symbolOf('RSD')).toBe('RSD');
    expect(symbolOf('UZS')).toBe('UZS');
  });

  it('пустое значение остаётся пустым — «без обозначения»', () => {
    expect(symbolOf('')).toBe('');
  });

  it('готовый символ из старой ссылки возвращается как есть', () => {
    expect(symbolOf('₽')).toBe('₽');
    expect(symbolOf('₫')).toBe('₫');
  });

  it('несуществующий код не роняет расчёт', () => {
    expect(() => symbolOf('ZZZ')).not.toThrow();
    expect(symbolOf('ZZZ')).toBe('ZZZ');
  });

  it('регистр не важен', () => {
    expect(symbolOf('rub')).toBe('₽');
  });
});

describe('listCurrencies', () => {
  const { favourites, rest } = listCurrencies();

  it('избранное идёт в заданном порядке', () => {
    expect(favourites.map((c) => c.code)).toEqual(FAVOURITE_CODES);
  });

  it('избранное не дублируется в остальных', () => {
    const codes = new Set(rest.map((c) => c.code));
    for (const code of FAVOURITE_CODES) expect(codes.has(code)).toBe(false);
  });

  it('у каждой валюты есть название и подпись', () => {
    for (const option of [...favourites, ...rest]) {
      expect(option.name).not.toBe('');
      expect(option.symbol).not.toBe('');
    }
  });

  it('список покрывает весь ISO 4217', () => {
    expect(favourites.length + rest.length).toBeGreaterThan(150);
  });
});
