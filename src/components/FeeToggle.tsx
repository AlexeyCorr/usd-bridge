import type { FeeKind } from '@/core/types.ts';

interface FeeToggleProps {
  value: FeeKind;
  onChange: (kind: FeeKind) => void;
}

const OPTIONS: { kind: FeeKind; title: string }[] = [
  { kind: 'percent', title: '%' },
  { kind: 'fixed', title: 'фикс' },
];

export function FeeToggle({ value, onChange }: FeeToggleProps) {
  return (
    <div className="toggle" role="group" aria-label="Вид комиссии">
      {OPTIONS.map(({ kind, title }) => (
        <button
          key={kind}
          type="button"
          className={
            kind === value ? 'toggle__button toggle__button--active' : 'toggle__button'
          }
          aria-pressed={kind === value}
          onClick={() => onChange(kind)}
        >
          {title}
        </button>
      ))}
    </div>
  );
}
