import type { CalcInput, Calculation } from './types.ts';

/**
 * Кросс-курс через доллар: обе стороны заданы единицами за 1 $, поэтому
 * доллар сокращается — (единиц B за $) / (единиц A за $) = единиц B за 1 A.
 */
export function crossRate(give: number, receive: number): number | null {
  if (!Number.isFinite(give) || !Number.isFinite(receive)) return null;
  if (give <= 0 || receive <= 0) return null;
  return receive / give;
}

/** Обратный курс: сколько единиц отдаваемой валюты за 1 единицу получаемой. */
export function invertRate(rate: number): number | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return 1 / rate;
}

/**
 * Полный расчёт с комиссией. Процент меняет сам курс и от суммы не зависит;
 * фикс зависит, поэтому при нём курс — функция от суммы.
 */
export function calculate({ give, receive, amount, fee }: CalcInput): Calculation | null {
  const nominalRate = crossRate(give, receive);
  if (nominalRate === null) return null;

  const percent = fee?.kind === 'percent' && Number.isFinite(fee.value) ? fee.value : 0;
  const fixed = fee?.kind === 'fixed' && Number.isFinite(fee.value) ? fee.value : 0;

  const percentFactor = 1 - percent / 100;
  const rateAfterPercent = nominalRate * percentFactor;

  // Процент 100 и больше: не «курс 0», а «нечего менять».
  if (percentFactor <= 0) {
    return {
      nominalRate,
      rate: nominalRate,
      fixedFeeIgnored: false,
      received: null,
      feeExceedsAmount: true,
    };
  }

  const hasAmount = amount !== null && Number.isFinite(amount) && amount > 0;

  if (!hasAmount) {
    return {
      nominalRate,
      rate: rateAfterPercent,
      fixedFeeIgnored: fixed > 0,
      received: null,
      feeExceedsAmount: false,
    };
  }

  if (fixed >= amount) {
    return {
      nominalRate,
      rate: rateAfterPercent,
      fixedFeeIgnored: true,
      received: null,
      feeExceedsAmount: true,
    };
  }

  const received = (amount - fixed) * rateAfterPercent;

  return {
    nominalRate,
    rate: received / amount,
    fixedFeeIgnored: false,
    received,
    feeExceedsAmount: false,
  };
}
