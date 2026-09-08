import { decimalsFor, formatNumber, pickScale } from '@/core/format.ts';
import { invertRate } from '@/core/rates.ts';
import type { Calculation } from '@/core/types.ts';

const DASH = '—';

interface ResultViewProps {
  calc: Calculation | null;
  giveLabel: string;
  receiveLabel: string;
  amount: number | null;
  showAmount: boolean;
  hasFee: boolean;
}

function withUnit(text: string, label: string): string {
  return label === '' ? text : `${text} ${label}`;
}

/** Строка курса с подобранным масштабом: «1 000 ₫ = 3,46 ₽». */
function rateLine(rate: number, from: string, to: string): string {
  const scale = pickScale(rate);
  const left = withUnit(formatNumber(scale, 0), from);
  const right = withUnit(formatNumber(rate * scale), to);
  return `${left} = ${right}`;
}

function note(calc: Calculation | null, hasFee: boolean): { text: string; warning: boolean } | null {
  if (calc === null) return { text: 'Введите оба курса — и появится результат', warning: false };
  if (calc.feeExceedsAmount) return { text: 'Комиссия съедает всю сумму', warning: true };
  if (calc.fixedFeeIgnored) {
    return {
      text: 'Фиксированная комиссия зависит от суммы — введите сумму, чтобы увидеть реальный курс',
      warning: false,
    };
  }
  if (hasFee && calc.received !== null) {
    return { text: 'Курс с учётом комиссии для этой суммы', warning: false };
  }
  if (hasFee) return { text: 'Курс с учётом комиссии', warning: false };
  return null;
}

export function ResultView({
  calc,
  giveLabel,
  receiveLabel,
  amount,
  showAmount,
  hasFee,
}: ResultViewProps) {
  const reverse = calc === null ? null : invertRate(calc.rate);

  const forwardText = calc === null ? `${DASH} = ${DASH}` : rateLine(calc.rate, giveLabel, receiveLabel);
  const reverseText = reverse === null ? `${DASH} = ${DASH}` : rateLine(reverse, receiveLabel, giveLabel);

  const amountText =
    amount === null ? DASH : withUnit(formatNumber(amount, decimalsFor(amount)), giveLabel);
  const receivedText =
    calc === null || calc.received === null ? DASH : withUnit(formatNumber(calc.received), receiveLabel);

  const hint = note(calc, hasFee);

  return (
    <section className="result" aria-live="polite">
      {showAmount && (
        <p className="result__amount">
          <span>{amountText}</span>
          <span className="result__arrow" aria-hidden="true">
            →
          </span>
          <b className="result__amount-to">{receivedText}</b>
        </p>
      )}

      <div className={showAmount ? 'result__rates result__rates--divided' : 'result__rates'}>
        <p className={showAmount ? 'result__rate' : 'result__rate result__rate--lead'}>
          {forwardText}
        </p>
        <p className="result__rate">{reverseText}</p>
      </div>

      {hint !== null && (
        <p className={hint.warning ? 'result__note result__note--warning' : 'result__note'}>
          {hint.text}
        </p>
      )}
    </section>
  );
}
