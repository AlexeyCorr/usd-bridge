import { listCurrencies, symbolOf } from '@/core/currencies.ts';

interface UnitSelectProps {
  /** Код ISO 4217 либо пустая строка — «без обозначения». */
  value: string;
  label: string;
  /** Что показать, пока валюта не выбрана. */
  placeholder: string;
  onChange: (code: string) => void;
}

/**
 * Селект нативный (штатное колесо iOS), но прозрачный: видимую подпись
 * рисует span, иначе в свёрнутом виде торчало бы «₽ · российский рубль».
 */
export function UnitSelect({ value, label, placeholder, onChange }: UnitSelectProps) {
  const { favourites, rest } = listCurrencies();

  const isKnown =
    value !== '' && [...favourites, ...rest].some((option) => option.code === value.toUpperCase());
  const chosen = value === '';

  return (
    <span className="unit">
      <span className={chosen ? 'unit__view unit__view--empty' : 'unit__view'} aria-hidden="true">
        {chosen ? placeholder : symbolOf(value)}
      </span>

      <select
        className="unit__select"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">без обозначения</option>

        {/* Значение из старой ссылки, которого нет в списке: без этой опции
            селект молча подменил бы его первым вариантом. */}
        {value !== '' && !isKnown && <option value={value}>{value}</option>}

        <optgroup label="Часто">
          {favourites.map((option) => (
            <option key={option.code} value={option.code}>
              {option.symbol} · {option.name}
            </option>
          ))}
        </optgroup>

        <optgroup label="Все валюты">
          {rest.map((option) => (
            <option key={option.code} value={option.code}>
              {option.symbol} · {option.name}
            </option>
          ))}
        </optgroup>
      </select>
    </span>
  );
}
