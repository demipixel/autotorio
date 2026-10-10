import { useCallback, useMemo } from 'react';

import { directionForSide } from '../kit/options';
import { Outcome } from '../preview/decode';
import { useSettings } from '../site/useSettings';
import { buildOilOutpost, oilOutpostString } from './engine';
import { SPEC, Values } from './model';

// State of the oil outpost page: the settings and the outpost generated from
// them for the preview.
export function useOil() {
  const settings = useSettings<Values>(SPEC, 'autotorio:oil:v1', '/oil');
  const { values, setValues, ready } = settings;
  const outcome = useMemo<Outcome | null>(
    () => (ready ? buildOilOutpost(values) : null),
    [values, ready],
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

  return {
    ...settings,
    setSide,
    outcome,
    // the preview keeps showing the last outpost while this is empty
    map: outcome?.map ?? null,
    stale: !!outcome && !outcome.ok,
    ore: 'iron',
    output: () => oilOutpostString(values),
  };
}
