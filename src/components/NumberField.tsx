import type { ReactNode } from 'react';
import { formatEcho, parseNumber } from '@/core/format.ts';

interface NumberFieldProps {
  id: string;
  caption: string;
  value: string;
  placeholder: string;
  onValueChange: (value: string) => void;
  /** Управление справа от числа: единица измерения или переключатель. */
  suffix?: ReactNode;
}

export function NumberField({
  id,
  caption,
  value,
  placeholder,
  onValueChange,
  suffix,
}: NumberFieldProps) {
  const parsed = parseNumber(value);
  const invalid = value.trim() !== '' && parsed === null;

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
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
        {suffix}
      </div>

      <div className="field__foot">
        {showEcho && <span className="field__echo">{echo}</span>}
      </div>
    </div>
  );
}
