import Blueprint from '../blueprintLibrary';

import { generateOreOutpost } from '../generators/ore-outpost.generator';
import { decode, OutpostMap, Outcome } from '../preview/decode';
import { laneCount, MIN_PATCH, needsBalancer, PatchSize, Values } from './model';

// Where the ore patch lies in the finished outpost. The generator lays its
// drills from one corner of the patch and may run past the far edges, then
// turns the layout to put the station on the side that was asked for; this
// follows that corner around.
function patchIn(drills: OutpostMap['ore'], patch: PatchSize, values: Values): OutpostMap['ore'] {
  if (!drills) return drills;
  const turns = (values.trainDirection + 2) % 4;
  const mirrored =
    values.trainSide === values.trainDirection + 1 || (values.trainSide === 0 && values.trainDirection === 3);
  // top left, top right, bottom right, bottom left
  const corner = (turns + (mirrored ? 1 : 0)) % 4;
  const atLeft = corner === 0 || corner === 3;
  const atTop = corner === 0 || corner === 1;
  return {
    x: atLeft ? drills.x : drills.x + drills.w - patch.w,
    y: atTop ? drills.y : drills.y + drills.h - patch.h,
    w: patch.w,
    h: patch.h,
  };
}

// Reads the patch rectangle out of a pasted "two walls" blueprint.
export function readPatch(blueprint: string): PatchSize {
  let bp: Blueprint;
  try {
    bp = new Blueprint(blueprint, { checkWithEntityData: false });
  } catch (e) {
    throw new Error('That does not look like a blueprint string.');
  }
  const ents = bp.entities;
  if (ents.length < 2) {
    throw new Error('Place two walls, one at each opposite corner of the patch.');
  }
  if (ents.some((e) => e.name !== 'stone_wall')) {
    throw new Error('The blueprint should contain only the two corner walls.');
  }
  const xs = ents.map((e) => e.position.x);
  const ys = ents.map((e) => e.position.y);
  const w = Math.max(...xs) - Math.min(...xs) + 1;
  const h = Math.max(...ys) - Math.min(...ys) + 1;
  if (w < MIN_PATCH - 1 || h < MIN_PATCH - 1) {
    throw new Error(`The patch must be at least ${MIN_PATCH} × ${MIN_PATCH} tiles.`);
  }
  return { w, h };
}

const patchCache: { [key: string]: string } = {};

// A wall blueprint for a patch of the given size, same as one made in game.
export function makePatch({ w, h }: PatchSize): string {
  const key = `${w}x${h}`;
  if (!patchCache[key]) {
    const bp = new Blueprint();
    bp.createEntity('stone_wall', { x: 0, y: 0 });
    bp.createEntity('stone_wall', { x: w - 1, y: h - 1 });
    patchCache[key] = bp.encode();
  }
  return patchCache[key];
}

function drillName(values: Values) {
  if (values.minerType === 'big') return 'big_mining_drill';
  return (values.minerType === 'custom' && values.miningDrillName) || 'electric_mining_drill';
}

// The wall blueprint to build from: the pasted one, or one of the manual size.
function inputOf(values: Values, manual: PatchSize) {
  const pasted = values.blueprint.trim();
  return pasted || makePatch(manual);
}

// Runs the real generator for the preview.
export function buildOutpost(values: Values, manual: PatchSize): Outcome {
  const pasted = values.blueprint.trim();
  let patch = manual;
  let inputSource: Outcome['inputSource'] = 'manual';

  if (pasted) {
    try {
      patch = readPatch(pasted);
      inputSource = 'paste';
    } catch (e) {
      return { ok: false, usable: false, errorScope: 'input', error: e.message, inputError: e.message, inputSource, patch };
    }
  }

  // a manual patch size makes a real, usable outpost too
  const base = { patch, inputSource, usable: true };

  if (needsBalancer(values)) {
    return {
      ok: false,
      errorScope: 'balancer',
      error: `There is no built-in ${laneCount(values)} lane balancer. Pick a different wagon count or paste your own balancer.`,
      ...base,
    };
  }

  try {
    const blueprint = generateOreOutpost({ ...values, blueprint: inputOf(values, manual), gameVersion: '1.1' });
    const train = values.includeTrainStation && {
      locomotives: values.locomotiveCount,
      wagons: values.cargoWagonCount,
      wagon: 'cargo-wagon' as const,
      doubleHeaded: !values.exitRoute,
    };
    const decoded = decode(blueprint, drillName(values), train || undefined);
    decoded.map.ore = patchIn(decoded.map.ore, patch, values);
    return { ok: true, ...decoded, ...base };
  } catch (e) {
    return {
      ok: false,
      errorScope: 'settings',
      error: e.message || 'Could not generate an outpost with these settings.',
      ...base,
    };
  }
}

// The blueprint string to hand to the user, in the game version they chose.
export function outpostString(values: Values, manual: PatchSize) {
  return generateOreOutpost({ ...values, blueprint: inputOf(values, manual) });
}
