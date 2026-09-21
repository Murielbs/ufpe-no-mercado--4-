import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { DependencyList, RefObject } from "react";

/** Chama onIdle depois de `ms` sem toque/tecla. Só corre quando `enabled`. */
export function useIdle(ms: number, onIdle: () => void, enabled: boolean) {
  const cb = useRef(onIdle);
  useEffect(() => {
    cb.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;
    let timer = window.setTimeout(() => cb.current(), ms);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => cb.current(), ms);
    };
    const events = ["pointerdown", "keydown", "input", "touchstart"] as const;
    events.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
  }, [ms, enabled]);
}

/**
 * Em telas grandes (totem/TV), se o conteúdo for mais alto que a tela,
 * reduz tudo proporcionalmente para não precisar de rolagem.
 * Em celulares a rolagem normal é mantida.
 */
export function useFitToScreen(ref: RefObject<HTMLElement>, deps: DependencyList, disabled = false) {
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.zoom = "";
    if (disabled || window.innerWidth < 700) return;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const available = window.innerHeight - 3 * rem;
    const needed = el.offsetHeight;
    if (needed > available) el.style.zoom = Math.max(0.55, available / needed).toFixed(3);
  }, [ref, disabled]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(fit, [fit, ...deps]);

  useEffect(() => {
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);
}
