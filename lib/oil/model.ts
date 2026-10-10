import { BEACONS, directionForSide, MODULES, TILES, TURRETS, UNDERGROUND_PIPES } from '../kit/options';
import { Spec } from '../site/settings';

// Settings of the oil outpost generator. Keys and value spellings match what
// the generator and existing settings links expect.

export type Values = {
  blueprint: string;
  modded: boolean;
  pumpjackName: string;
  trainSide: number;
  trainDirection: number;
  module: string;
  customModule: string;
  includeRadar: boolean;
  includeLights: boolean;
  undergroundPipes: 'none' | 'long' | 'all';
  beacons: 'none' | 'few' | 'balanced' | 'max';
  turretType: 'none' | 'gun_turrets' | 'laser_turrets';
  turretSpacing: number;
  walls: boolean;
  wallThickness: number;
  wallSpace: number;
  includeTrainStation: boolean;
  exitRoute: boolean;
  locomotiveCount: number;
  wagonCount: number;
  tanks: number;
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
  pumpjackName: '',
  trainSide: 1,
  trainDirection: 2,
  module: 'None',
  customModule: '',
  includeRadar: true,
  includeLights: true,
  undergroundPipes: 'all',
  beacons: 'none',
  turretType: 'laser_turrets',
  turretSpacing: 8,
  walls: true,
  wallThickness: 1,
  wallSpace: 5,
  includeTrainStation: true,
  exitRoute: false,
  locomotiveCount: 1,
  wagonCount: 2,
  tanks: 2,
  concrete: 0,
  customConcrete: '',
  borderConcrete: 0,
  customBorderConcrete: '',
  trackConcrete: 0,
  customTrackConcrete: '',
  gameVersion: '2.0',
};

export const SPEC: Spec<Values> = {
  defaults: DEFAULTS,
  transient: ['blueprint'],
  zeroOrName: ['concrete', 'borderConcrete', 'trackConcrete'],
  enums: {
    module: MODULES.map((o) => o.value),
    undergroundPipes: UNDERGROUND_PIPES.map((o) => o.value),
    beacons: BEACONS.map((o) => o.value),
    turretType: TURRETS.map((o) => o.value),
    concrete: TILES.map((o) => o.value),
    borderConcrete: TILES.map((o) => o.value),
    trackConcrete: TILES.map((o) => o.value),
    trainSide: [0, 1, 2, 3],
    trainDirection: [0, 1, 2, 3],
    gameVersion: ['2.0', '1.1'],
  },
  // beacons used to be on or off
  upgrade: (raw) =>
    raw.beacons === true || raw.beacons === 'true'
      ? { ...raw, beacons: 'balanced' }
      : raw.beacons === false || raw.beacons === 'false'
      ? { ...raw, beacons: 'none' }
      : raw,
  fix: (v) => ({
    ...v,
    trainDirection: directionForSide(v.trainSide, v.trainDirection),
    locomotiveCount: Math.max(v.locomotiveCount, 1),
    wagonCount: Math.max(v.wagonCount, 1),
    tanks: Math.max(v.tanks, 1),
  }),
};
