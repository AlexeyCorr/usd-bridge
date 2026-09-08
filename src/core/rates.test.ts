import { describe, expect, it } from 'vitest';
import { calculate, crossRate, invertRate } from './rates.ts';

// Рубль: 90 за доллар. Донг: 26 000 за доллар.
const RUB = 90;
const VND = 26_000;

describe('crossRate', () => {
  it('считает через доллар в правильную сторону', () => {
    // Отдаём рубли, получаем донги → за 1 ₽ должно выйти ~289 ₫, а не 0,0035.
    expect(crossRate(RUB, VND)).toBeCloseTo(VND / RUB, 10);
    expect(crossRate(RUB, VND)).toBeCloseTo(288.89, 2);
  });

  it('в обратную сторону даёт обратное число', () => {
    expect(crossRate(VND, RUB)).toBeCloseTo(0.0034615, 7);
  });

  it('одинаковые валюты дают единицу', () => {
    expect(crossRate(RUB, RUB)).toBe(1);
  });

  it.each([
    ['нулевой курс отдаваемой', 0, VND],
    ['нулевой курс получаемой', RUB, 0],
    ['отрицательный', -90, VND],
    ['NaN', Number.NaN, VND],
    ['Infinity', Number.POSITIVE_INFINITY, VND],
  ])('%s → null, без NaN и Infinity наружу', (_name, give, receive) => {
    expect(crossRate(give, receive)).toBeNull();
  });
});

describe('invertRate', () => {
  it('переворачивает курс', () => {
    expect(invertRate(288.888)).toBeCloseTo(0.0034615, 7);
  });

  it('ноль и мусор → null', () => {
    expect(invertRate(0)).toBeNull();
    expect(invertRate(Number.NaN)).toBeNull();
  });
});

describe('calculate — без комиссии', () => {
  it('курс равен номинальному', () => {
    const result = calculate({ give: RUB, receive: VND, amount: null, fee: null });
    expect(result).not.toBeNull();
    expect(result!.rate).toBeCloseTo(VND / RUB, 10);
    expect(result!.nominalRate).toBeCloseTo(VND / RUB, 10);
    expect(result!.fixedFeeIgnored).toBe(false);
    expect(result!.received).toBeNull();
  });

  it('считает сумму', () => {
    // 1 000 ₽ по 288,888 ₫ за рубль.
    const result = calculate({ give: RUB, receive: VND, amount: 1000, fee: null });
    expect(result!.received).toBeCloseTo(1000 * (VND / RUB), 6);
  });

  it('невалидные курсы → null', () => {
    expect(calculate({ give: 0, receive: VND, amount: 100, fee: null })).toBeNull();
  });
});

describe('calculate — процентная комиссия', () => {
  it('меняет курс и не зависит от суммы', () => {
    const withoutAmount = calculate({
      give: RUB,
      receive: VND,
      amount: null,
      fee: { kind: 'percent', value: 2 },
    });
    const withAmount = calculate({
      give: RUB,
      receive: VND,
      amount: 5000,
      fee: { kind: 'percent', value: 2 },
    });

    expect(withoutAmount!.rate).toBeCloseTo((VND / RUB) * 0.98, 10);
    // Ключевое свойство процента: тот же курс при любой сумме.
    expect(withAmount!.rate).toBeCloseTo(withoutAmount!.rate, 10);
    expect(withoutAmount!.fixedFeeIgnored).toBe(false);
  });

  it('уменьшает полученную сумму', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: 1000,
      fee: { kind: 'percent', value: 2 },
    });
    expect(result!.received).toBeCloseTo(1000 * (VND / RUB) * 0.98, 6);
  });

  it('100 % и больше — менять нечего', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: 1000,
      fee: { kind: 'percent', value: 100 },
    });
    expect(result!.feeExceedsAmount).toBe(true);
    expect(result!.received).toBeNull();
  });
});

describe('calculate — фиксированная комиссия', () => {
  it('делает курс зависимым от суммы', () => {
    const small = calculate({
      give: RUB,
      receive: VND,
      amount: 1000,
      fee: { kind: 'fixed', value: 100 },
    });
    const large = calculate({
      give: RUB,
      receive: VND,
      amount: 10_000,
      fee: { kind: 'fixed', value: 100 },
    });

    // 100 ₽ фикса на 1 000 ₽ — это 10 %, на 10 000 ₽ — 1 %.
    expect(small!.rate).toBeCloseTo(260.0, 1);
    expect(large!.rate).toBeCloseTo(286.0, 1);
    expect(large!.rate).toBeGreaterThan(small!.rate);
  });

  it('вычитается из суммы до конвертации', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: 1000,
      fee: { kind: 'fixed', value: 100 },
    });
    // Меняем 900 ₽, а не 1 000 ₽.
    expect(result!.received).toBeCloseTo(260_000, 0);
  });

  it('без суммы фикс учесть невозможно — курс номинальный, флаг поднят', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: null,
      fee: { kind: 'fixed', value: 100 },
    });
    expect(result!.fixedFeeIgnored).toBe(true);
    expect(result!.rate).toBeCloseTo(result!.nominalRate, 10);
    expect(result!.received).toBeNull();
  });

  it('нулевая сумма ведёт себя как отсутствующая', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: 0,
      fee: { kind: 'fixed', value: 100 },
    });
    expect(result!.fixedFeeIgnored).toBe(true);
    expect(result!.feeExceedsAmount).toBe(false);
  });

  it('комиссия больше суммы — обменивать нечего', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: 50,
      fee: { kind: 'fixed', value: 100 },
    });
    expect(result!.feeExceedsAmount).toBe(true);
    expect(result!.received).toBeNull();
  });

  it('комиссия ровно равна сумме — тоже нечего', () => {
    const result = calculate({
      give: RUB,
      receive: VND,
      amount: 100,
      fee: { kind: 'fixed', value: 100 },
    });
    expect(result!.feeExceedsAmount).toBe(true);
  });
});
