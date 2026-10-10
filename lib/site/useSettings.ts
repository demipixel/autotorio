import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { coerce, fromQuery, isDefault, settingsUrl, Spec } from './settings';

// A tool's settings as React state. They come from the link when it carries
// any (a shared link), otherwise from the last visit, and are saved on every
// change. Statically exported pages render with the defaults first, so the
// real values arrive on mount; `ready` says when.
export function useSettings<V>(spec: Spec<V>, storageKey: string, path: string) {
  const [values, setValues] = useState<V>(spec.defaults);
  const [ready, setReady] = useState(false);

  // Reading the link and saved state needs the browser, and the built page
  // must first render with the defaults, so this cannot be initial state.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const linked = fromQuery(spec, window.location.search);
    if (linked) {
      setValues(linked);
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved?.values) setValues(coerce(spec, saved.values));
      } catch (e) {
        // unreadable storage just means starting from defaults
      }
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      const kept: { [key: string]: unknown } = { ...(values as unknown as { [key: string]: unknown }) };
      spec.transient?.forEach((key) => delete kept[key as string]);
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
      localStorage.setItem(storageKey, JSON.stringify({ ...saved, values: kept }));
    } catch (e) {
      // storage can be unavailable (private mode); settings just won't persist
    }
  }, [values, ready, spec, storageKey]);

  // every change goes through the spec's own clean-up, so settings that
  // depend on each other (a filter inserter needs Factorio 1.1) stay in step
  const tidy = useCallback((next: V) => (spec.fix ? spec.fix(next) : next), [spec]);

  const set = useCallback(
    <K extends keyof V>(key: K, value: V[K]) =>
      setValues((prev) => (prev[key] === value ? prev : tidy({ ...prev, [key]: value }))),
    [tidy],
  );

  const patch = useCallback(
    (changes: Partial<V>) => setValues((prev) => tidy({ ...prev, ...changes })),
    [tidy],
  );

  // back to defaults, keeping what the user pasted
  const reset = useCallback(
    () =>
      setValues((prev) => {
        const next = { ...spec.defaults };
        spec.transient?.forEach((key) => (next[key] = prev[key]));
        return next;
      }),
    [spec],
  );

  const shareUrl = useMemo(() => settingsUrl(spec, path, values), [spec, path, values]);
  const untouched = useMemo(() => isDefault(spec, values), [spec, values]);

  return { values, setValues, set, patch, reset, shareUrl, isDefault: untouched, ready };
}

// Clipboard write with a short-lived "copied" flag for button feedback.
export function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      if (!text) return false;
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // clipboard API blocked: fall back to a hidden textarea
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        const done = document.execCommand('copy');
        document.body.removeChild(el);
        if (!done) return false;
      }
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), timeout);
      return true;
    },
    [timeout],
  );

  return { copied, copy };
}
