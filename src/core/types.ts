/** Как берётся комиссия: процентом от суммы или фиксированной суммой. */
export type FeeKind = 'percent' | 'fixed';

export interface Fee {
  kind: FeeKind;
  /** Для 'percent' — проценты (0..100). Для 'fixed' — единицы отдаваемой валюты. */
  value: number;
}

export interface CalcInput {
  /** Сколько единиц отдаваемой валюты за 1 $. */
  give: number;
  /** Сколько единиц получаемой валюты за 1 $. */
  receive: number;
  /** Сумма в отдаваемой валюте. null — не задана. */
  amount: number | null;
  fee: Fee | null;
}

export interface Calculation {
  /** Курс без комиссии: единиц получаемой валюты за 1 единицу отдаваемой. */
  nominalRate: number;
  /** Курс, который показываем пользователю. */
  rate: number;
  /** Фикс задан, но сумма — нет: учесть его в курсе невозможно. */
  fixedFeeIgnored: boolean;
  /** Сколько получим. null — сумма не задана либо комиссия съела её целиком. */
  received: number | null;
  /** Комиссия больше или равна сумме: обменивать нечего. */
  feeExceedsAmount: boolean;
}

/**
 * Состояние приложения в сырых строках: числа как напечатаны,
 * валюты — кодом ISO 4217 либо пустой строкой.
 */
export interface AppState {
  give: string;
  receive: string;
  giveCurrency: string;
  receiveCurrency: string;
  amount: string;
  fee: string;
  feeKind: FeeKind;
  /** Момент последней правки курсов, мс. */
  updatedAt: number | null;
}

export const EMPTY_STATE: AppState = {
  give: '',
  receive: '',
  giveCurrency: '',
  receiveCurrency: '',
  amount: '',
  fee: '',
  feeKind: 'percent',
  updatedAt: null,
};
