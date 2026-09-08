import { useCallback, useEffect, useState } from 'react';
import { EMPTY_STATE } from '@/core/types.ts';
import type { AppState } from '@/core/types.ts';
import { applyCurrency, swapSides } from '@/core/state.ts';
import type { Side } from '@/core/state.ts';
import { decodeState, encodeState, hashHasState } from '@/core/url.ts';

const STORAGE_KEY = 'usd-bridge:state';

/** Хеш — источник правды, localStorage — кэш на случай открытия без хеша. */
function readInitialState(): AppState {
  if (hashHasState(window.location.hash)) return decodeState(window.location.hash);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) return { ...EMPTY_STATE, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    // Приватный режим или битый JSON — начинаем с чистого листа.
  }

  return EMPTY_STATE;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(readInitialState);

  useEffect(() => {
    const hash = encodeState(state);
    // replaceState, а не location.hash: не засоряем историю на каждой цифре.
    window.history.replaceState(null, '', `${window.location.pathname}${hash}`);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Приватный режим — работаем без кэша, хеш всё равно на месте.
    }
  }, [state]);

  useEffect(() => {
    // Ссылку могли открыть в уже запущенном приложении — перезагрузки не будет.
    // Наш собственный replaceState события не порождает, цикла не выйдет.
    function onHashChange() {
      if (hashHasState(window.location.hash)) setState(decodeState(window.location.hash));
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const update = useCallback(<K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState((prev) => {
      const next: AppState = { ...prev, [key]: value };
      // Метку времени двигают только курсы — подпись отвечает за них.
      if (key === 'give' || key === 'receive') next.updatedAt = Date.now();
      return next;
    });
  }, []);

  const setCurrency = useCallback((side: Side, code: string) => {
    setState((prev) => applyCurrency(prev, side, code));
  }, []);

  const swap = useCallback(() => {
    setState(swapSides);
  }, []);

  return { state, update, setCurrency, swap };
}
