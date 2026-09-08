import { UnitSelect } from '@/components/UnitSelect.tsx';
import { formatEcho, parseNumber } from '@/core/format.ts';

interface RateFieldProps {
  id: string;
  caption: string;
  value: string;
  placeholder: string;
  currencyPlaceholder: string;
  /** Код ISO 4217 либо пустая строка. */
  currency: string;
  onValueChange: (value: string) => void;
  onCurrencyChange: (code: string) => void;
}

export function RateField({
  id,
  caption,
  value,
  placeholder,
  currencyPlaceholder,
  currency,
  onValueChange,
  onCurrencyChange,
}: RateFieldProps) {
  const parsed = parseNumber(value);
  const invalid = value.trim() !== '' && parsed === null;

  // Эхо показываем, только если оно отличается от набранного.
  const echo = parsed === null ? '' : formatEcho(parsed);
  const showEcho = echo !== '' && echo !== value;

  return (
    <div className="field">
      <label className="field__caption" htmlFor={id}>
        {caption}
      </label>

      <div className={invalid ? 'field__row field__row--invalid' : 'field__row'}>
        <input
          id={id}
          className="field__value"
          // decimal, а не number: у type="number" плохая клавиатура на iOS
          // и он молча съедает невалидный ввод.
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          aria-label={`${caption}: сколько единиц валюты за один доллар`}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />

        <UnitSelect
          value={currency}
          label={`${caption}: валюта`}
          placeholder={currencyPlaceholder}
          onChange={onCurrencyChange}
        />

        <span className="field__per">за 1 $</span>
      </div>

      <div className="field__foot">
        {showEcho && <span className="field__echo">{echo}</span>}
      </div>
    </div>
  );
}
