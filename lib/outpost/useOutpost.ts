import { useCallback, useEffect, useMemo, useState } from 'react';

import { directionForSide } from '../kit/options';
import { Outcome } from '../preview/decode';
import { oreKey } from '../preview/render';
import { useSettings } from '../site/useSettings';
import { buildOutpost, outpostString } from './engine';
import { DEFAULT_PATCH, MAX_PATCH, MIN_PATCH, PatchSize, SPEC, Values } from './model';

const STORAGE_KEY = 'autotorio:outpost:v1';

export type OutpostApi = ReturnType<typeof useOutpost>;

// State of the ore outpost page: the settings, the manual patch size, and
// the outpost generated from them for the preview.
export function useOutpost() {
  const settings = useSettings<Values>(SPEC, STORAGE_KEY, '/outpost');
  const { values, setValues, ready } = settings;
  const [manual, setManualState] = useState<PatchSize>(DEFAULT_PATCH);
  // the patch size is not a setting (it describes one ore patch), so links
  // leave it out, but it is remembered between visits
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.manual) setManualState(clampPatch(saved.manual));
    } catch (e) {
      // unreadable storage just means the default size
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, manual }));
    } catch (e) {
      // storage can be unavailable (private mode)
    }
  }, [manual, ready]);

  // Regenerated on every change. The generator takes a few milliseconds, so
  // there is no need to debounce or move it off the main thread.
  const outcome = useMemo<Outcome | null>(
    () => (ready ? buildOutpost(values, manual) : null),
    [values, manual, ready],
  );

  const setSide = useCallback(
    (side: number) =>
      setValues((prev) => ({
        ...prev,
        trainSide: side,
        trainDirection: directionForSide(side, prev.trainDirection),
      })),
    [setValues],
  );

  const setManual = useCallback(
    (changes: Partial<PatchSize>) => setManualState((prev) => clampPatch({ ...prev, ...changes })),
    [],
  );

  const resetSettings = settings.reset;
  const reset = useCallback(() => {
    resetSettings();
    setManualState(DEFAULT_PATCH);
  }, [resetSettings]);

  return {
    ...settings,
    reset,
    setSide,
    manual,
    setManual,
    outcome,
    // what to draw; the preview keeps showing the last outpost while this is empty
    map: outcome?.map ?? null,
    stale: !!outcome && !outcome.ok,
    // ore shown under the drills; only bot based outposts name an ore
    ore: oreKey(values.botBased ? values.requestItem : 'Iron Ore'),
    // the blueprint string to copy
    output: () => outpostString(values, manual),
  };
}

function clampPatch(size: PatchSize): PatchSize {
  const fix = (n: number, fallback: number) => {
    const num = Math.round(Number(n));
    if (!isFinite(num)) return fallback;
    return Math.min(Math.max(num, MIN_PATCH), MAX_PATCH);
  };
  return { w: fix(size.w, DEFAULT_PATCH.w), h: fix(size.h, DEFAULT_PATCH.h) };
}
