/** Потолок масштаба: дальше «за 10 000 000» перестаёт читаться. */
export const MAX_SCALE = 1_000_000;

/** Наименьшая степень десяти, при которой значение перестаёт быть меньше 1. */
export function pickScale(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  let scale = 1;
  while (value * scale < 1 && scale < MAX_SCALE) scale *= 10;
  return scale;
}

/** Знаки после запятой — из порядка величины, без справочника валют. */
export function decimalsFor(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const abs = Math.abs(value);
  if (abs >= 1000) return 0;
  if (abs >= 1) return 2;
  return 4;
}

/** Форматирование по-русски: неразрывный пробел в разрядах, запятая в дробях. */
export function formatNumber(value: number, decimals = decimalsFor(value)): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Принимаем и точку, и запятую, игнорируем пробелы любого вида. */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  if (cleaned === '') return null;
  if (!/^\d*\.?\d*$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Эхо под полем: то же число с разрядами — проверить порядок величины. */
export function formatEcho(value: number): string {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 }).format(value);
}

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** Насколько давно введены курсы: «сегодня», «вчера», «5 дней назад». */
export function formatAge(updatedAt: number, now: number): string {
  const days = Math.floor((now - updatedAt) / 86_400_000);
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  return `${days} ${pluralRu(days, 'день', 'дня', 'дней')} назад`;
}
