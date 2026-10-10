import { useCallback, useEffect, useMemo, useState } from 'react';

import Blueprint from 'factorio-blueprint';

import { blueprintTool } from '../generators/blueprint-tool.generator';
import { ToolApi } from '../kit/controls';
import { Count } from '../preview/decode';

export type Pair = { from: string; to: string };

export type Values = {
  blueprint: string;
  flipX: boolean;
  flipY: boolean;
  landfillEntities: boolean;
  entityReplacer: Pair[];
  recipeReplacer: Pair[];
  moduleReplacer: Pair[];
  modifiedOnly: boolean;
};

const DEFAULTS: Values = {
  blueprint: '',
  flipX: false,
  flipY: false,
  landfillEntities: false,
  entityReplacer: [],
  recipeReplacer: [],
  moduleReplacer: [],
  modifiedOnly: false,
};

// 2.0.0 as the game stamps it into blueprints
const VERSION_2 = 562949953421312;

// Names that changed in Factorio 2.0. The pickers list items by their 1.1
// names (that is what the icons are called), so a 2.0 blueprint needs them
// translated on the way in.
const RENAMED: { [name: string]: string } = {
  'stack-inserter': 'bulk-inserter',
  'stack-filter-inserter': 'bulk-inserter',
  'filter-inserter': 'fast-inserter',
  'logistic-chest-active-provider': 'active-provider-chest',
  'logistic-chest-passive-provider': 'passive-provider-chest',
  'logistic-chest-storage': 'storage-chest',
  'logistic-chest-requester': 'requester-chest',
  'effectivity-module': 'efficiency-module',
  'effectivity-module-2': 'efficiency-module-2',
  'effectivity-module-3': 'efficiency-module-3',
};
const OLD_NAME: { [name: string]: string } = {};
Object.keys(RENAMED).forEach((old) => (OLD_NAME[RENAMED[old]] = OLD_NAME[RENAMED[old]] || old));

// entities whose icon file is named differently
const ICONS: { [name: string]: string } = { 'straight-rail': 'rail', 'legacy-straight-rail': 'rail' };

type Summary = { counts: Count[]; entities: number; blueprints: number; modern: boolean };

export type Result = {
  ok: boolean;
  error?: string;
  inputError?: string;
  output?: string;
  before?: Summary;
  after?: Summary;
};

// What is in a blueprint string (or a book of them), read from the raw data
// so blueprints from any game version can be counted.
function summarise(blueprint: string): Summary {
  const tally: { [name: string]: number } = {};
  const summary = { entities: 0, blueprints: 0, modern: false };
  const walk = (item: any) => {
    if (item?.blueprint) {
      summary.blueprints++;
      summary.modern = summary.modern || item.blueprint.version >= VERSION_2;
      (item.blueprint.entities || []).forEach((entity: { name: string }) => {
        tally[entity.name] = (tally[entity.name] || 0) + 1;
        summary.entities++;
      });
    }
    (item?.blueprint_book?.blueprints || []).forEach(walk);
  };
  walk(Blueprint.test(blueprint));
  if (!summary.blueprints) throw new Error('no blueprint inside');

  const counts = Object.keys(tally)
    .map((name) => ({ name, icon: ICONS[name] ?? OLD_NAME[name] ?? name, count: tally[name] }))
    .sort((a, b) => b.count - a.count);
  return { counts, ...summary };
}

function run(values: Values): Result {
  const input = values.blueprint.trim();
  if (!input) return { ok: false };

  let before: Summary;
  try {
    before = summarise(input);
  } catch (e) {
    const inputError = 'That does not look like a blueprint string.';
    return { ok: false, error: inputError, inputError };
  }

  // replacements are picked by 1.1 name; a 2.0 blueprint uses the new ones
  const named = (pairs: Pair[]) =>
    before.modern
      ? pairs.map(({ from, to }) => ({
          from: from.startsWith('includes:') ? from : RENAMED[from] ?? from,
          to: RENAMED[to] ?? to,
        }))
      : pairs;

  try {
    const output = blueprintTool({
      ...values,
      blueprint: input,
      entityReplacer: named(values.entityReplacer),
      recipeReplacer: named(values.recipeReplacer),
      moduleReplacer: named(values.moduleReplacer),
      // the game does these itself for 2.0 blueprints
      flipX: values.flipX && !before.modern,
      flipY: values.flipY && !before.modern,
      landfillEntities: values.landfillEntities && !before.modern,
    });
    return { ok: true, output, before, after: summarise(output) };
  } catch (e) {
    return { ok: false, before, error: e.message || 'Could not change this blueprint.' };
  }
}

// State of the blueprint tool page. The result is recomputed a moment after
// every change; books can be large, so typing does not wait for it.
export function useBlueprintTool() {
  const [values, setValues] = useState<Values>(DEFAULTS);
  const [result, setResult] = useState<Result>({ ok: false });

  useEffect(() => {
    const id = window.setTimeout(() => setResult(run(values)), 120);
    return () => window.clearTimeout(id);
  }, [values]);

  const set = useCallback(
    (key: string, value: unknown) => setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );
  const patch = useCallback(
    (changes: { [key: string]: unknown }) => setValues((prev) => ({ ...prev, ...changes })),
    [],
  );
  const reset = useCallback(
    () => setValues((prev) => ({ ...DEFAULTS, blueprint: prev.blueprint })),
    [],
  );

  const isDefault = useMemo(
    () =>
      !values.flipX &&
      !values.flipY &&
      !values.landfillEntities &&
      !values.modifiedOnly &&
      !values.entityReplacer.length &&
      !values.recipeReplacer.length &&
      !values.moduleReplacer.length,
    [values],
  );

  // the shape the shared controls expect
  const tool: ToolApi = {
    values,
    set,
    patch,
    reset,
    isDefault,
    shareUrl: '',
    outcome: {
      ok: result.ok,
      usable: result.ok,
      error: result.error,
      inputError: result.inputError,
      inputSource: 'paste',
      counts: result.after?.counts,
    },
    map: null,
    stale: false,
    ore: 'iron',
    output: () => result.output ?? '',
  };

  return { tool, values, set, result };
}
