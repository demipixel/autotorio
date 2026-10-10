// Choices shared by the outpost pages. Values are spelled the way the
// generators and existing settings links expect them.

export type Option<T = string | number> = {
  value: T;
  // localisation key, with an English fallback and an optional suffix
  key?: string;
  label: string;
  suffix?: string;
  sub?: string;
  subKey?: string;
  icon?: string;
};

export const icon = (name: string) => `/img/factorio-icons/${name}.png`;

const moduleFamily = (name: string, key: string, slug: string): Option[] =>
  [1, 2, 3].map((tier) => ({
    value: tier === 1 ? name : `${name} ${tier}`,
    key,
    label: name,
    suffix: tier === 1 ? '' : ` ${tier}`,
    icon: tier === 1 ? slug : `${slug}-${tier}`,
  }));

// "Effectivity" is what Factorio 1.1 called efficiency modules; the value is
// kept so old settings links still work, and the generators rename it.
export const MODULES: Option[] = [
  { value: 'None', key: 'none', label: 'None' },
  ...moduleFamily('Speed Module', 'entities.speed_module', 'speed-module'),
  ...moduleFamily('Effectivity Module', 'entities.effectivity_module', 'effectivity-module').map(
    (option) => ({ ...option, label: 'Efficiency Module' }),
  ),
  ...moduleFamily('Productivity Module', 'entities.productivity_module', 'productivity-module'),
];

export const TURRETS: Option[] = [
  { value: 'none', key: 'none', label: 'None' },
  { value: 'gun_turrets', key: 'entities.gun_turrets', label: 'Gun Turrets', icon: 'gun-turret' },
  { value: 'laser_turrets', key: 'entities.laser_turrets', label: 'Laser Turrets', icon: 'laser-turret' },
];

export const TILES: Option[] = [
  { value: 0, key: 'none', label: 'None' },
  { value: 'stone_path', key: 'entities.stone_path', label: 'Stone Path', icon: 'stone-brick' },
  { value: 'concrete', key: 'entities.concrete', label: 'Concrete', icon: 'concrete' },
  { value: 'hazard_concrete_left', key: 'entities.hazard_concrete_left', label: 'Hazard Concrete Left', icon: 'hazard-concrete-left' },
  { value: 'hazard_concrete_right', key: 'entities.hazard_concrete_right', label: 'Hazard Concrete Right', icon: 'hazard-concrete-right' },
  { value: 'refined_concrete', key: 'entities.refined_concrete', label: 'Refined Concrete', icon: 'refined-concrete' },
  { value: 'refined_hazard_concrete_left', key: 'entities.refined_hazard_concrete_left', label: 'Refined Hazard Concrete Left', icon: 'refined-hazard-concrete-left' },
  { value: 'refined_hazard_concrete_right', key: 'entities.refined_hazard_concrete_right', label: 'Refined Hazard Concrete Right', icon: 'refined-hazard-concrete-right' },
];

// Which straight runs of pipe go underground.
export const UNDERGROUND_PIPES: Option[] = [
  { value: 'none', key: 'none', label: 'None' },
  { value: 'long', key: 'ui.underground_long', label: 'Long runs' },
  { value: 'all', key: 'ui.underground_all', label: 'All runs' },
];

// How many beacons go around the pumpjacks.
export const BEACONS: Option[] = [
  { value: 'none', key: 'none', label: 'None' },
  { value: 'few', key: 'ui.beacons_few', label: 'Few' },
  { value: 'balanced', key: 'ui.beacons_balanced', label: 'Balanced' },
  { value: 'max', key: 'ui.beacons_max', label: 'Max' },
];

// Blueprint strings written for 2.0 cannot be imported into 1.1.
export const GAME_VERSIONS: Option[] = [
  { value: '2.0', label: 'Factorio 2.0' },
  { value: '1.1', label: 'Factorio 1.1' },
];

// Factorio directions as used by the generators: 0 top, 1 right, 2 bottom, 3 left.
export const SIDE_KEYS = ['top', 'right', 'bottom', 'left'] as const;
export const SIDE_LABELS = ['Top', 'Right', 'Bottom', 'Left'];

// The track runs along the station side, so trains can only enter from the
// two perpendicular directions.
export function validDirections(side: number): [number, number] {
  return side % 2 === 1 ? [0, 2] : [3, 1];
}

// Picks an entry direction for a new station side, keeping the train's
// rough heading when the old direction is no longer possible.
export function directionForSide(side: number, direction: number): number {
  const valid = validDirections(side);
  if (valid.includes(direction)) return direction;
  const turned = side % 2 === 1 ? { 3: 2, 1: 0 } : { 0: 1, 2: 3 };
  return turned[direction] ?? valid[1];
}
