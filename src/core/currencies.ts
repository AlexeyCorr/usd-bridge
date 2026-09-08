/** Список валют берётся из Intl: коды ISO 4217, русские названия и символы. */

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

/** Первая группа в списке — чтобы не крутить колесо до нужной валюты. */
export const FAVOURITE_CODES = [
  'RUB',
  'USD',
  'EUR',
  'VND',
  'THB',
  'TRY',
  'GEL',
  'RSD',
  'AMD',
  'KZT',
  'UZS',
  'AED',
];

const symbolCache = new Map<string, string>();

/**
 * Знак валюты по коду; если своего знака нет — сам код.
 * Всё, что не похоже на код ISO, возвращается как есть: старые ссылки
 * хранили прямо символ и должны продолжать работать.
 */
export function symbolOf(code: string): string {
  if (!/^[A-Za-z]{3}$/.test(code)) return code;

  const upper = code.toUpperCase();
  const cached = symbolCache.get(upper);
  if (cached !== undefined) return cached;

  let symbol = upper;
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: upper,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    symbol = parts.find((part) => part.type === 'currency')?.value ?? upper;
  } catch {
    // Неизвестный код — показываем как есть.
  }

  symbolCache.set(upper, symbol);
  return symbol;
}

function describe(code: string, names: Intl.DisplayNames): CurrencyOption {
  let name = code;
  try {
    name = names.of(code) ?? code;
  } catch {
    // Нет названия — обойдёмся кодом.
  }
  return { code, symbol: symbolOf(code), name };
}

let cachedList: { favourites: CurrencyOption[]; rest: CurrencyOption[] } | null = null;

export function listCurrencies(): { favourites: CurrencyOption[]; rest: CurrencyOption[] } {
  if (cachedList !== null) return cachedList;

  const names = new Intl.DisplayNames(['ru'], { type: 'currency' });

  let all: string[];
  try {
    all = Intl.supportedValuesOf('currency');
  } catch {
    // Старый движок без supportedValuesOf — хотя бы избранное.
    all = [...FAVOURITE_CODES];
  }

  const favouriteSet = new Set(FAVOURITE_CODES);

  cachedList = {
    favourites: FAVOURITE_CODES.map((code) => describe(code, names)),
    rest: all
      .filter((code) => !favouriteSet.has(code))
      .map((code) => describe(code, names))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
  };

  return cachedList;
}
