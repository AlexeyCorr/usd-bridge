import { useState } from 'react';
import { FeeToggle } from '@/components/FeeToggle.tsx';
import { NumberField } from '@/components/NumberField.tsx';
import { RateField } from '@/components/RateField.tsx';
import { ResultView } from '@/components/ResultView.tsx';
import { symbolOf } from '@/core/currencies.ts';
import { formatAge, parseNumber } from '@/core/format.ts';
import { calculate } from '@/core/rates.ts';
import type { Fee } from '@/core/types.ts';
import { useAppState } from '@/hooks/useAppState.ts';
import '@/styles/app.css';

type CopyStatus = 'idle' | 'copied' | 'failed';

/** Возраст курсов считаем отсюда: Date.now() в рендере запрещён компилятором. */
const OPENED_AT = Date.now();

export function App() {
  const { state, update, setCurrency, swap } = useAppState();
  const [extrasOpen, setExtrasOpen] = useState(() => state.amount !== '' || state.fee !== '');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  const give = parseNumber(state.give);
  const receive = parseNumber(state.receive);
  const amount = parseNumber(state.amount);
  const feeValue = parseNumber(state.fee);

  const fee: Fee | null =
    feeValue !== null && feeValue > 0 ? { kind: state.feeKind, value: feeValue } : null;

  const calc =
    give !== null && receive !== null ? calculate({ give, receive, amount, fee }) : null;

  const age =
    state.updatedAt !== null && (state.give !== '' || state.receive !== '')
      ? formatAge(state.updatedAt, OPENED_AT)
      : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
    window.setTimeout(() => setCopyStatus('idle'), 2500);
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">usd-bridge</h1>
        <p className="app__subtitle">Курс между валютами через доллар — по вашим курсам</p>
      </header>

      <section className="rates">
        <RateField
          id="give"
          caption="У меня"
          placeholder="90"
          currencyPlaceholder="₽"
          value={state.give}
          currency={state.giveCurrency}
          onValueChange={(value) => update('give', value)}
          onCurrencyChange={(code) => setCurrency('give', code)}
        />

        <div className="bridge">
          <span className="bridge__label">через доллар</span>
          <button
            type="button"
            className="bridge__swap"
            onClick={swap}
            aria-label="Поменять валюты местами"
            title="Поменять валюты местами"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M5 2.6v10.8M5 2.6 2.6 5M5 2.6 7.4 5M11 13.4V2.6M11 13.4 8.6 11M11 13.4l2.4-2.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <RateField
          id="receive"
          caption="Меняю на"
          placeholder="26000"
          currencyPlaceholder="₫"
          value={state.receive}
          currency={state.receiveCurrency}
          onValueChange={(value) => update('receive', value)}
          onCurrencyChange={(code) => setCurrency('receive', code)}
        />

        {age !== null && <p className="rates__age">Курсы введены {age}</p>}
      </section>

      <ResultView
        calc={calc}
        giveLabel={symbolOf(state.giveCurrency)}
        receiveLabel={symbolOf(state.receiveCurrency)}
        amount={amount}
        showAmount={state.amount !== ''}
        hasFee={fee !== null}
      />

      <details
        className="extras"
        open={extrasOpen}
        onToggle={(event) => setExtrasOpen(event.currentTarget.open)}
      >
        <summary className="extras__summary">Дополнительно</summary>

        <div className="extras__body">
          <NumberField
            id="amount"
            caption={state.giveCurrency === '' ? 'Сумма' : `Сумма, ${symbolOf(state.giveCurrency)}`}
            placeholder="500000"
            value={state.amount}
            onValueChange={(value) => update('amount', value)}
          />

          <NumberField
            id="fee"
            // Фикс — в отдаваемой валюте; у процента единица уже на кнопке.
            caption={
              state.feeKind === 'fixed' && state.giveCurrency !== ''
                ? `Комиссия, ${symbolOf(state.giveCurrency)}`
                : 'Комиссия'
            }
            placeholder="0"
            value={state.fee}
            onValueChange={(value) => update('fee', value)}
            suffix={
              <FeeToggle value={state.feeKind} onChange={(kind) => update('feeKind', kind)} />
            }
          />
        </div>
      </details>

      <div className="share">
        <button type="button" className="share__button" onClick={copyLink}>
          Скопировать ссылку
        </button>
        {copyStatus === 'copied' && <span className="share__status">Скопировано</span>}
        {copyStatus === 'failed' && <span className="share__status">Не вышло — скопируйте адрес</span>}
      </div>
    </main>
  );
}
