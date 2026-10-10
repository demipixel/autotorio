import { directionForSide, Option, TILES, TURRETS, MODULES } from '../kit/options';
import { Spec } from '../site/settings';

// Settings of the ore outpost generator. Keys and value spellings match what
// the generator and existing settings links expect.

export type Values = {
  blueprint: string;
  modded: boolean;
  belt_type: 0 | 'fast' | 'express';
  undergroundBelts: boolean;
  compact: boolean;
  custom_belt_type: string;
  trainSide: number;
  trainDirection: number;
  minerSpace: number;
  minerType: 'standard' | 'big' | 'custom';
  minerSize: number;
  miningDrillName: string;
  module: string;
  customModule: string;
  useStackInserters: boolean;
  useFilterInserters: boolean;
  includeRadar: boolean;
  includeLights: boolean;
  balancer: string;
  botBased: boolean;
  requestItem: string;
  customRequestItem: string;
  requestAmount: number;
  roboports: boolean;
  turretType: 'none' | 'gun_turrets' | 'laser_turrets';
  turretSpacing: number;
  walls: boolean;
  wallThickness: number;
  wallSpace: number;
  includeTrainStation: boolean;
  exitRoute: boolean;
  doubleLoading: boolean;
  locomotiveCount: number;
  cargoWagonCount: number;
  concrete: 0 | string;
  customConcrete: string;
  borderConcrete: 0 | string;
  customBorderConcrete: string;
  trackConcrete: 0 | string;
  customTrackConcrete: string;
  gameVersion: '2.0' | '1.1';
};

export const DEFAULTS: Values = {
  blueprint: '',
  modded: false,
  belt_type: 'express',
  undergroundBelts: false,
  compact: false,
  custom_belt_type: '',
  trainSide: 1,
  trainDirection: 2,
  minerSpace: 1,
  minerType: 'standard',
  minerSize: 3,
  miningDrillName: '',
  module: 'None',
  customModule: '',
  useStackInserters: true,
  useFilterInserters: false,
  includeRadar: true,
  includeLights: true,
  balancer: '',
  botBased: false,
  requestItem: 'Iron Ore',
  customRequestItem: '',
  requestAmount: 4800,
  roboports: false,
  turretType: 'laser_turrets',
  turretSpacing: 8,
  walls: true,
  wallThickness: 1,
  wallSpace: 5,
  includeTrainStation: true,
  exitRoute: false,
  doubleLoading: false,
  locomotiveCount: 2,
  cargoWagonCount: 4,
  concrete: 0,
  customConcrete: '',
  borderConcrete: 0,
  customBorderConcrete: '',
  trackConcrete: 0,
  customTrackConcrete: '',
  gameVersion: '2.0',
};

// Size of the ore patch used when no wall blueprint has been pasted.
export type PatchSize = { w: number; h: number };
export const DEFAULT_PATCH: PatchSize = { w: 30, h: 22 };
export const MIN_PATCH = 5;
export const MAX_PATCH = 200;

export const BELTS: Option[] = [
  { value: 0, key: 'entities.transport_belt', label: 'Transport Belt', sub: '15/s', icon: 'transport-belt' },
  { value: 'fast', key: 'entities.fast_transport_belt', label: 'Fast Transport Belt', sub: '30/s', icon: 'fast-transport-belt' },
  { value: 'express', key: 'entities.express_transport_belt', label: 'Express Transport Belt', sub: '45/s', icon: 'express-transport-belt' },
];

// "Big" is Space Age's big mining drill, which covers 5x5 tiles.
export const MINERS: Option[] = [
  { value: 'standard', key: 'standard', label: 'Standard', sub: '3×3', icon: 'electric-mining-drill' },
  { value: 'big', key: 'big', label: 'Big', sub: '5×5', icon: 'electric-mining-drill' },
  { value: 'custom', key: 'custom', label: 'Custom', sub: 'Modded', subKey: 'modded' },
];

export const ORES: Option[] = [
  { value: 'Iron Ore', key: 'ui.iron_ore', label: 'Iron Ore', icon: 'iron-ore' },
  { value: 'Copper Ore', key: 'ui.copper_ore', label: 'Copper Ore', icon: 'copper-ore' },
  { value: 'Coal', key: 'ui.coal', label: 'Coal', icon: 'coal' },
  { value: 'Stone', key: 'ui.stone', label: 'Stone', icon: 'stone' },
  { value: 'Uranium Ore', key: 'ui.uranium_ore', label: 'Uranium Ore', icon: 'uranium-ore' },
];

// The inserters that load the train. Factorio 1.1 has filter inserters and
// calls the big one a stack inserter; 2.0 dropped filter inserters (every
// inserter can filter now) and renamed the stack inserter to bulk inserter.
type Inserter = Option<string> & { stack: boolean; filter: boolean };

const FAST: Inserter = { value: 'fast', key: 'ui.fast_inserter', label: 'Fast Inserter', icon: 'fast-inserter', stack: false, filter: false };

export const INSERTERS: { [gameVersion: string]: Inserter[] } = {
  '2.0': [
    FAST,
    { value: 'bulk', key: 'ui.bulk_inserter', label: 'Bulk Inserter', icon: 'stack-inserter', stack: true, filter: false },
  ],
  '1.1': [
    FAST,
    { value: 'filter', key: 'ui.filter_inserter', label: 'Filter Inserter', icon: 'filter-inserter', stack: false, filter: true },
    { value: 'stack', key: 'ui.stack_inserter', label: 'Stack Inserter', icon: 'stack-inserter', stack: true, filter: false },
    {
      value: 'stack_filter',
      key: 'ui.stack_filter_inserter',
      label: 'Stack Filter Inserter',
      icon: 'stack-filter-inserter',
      stack: true,
      filter: true,
    },
  ],
};

export function inserterOf(v: Values) {
  return INSERTERS[v.gameVersion].find((i) => i.stack === v.useStackInserters && i.filter === v.useFilterInserters);
}

// Belt balancers bundled with the generator, by lane count.
export const BUILTIN_BALANCERS = [1, 2, 4, 6, 8];

export function laneCount(v: Values) {
  return v.cargoWagonCount * (v.doubleLoading ? 2 : 1);
}

export function needsBalancer(v: Values) {
  return !v.botBased && !v.balancer.trim() && !BUILTIN_BALANCERS.includes(laneCount(v));
}

export const SPEC: Spec<Values> = {
  defaults: DEFAULTS,
  transient: ['blueprint'],
  zeroOrName: ['belt_type', 'concrete', 'borderConcrete', 'trackConcrete'],
  enums: {
    belt_type: BELTS.map((o) => o.value),
    minerType: MINERS.map((o) => o.value),
    module: MODULES.map((o) => o.value),
    requestItem: ORES.map((o) => o.value),
    turretType: TURRETS.map((o) => o.value),
    concrete: TILES.map((o) => o.value),
    borderConcrete: TILES.map((o) => o.value),
    trackConcrete: TILES.map((o) => o.value),
    trainSide: [0, 1, 2, 3],
    trainDirection: [0, 1, 2, 3],
    gameVersion: ['2.0', '1.1'],
  },
  fix: (v) => ({
    ...v,
    trainDirection: directionForSide(v.trainSide, v.trainDirection),
    // filter inserters only exist in Factorio 1.1: in 2.0 a filter inserter
    // becomes a fast one and a stack filter inserter a bulk one
    useFilterInserters: v.gameVersion === '1.1' && v.useFilterInserters,
  }),
};
