import Blueprint from '../blueprintLibrary';

// Turns a generated blueprint string into plain data for the preview: what
// stands where, and how much of everything there is.
//
// factorio-blueprint reads the 1.1 blueprint format, so the preview always
// asks the generators for that; the string a user copies is made separately.

export type Kind =
  | 'drill'
  | 'pumpjack'
  | 'belt'
  | 'underground'
  | 'splitter'
  | 'inserter'
  | 'chest'
  | 'requester'
  | 'provider'
  | 'pipe'
  | 'pipeground'
  | 'tank'
  | 'pump'
  | 'beacon'
  | 'rail'
  | 'stop'
  | 'signal'
  | 'laser'
  | 'gun'
  | 'wall'
  | 'gate'
  | 'pole'
  | 'lamp'
  | 'radar'
  | 'roboport'
  | 'other';

export type MapEntity = {
  name: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  dir: number;
  // belt tier: 0 basic, 1 fast, 2 express, 3 anything else (modded)
  tier?: number;
  // underground belts: whether this end goes into or comes out of the ground
  io?: 'in' | 'out';
};

export type OutpostMap = {
  entities: MapEntity[];
  tiles: { name: string; x: number; y: number }[];
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  // where the ore is drawn: the mining drills' bounding box, unless a page
  // knows the patch itself
  ore: { x: number; y: number; w: number; h: number } | null;
  // a point that stays put when settings change: the middle of the drills or
  // pumpjacks, which sit on resources that do not move
  anchor: { x: number; y: number };
  // short texts written over the map, centred on a tile position
  labels: { x: number; y: number; text: string }[];
  // the train the station is built for, standing at the stop: the sprite of
  // each locomotive and wagon and the tile position of its middle
  train: { sprite: string; x: number; y: number }[];
};

// The train a station is laid out for.
export type Train = {
  locomotives: number;
  wagons: number;
  wagon: 'cargo-wagon' | 'fluid-wagon';
  // locomotives at both ends, for a station trains leave the way they came
  doubleHeaded: boolean;
};

export type Count = { name: string; icon: string; count: number };

export type Decoded = {
  map: OutpostMap;
  counts: Count[];
  // mining drills or pumpjacks
  machines: number;
  width: number;
  height: number;
};

// The result of running a generator for the preview.
export type Outcome = Partial<Decoded> & {
  ok: boolean;
  // where the problem is, so a page can point at the right control
  errorScope?: 'input' | 'balancer' | 'settings';
  error?: string;
  // false while the result only demonstrates the tool (built-in sample input)
  usable: boolean;
  inputSource: 'paste' | 'manual' | 'sample';
  // set when a pasted blueprint could not be used
  inputError?: string;
  // ore outposts: the patch the outpost is built for
  patch?: { w: number; h: number };
};

function classify(name: string, machine: string): [Kind, number?] {
  const tier = name.startsWith('express_')
    ? 2
    : name.startsWith('fast_')
    ? 1
    : name === 'transport_belt' || name === 'underground_belt' || name === 'splitter'
    ? 0
    : 3;
  if (name === 'pumpjack' || (machine && name === machine && machine.includes('pumpjack'))) return ['pumpjack'];
  if (name === machine || name.includes('mining_drill')) return ['drill'];
  if (name.endsWith('underground_belt')) return ['underground', tier];
  if (name.endsWith('transport_belt')) return ['belt', tier];
  if (name.endsWith('splitter')) return ['splitter', tier];
  if (name.includes('inserter')) return ['inserter'];
  if (name === 'logistic_chest_requester') return ['requester'];
  if (name === 'logistic_chest_passive_provider') return ['provider'];
  if (name.includes('chest')) return ['chest'];
  if (name === 'pipe') return ['pipe'];
  if (name === 'pipe_to_ground') return ['pipeground'];
  if (name === 'storage_tank') return ['tank'];
  if (name === 'pump') return ['pump'];
  if (name === 'beacon') return ['beacon'];
  if (name === 'straight_rail') return ['rail'];
  if (name === 'train_stop') return ['stop'];
  if (name.includes('signal')) return ['signal'];
  if (name === 'laser_turret') return ['laser'];
  if (name === 'gun_turret') return ['gun'];
  if (name === 'stone_wall') return ['wall'];
  if (name === 'gate') return ['gate'];
  if (name.includes('electric_pole')) return ['pole'];
  if (name === 'small_lamp') return ['lamp'];
  if (name === 'radar') return ['radar'];
  if (name === 'roboport') return ['roboport'];
  return ['other'];
}

// Speed a module adds to the machine it is in (Factorio 2.0)
const MODULE_SPEED: { [name: string]: number } = {
  speed_module: 0.2,
  speed_module_2: 0.3,
  speed_module_3: 0.5,
  productivity_module: -0.05,
  productivity_module_2: -0.1,
  productivity_module_3: -0.15,
};
const speedOf = (modules: { [name: string]: number } = {}) =>
  Object.keys(modules).reduce((sum, name) => sum + (MODULE_SPEED[name] || 0) * modules[name], 0);

// How much of a beacon's modules reaches a machine with n beacons on it
// (Factorio 2.0: 1.5 for the first, falling with the square root of n)
const BEACON_STRENGTH = 1.5;
const BEACON_REACH = 3;

// The speed bonus of every pumpjack, from its own modules and the beacons
// around it, as text for the map. Nothing is written when no pumpjack has
// one.
function speedLabels(bp: Blueprint, entities: MapEntity[]) {
  const beacons = bp.entities.filter((e) => e.name === 'beacon');
  const bonuses = bp.entities
    .map((e, i) => ({ e, ent: entities[i] }))
    .filter(({ ent }) => ent.kind === 'pumpjack')
    .map(({ e, ent }) => {
      const reaching = beacons.filter(
        (b) =>
          b.position.x - BEACON_REACH < ent.x + ent.w &&
          b.position.x + b.size.x + BEACON_REACH > ent.x &&
          b.position.y - BEACON_REACH < ent.y + ent.h &&
          b.position.y + b.size.y + BEACON_REACH > ent.y,
      );
      const fromBeacons = reaching.length
        ? (reaching.reduce((sum, b) => sum + speedOf(b.modules), 0) * BEACON_STRENGTH) / Math.sqrt(reaching.length)
        : 0;
      return { x: ent.x + ent.w / 2, y: ent.y + ent.h / 2, percent: Math.round((speedOf(e.modules) + fromBeacons) * 100) };
    });
  if (!bonuses.some((bonus) => bonus.percent)) return [];
  return bonuses.map(({ x, y, percent }) => ({ x, y, text: `${percent < 0 ? '−' : '+'}${Math.abs(percent)}%` }));
}

// Every locomotive and wagon takes 6 tiles of track with 1 between them.
const CAR_LENGTH = 6;
const CAR_PITCH = 7;

// Where the train stands when it has pulled up to the stop: its front level
// with the middle of the stop, the rest of it back along the track it
// arrived on. (Measured in Factorio 2.0 by driving a train into a stop.)
function trainAt(entities: MapEntity[], train: Train | undefined): OutpostMap['train'] {
  const stop = entities.find((e) => e.kind === 'stop');
  if (!stop || !train) return [];

  // a stop faces the way its trains are heading: 0 north, 2 east, 4 south, 6 west
  const heading = stop.dir;
  const vertical = heading % 4 === 0;
  const across = vertical ? 'x' : 'y';
  const along = vertical ? 'y' : 'x';
  // the track is the rail right beside the stop, on either side of it
  const rail = entities.find(
    (e) => e.kind === 'rail' && (e[across] === stop[across] - e.w || e[across] === stop[across] + stop.w),
  );
  if (!rail) return [];
  const line = rail[across] + rail.w / 2;
  const forward = heading === 0 || heading === 6 ? -1 : 1;
  const front = stop[along] + (vertical ? stop.h : stop.w) / 2;

  const locomotive = (direction: number) => `locomotive-${direction}`;
  const cars = [
    ...Array(train.locomotives).fill(locomotive(heading)),
    ...Array(train.wagons).fill(`${train.wagon}-${vertical ? 0 : 2}`),
    ...(train.doubleHeaded ? Array(train.locomotives).fill(locomotive((heading + 4) % 8)) : []),
  ];
  return cars.map((sprite: string, i) => {
    const middle = front - forward * (i * CAR_PITCH + CAR_LENGTH / 2);
    return vertical ? { sprite, x: line, y: middle } : { sprite, x: middle, y: line };
  });
}

const ICON_OVERRIDES: { [name: string]: string } = {
  straight_rail: 'rail',
  big_mining_drill: 'electric-mining-drill',
};

function iconFor(name: string) {
  return ICON_OVERRIDES[name] ?? name.split('_').join('-');
}

// `machine` is the internal name of the drill or pumpjack in use, for modded
// ones the generic rules would not recognise. `train` is the train to show
// at the station, if there is one.
export function decode(blueprint: string, machine = '', train?: Train): Decoded {
  const bp = new Blueprint(blueprint);
  const tally: { [name: string]: number } = {};
  const all = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const drills = { ...all };
  const resources = { ...all };
  let machines = 0;

  const grow = (box: typeof all, e: MapEntity) => {
    box.x0 = Math.min(box.x0, e.x);
    box.y0 = Math.min(box.y0, e.y);
    box.x1 = Math.max(box.x1, e.x + e.w);
    box.y1 = Math.max(box.y1, e.y + e.h);
  };

  const entities: MapEntity[] = bp.entities.map((e) => {
    const [kind, tier] = classify(e.name, machine);
    const ent: MapEntity = {
      name: e.name,
      kind,
      tier,
      x: e.position.x,
      y: e.position.y,
      w: e.size.x,
      h: e.size.y,
      dir: e.direction,
    };
    if (kind === 'underground') {
      ent.io = e.directionType === 'output' ? 'out' : 'in';
    }
    tally[e.name] = (tally[e.name] || 0) + 1;
    grow(all, ent);
    if (kind === 'drill' || kind === 'pumpjack') {
      machines++;
      grow(resources, ent);
      if (kind === 'drill') grow(drills, ent);
    }
    return ent;
  });

  const tiles = bp.tiles.map((t) => ({ name: t.name, x: t.position.x, y: t.position.y }));
  tiles.forEach((t) => grow(all, { ...t, w: 1, h: 1 } as MapEntity));

  const counts: Count[] = Object.keys(tally)
    .map((name) => ({ name, icon: iconFor(name), count: tally[name] }))
    .sort((a, b) => b.count - a.count);

  const middle = (box: typeof all) => ({ x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2 });

  return {
    map: {
      entities,
      tiles,
      ...all,
      ore: isFinite(drills.x0)
        ? { x: drills.x0, y: drills.y0, w: drills.x1 - drills.x0, h: drills.y1 - drills.y0 }
        : null,
      anchor: middle(machines ? resources : all),
      labels: speedLabels(bp, entities),
      train: trainAt(entities, train),
    },
    counts,
    machines,
    width: all.x1 - all.x0,
    height: all.y1 - all.y0,
  };
}
