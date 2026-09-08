import { describe, expect, it } from 'vitest';
import { applyCurrency, swapSides } from './state.ts';
import { EMPTY_STATE } from './types.ts';
import type { AppState } from './types.ts';

const FILLED: AppState = {
  ...EMPTY_STATE,
  give: '90',
  receive: '26000',
  giveCurrency: 'RUB',
  receiveCurrency: 'VND',
  amount: '500000',
  fee: '2',
  updatedAt: 1_756_000_000_000,
};

describe('applyCurrency', () => {
  it('замена одной валюты другой стирает её курс', () => {
    // 26 000 за доллар — это донги. Для бата число заведомо чужое.
    const next = applyCurrency(FILLED, 'receive', 'THB');
    expect(next.receiveCurrency).toBe('THB');
    expect(next.receive).toBe('');
  });

  it('второе плечо не трогает', () => {
    const next = applyCurrency(FILLED, 'receive', 'THB');
    expect(next.give).toBe('90');
    expect(next.giveCurrency).toBe('RUB');
  });

  it('подпись к безымянному курсу его сохраняет', () => {
    const unlabeled: AppState = { ...FILLED, giveCurrency: '' };
    const next = applyCurrency(unlabeled, 'give', 'RUB');
    expect(next.give).toBe('90');
    expect(next.giveCurrency).toBe('RUB');
  });

  it('снятие обозначения курс сохраняет', () => {
    const next = applyCurrency(FILLED, 'give', '');
    expect(next.give).toBe('90');
    expect(next.giveCurrency).toBe('');
  });

  it('повторный выбор той же валюты ничего не стирает', () => {
    const next = applyCurrency(FILLED, 'give', 'RUB');
    expect(next.give).toBe('90');
  });

  it('сумму и комиссию не трогает', () => {
    const next = applyCurrency(FILLED, 'give', 'THB');
    expect(next.amount).toBe('500000');
    expect(next.fee).toBe('2');
  });
});

describe('swapSides', () => {
  it('переставляет курсы и валюты', () => {
    const next = swapSides(FILLED);
    expect(next.give).toBe('26000');
    expect(next.receive).toBe('90');
    expect(next.giveCurrency).toBe('VND');
    expect(next.receiveCurrency).toBe('RUB');
  });

  it('сумму, комиссию и метку времени оставляет как есть', () => {
    const next = swapSides(FILLED);
    expect(next.amount).toBe('500000');
    expect(next.fee).toBe('2');
    expect(next.updatedAt).toBe(FILLED.updatedAt);
  });

  it('двойной своп возвращает исходное состояние', () => {
    expect(swapSides(swapSides(FILLED))).toEqual(FILLED);
  });
});
