import type { AppState } from './types.ts';

export type Side = 'give' | 'receive';

/**
 * Смена валюты на плече. Курс стирается только при замене одной валюты
 * на другую: приписать обозначение к уже введённому числу или убрать его —
 * не переобъявление, число остаётся.
 */
export function applyCurrency(state: AppState, side: Side, code: string): AppState {
  const currencyKey = side === 'give' ? 'giveCurrency' : 'receiveCurrency';
  const rateKey = side === 'give' ? 'give' : 'receive';

  const previous = state[currencyKey];
  const replacesAnother = previous !== '' && code !== '' && previous !== code;

  return {
    ...state,
    [currencyKey]: code,
    ...(replacesAnother ? { [rateKey]: '' } : {}),
  };
}

/** Меняет плечи местами. Сумма и комиссия намеренно не пересчитываются. */
export function swapSides(state: AppState): AppState {
  return {
    ...state,
    give: state.receive,
    receive: state.give,
    giveCurrency: state.receiveCurrency,
    receiveCurrency: state.giveCurrency,
  };
}
