import type { AppState, FeeKind } from './types.ts';
import { EMPTY_STATE } from './types.ts';

/** Ключи хеша. Почему хеш, а не localStorage, — PLAN.md, «Хранение». */
const KEYS = {
  give: 'g',
  receive: 'r',
  giveCurrency: 'gl',
  receiveCurrency: 'rl',
  amount: 'amt',
  fee: 'fee',
  feeKind: 'fk',
  updatedAt: 'ts',
} as const;

export function encodeState(state: AppState): string {
  const params = new URLSearchParams();

  if (state.give) params.set(KEYS.give, state.give);
  if (state.receive) params.set(KEYS.receive, state.receive);
  if (state.giveCurrency) params.set(KEYS.giveCurrency, state.giveCurrency);
  if (state.receiveCurrency) params.set(KEYS.receiveCurrency, state.receiveCurrency);
  if (state.amount) params.set(KEYS.amount, state.amount);
  if (state.fee) {
    params.set(KEYS.fee, state.fee);
    params.set(KEYS.feeKind, state.feeKind);
  }
  if (state.updatedAt !== null) params.set(KEYS.updatedAt, String(state.updatedAt));

  const query = params.toString();
  return query ? `#${query}` : '';
}

export function decodeState(hash: string): AppState {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const rawKind = params.get(KEYS.feeKind);
  const feeKind: FeeKind = rawKind === 'fixed' ? 'fixed' : 'percent';
  const rawTs = params.get(KEYS.updatedAt);
  const updatedAt = rawTs !== null && /^\d+$/.test(rawTs) ? Number(rawTs) : null;

  return {
    give: params.get(KEYS.give) ?? EMPTY_STATE.give,
    receive: params.get(KEYS.receive) ?? EMPTY_STATE.receive,
    giveCurrency: params.get(KEYS.giveCurrency) ?? EMPTY_STATE.giveCurrency,
    receiveCurrency: params.get(KEYS.receiveCurrency) ?? EMPTY_STATE.receiveCurrency,
    amount: params.get(KEYS.amount) ?? EMPTY_STATE.amount,
    fee: params.get(KEYS.fee) ?? EMPTY_STATE.fee,
    feeKind,
    updatedAt,
  };
}

/** Есть ли в хеше хоть что-то, ради чего его стоит разбирать. */
export function hashHasState(hash: string): boolean {
  return new URLSearchParams(hash.replace(/^#/, '')).size > 0;
}
