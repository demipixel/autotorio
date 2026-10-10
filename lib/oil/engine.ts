import Blueprint from '../blueprintLibrary';

import { generateOilOutpost } from '../generators/oil-outpost.generator';
import { decode, Outcome } from '../preview/decode';
import { Values } from './model';

// A small oil field to show the tool off before anything is pasted: seven
// pumpjacks and the single piece of track the generator aligns its rails to.
const SAMPLE_PUMPJACKS: [number, number, number][] = [
  [0, 0, 2],
  [10, 1, 4],
  [3, 9, 0],
  [15, 10, 6],
  [8, 17, 2],
  [20, 4, 4],
  [22, 16, 0],
];

let sample = '';

function sampleField() {
  if (!sample) {
    const bp = new Blueprint();
    SAMPLE_PUMPJACKS.forEach(([x, y, direction]) => bp.createEntity('pumpjack', { x, y }, direction));
    bp.createEntity('straight_rail', { x: 34, y: 8 }, 0);
    sample = bp.encode();
  }
  return sample;
}

// what the generator says when the pasted blueprint is the problem
const INPUT_ERRORS = /blueprint|pumpjack|track/i;

// Runs the real generator for the preview.
export function buildOilOutpost(values: Values): Outcome {
  const pasted = values.blueprint.trim();
  const base = { inputSource: pasted ? ('paste' as const) : ('sample' as const), usable: !!pasted };

  try {
    const blueprint = generateOilOutpost({
      ...values,
      blueprint: pasted || sampleField(),
      gameVersion: '1.1',
    });
    const train = values.includeTrainStation && {
      locomotives: values.locomotiveCount,
      wagons: values.wagonCount,
      wagon: 'fluid-wagon' as const,
      doubleHeaded: !values.exitRoute,
    };
    return {
      ok: true,
      ...decode(blueprint, (values.modded && values.pumpjackName) || 'pumpjack', train || undefined),
      ...base,
    };
  } catch (e) {
    const message = e.message || 'Could not generate an outpost with these settings.';
    if (pasted && INPUT_ERRORS.test(message)) {
      return { ok: false, errorScope: 'input', error: message, inputError: message, ...base, usable: false };
    }
    return { ok: false, errorScope: 'settings', error: message, ...base };
  }
}

// The blueprint string to hand to the user, in the game version they chose.
export function oilOutpostString(values: Values) {
  return generateOilOutpost({ ...values, blueprint: values.blueprint.trim() });
}
