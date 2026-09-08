import { describe, expect, it } from 'vitest';
import { decodeState, encodeState, hashHasState } from './url.ts';
import { EMPTY_STATE } from './types.ts';
import type { AppState } from './types.ts';

const FULL: AppState = {
  give: '90',
  receive: '26000',
  giveCurrency: '₽',
  receiveCurrency: '₫',
  amount: '500000',
  fee: '2',
  feeKind: 'percent',
  updatedAt: 1_756_000_000_000,
};

describe('encodeState / decodeState', () => {
  it('переживает полный круг', () => {
    expect(decodeState(encodeState(FULL))).toEqual(FULL);
  });

  it('переживает круг с фиксированной комиссией', () => {
    const fixed: AppState = { ...FULL, fee: '100', feeKind: 'fixed' };
    expect(decodeState(encodeState(fixed))).toEqual(fixed);
  });

  it('символы валют не ломаются при кодировании', () => {
    const hash = encodeState(FULL);
    expect(hash).not.toContain('₽');
    expect(decodeState(hash).giveCurrency).toBe('₽');
  });

  it('пустое состояние даёт пустой хеш', () => {
    expect(encodeState(EMPTY_STATE)).toBe('');
  });

  it('пустая комиссия не попадает в ссылку', () => {
    expect(encodeState({ ...FULL, fee: '' })).not.toContain('fee=');
  });
});

describe('decodeState — чужой или битый хеш', () => {
  it('пустой хеш даёт пустое состояние', () => {
    expect(decodeState('')).toEqual(EMPTY_STATE);
    expect(decodeState('#')).toEqual(EMPTY_STATE);
  });

  it('неизвестный вид комиссии откатывается к проценту', () => {
    expect(decodeState('#g=90&fk=нечто').feeKind).toBe('percent');
  });

  it('битая метка времени → null, а не NaN', () => {
    expect(decodeState('#g=90&ts=вчера').updatedAt).toBeNull();
    expect(decodeState('#g=90&ts=-5').updatedAt).toBeNull();
  });

  it('лишние ключи игнорируются', () => {
    expect(decodeState('#g=90&unknown=1').give).toBe('90');
  });
});

describe('hashHasState', () => {
  it('отличает пустой хеш от заполненного', () => {
    expect(hashHasState('')).toBe(false);
    expect(hashHasState('#')).toBe(false);
    expect(hashHasState('#g=90')).toBe(true);
  });
});
