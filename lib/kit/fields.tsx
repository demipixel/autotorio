import { useRef } from 'react';

import {
  BELTS,
  BUILTIN_BALANCERS,
  DEFAULTS,
  INSERTERS,
  inserterOf,
  laneCount,
  MAX_PATCH,
  MIN_PATCH,
  MINERS,
  needsBalancer,
  ORES,
  PRESETS,
} from '../outpost/model';
import { useCopy } from '../site/useSettings';
import {
  cx,
  Field,
  NumberBox,
  optionLabel,
  Pick,
  Range,
  Seg,
  Stepper,
  TextBox,
  Toggle,
  useKit,
} from './controls';
import {
  BEACONS,
  GAME_VERSIONS,
  icon,
  MODULES,
  Option,
  SIDE_KEYS,
  SIDE_LABELS,
  TILES,
  TURRETS,
  UNDERGROUND_PIPES,
  validDirections,
} from './options';

// One component per setting. Pages decide where each one goes; the kit's CSS
// module decides how it looks. Most are shared by the ore and oil outposts,
// which use the same setting names for the things they have in common.

const numbers = (from: number, to: number): Option[] =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    value: from + i,
    label: String(from + i),
  }));

/* ---------- pasted blueprint ---------- */

export function PasteBox({ rows = 3 }: { rows?: number }) {
  const { s, o, t } = useKit();
  const ref = useRef<HTMLTextAreaElement>(null);
  const invalid = !!o.outcome?.inputError;

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        o.set('blueprint', text.trim());
        return;
      }
    } catch (e) {
      // no clipboard permission: let the user paste by hand instead
    }
    ref.current?.focus();
  };

  return (
    <div className={cx(s.paste, invalid && s.invalid, !!o.values.blueprint && s.filled)}>
      <textarea
        ref={ref}
        className={s.pasteArea}
        rows={rows}
        spellCheck={false}
        aria-label={t('blueprint_string', 'Blueprint String')}
        placeholder={t('blueprint_string_placeholder', 'Blueprint string here...')}
        value={o.values.blueprint}
        onChange={(e) => o.set('blueprint', e.target.value)}
      />
      <div className={s.pasteActions}>
        {o.values.blueprint ? (
          <button type="button" className={s.linkBtn} onClick={() => o.set('blueprint', '')}>
            {t('ui.clear', 'Clear')}
          </button>
        ) : (
          <button type="button" className={s.linkBtn} onClick={pasteFromClipboard}>
            {t('ui.paste_clipboard', 'Paste from clipboard')}
          </button>
        )}
      </div>
    </div>
  );
}

// One line saying what the outpost is being built for.
export function InputStatus() {
  const { s, o, t } = useKit();
  const outcome = o.outcome;
  if (!outcome) return <div className={s.status}>&nbsp;</div>;

  if (outcome.inputError) {
    return (
      <div className={cx(s.status, s.statusError)} role="alert">
        <span className={s.statusDot} />
        {outcome.inputError}
      </div>
    );
  }

  const pasted = outcome.inputSource === 'paste';
  let text: string;
  if (outcome.patch) {
    text = pasted
      ? t('ui.patch_read', 'Blueprint read: {{w}} × {{h}} tile patch', outcome.patch)
      : t('ui.patch_none', 'No blueprint yet, previewing a {{w}} × {{h}} tile patch', outcome.patch);
  } else {
    text = pasted
      ? t('ui.oil_read', 'Blueprint read: {{count}} pumpjacks', { count: outcome.machines ?? 0 })
      : t('ui.oil_none', 'No blueprint yet, previewing a sample oil field');
  }

  return (
    <div className={cx(s.status, pasted && s.statusOk)}>
      <span className={s.statusDot} />
      {text}
    </div>
  );
}

// Manual patch size, used until a wall blueprint is pasted.
export function PatchSize() {
  const { s, o, t } = useKit();
  const locked = o.outcome?.inputSource === 'paste';
  const size = (locked && o.outcome.patch) || o.manual;
  return (
    <div className={cx(s.patchSize, locked && s.locked)}>
      <Stepper
        label="patch width"
        value={size.w}
        min={MIN_PATCH}
        max={MAX_PATCH}
        onChange={(w) => o.setManual({ w })}
      />
      <span className={s.patchTimes}>×</span>
      <Stepper
        label="patch height"
        value={size.h}
        min={MIN_PATCH}
        max={MAX_PATCH}
        onChange={(h) => o.setManual({ h })}
      />
      <span className={s.patchUnit}>{t('ui.tiles_unit', 'tiles')}</span>
    </div>
  );
}

// Tiny picture of the "two walls" trick.
export function PatchDiagram({ size = 96 }: { size?: number }) {
  const { s } = useKit();
  const ore = [
    [30, 24], [44, 20], [58, 24], [70, 30], [24, 36], [38, 34], [52, 36],
    [66, 42], [76, 44], [22, 50], [34, 48], [48, 50], [62, 54], [74, 58],
    [28, 62], [42, 62], [56, 66], [68, 70], [36, 74], [50, 78], [62, 80],
  ];
  return (
    <svg
      className={s.diagram}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Two walls placed at opposite corners of an ore patch"
    >
      {ore.map(([x, y], i) => (
        <rect key={i} className={s.diagramOre} x={x - 5} y={y - 5} width={10} height={10} rx={2.5} />
      ))}
      <rect className={s.diagramBox} x={14} y={12} width={72} height={76} rx={3} fill="none" />
      <rect className={s.diagramWall} x={8} y={6} width={13} height={13} rx={2.5} />
      <rect className={s.diagramWall} x={79} y={81} width={13} height={13} rx={2.5} />
    </svg>
  );
}

// Starting points for the ore outpost; the one in effect is highlighted.
export function Presets() {
  const { s, o, t } = useKit();
  const { blueprint, ...base } = DEFAULTS;
  const full = (values: { [key: string]: unknown }) => ({ ...base, ...values });
  const current = PRESETS.find((preset) => {
    const want = full(preset.values);
    return Object.keys(want).every((key) => o.values[key] === want[key]);
  });

  return (
    <div className={s.seg} role="group" aria-label={t('ui.presets', 'Presets')}>
      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          className={cx(s.segOpt, preset === current && s.on)}
          title={t(preset.key + '_hint', preset.hint)}
          aria-pressed={preset === current}
          onClick={() => o.patch(full(preset.values))}
        >
          <span className={s.segLabel}>{t(preset.key, preset.label)}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- mining ---------- */

export function MinerType() {
  const { s, o, t } = useKit();
  const v = o.values;
  return (
    <Field label={t('miner_type', 'Miner Type')}>
      <Seg
        label={t('miner_type', 'Miner Type')}
        value={v.minerType}
        options={MINERS}
        onChange={(value) => o.set('minerType', value)}
      />
      {v.minerType === 'custom' && (
        <div className={s.sub}>
          <Field label={t('custom_mining_drill_size', 'Custom Mining Drill Size')}>
            <Seg
              value={v.minerSize}
              options={[3, 4, 5].map((n) => ({ value: n, label: `${n}×${n}` }))}
              onChange={(value) => o.set('minerSize', value)}
            />
          </Field>
          <Field
            label={t('ui.drill_name', 'Drill entity name')}
            hint={t('custom_mining_drill_info', 'Only necessary when using mods with custom mining drill names.')}
          >
            <TextBox
              value={v.miningDrillName}
              placeholder="example_mining_drill"
              onChange={(value) => o.set('miningDrillName', value)}
            />
          </Field>
        </div>
      )}
    </Field>
  );
}

export function MinerSpace() {
  const { o, t } = useKit();
  return (
    <Field
      label={t('miner_space', 'Miner Spacing')}
      hint={t('miner_space_info', 'Side-by-side space between miners.')}
    >
      <Seg
        label={t('miner_space', 'Miner Spacing')}
        value={o.values.minerSpace}
        options={numbers(0, 5)}
        onChange={(value) => o.set('minerSpace', value)}
      />
    </Field>
  );
}

// `infoKey` explains how many modules go where; ore and oil differ.
export function Modules({
  infoKey = 'modules_info',
  info = 'If chosen, inserts 3 of the selected module in each miner.',
}: {
  infoKey?: string;
  info?: string;
}) {
  const kit = useKit();
  const { o, t } = kit;
  const current = MODULES.find((m) => m.value === o.values.module);
  return (
    <Field
      label={t('modules', 'Modules')}
      value={current ? optionLabel(kit, current) : undefined}
      hint={o.values.module !== 'None' ? t(infoKey, info) : undefined}
    >
      <Pick
        label={t('modules', 'Modules')}
        className={kit.s.pickGrid}
        value={o.values.module}
        options={MODULES}
        onChange={(value) => o.set('module', value)}
      />
    </Field>
  );
}

/* ---------- getting the ore out ---------- */

const TRANSPORT: Option[] = [
  {
    value: 'belts',
    key: 'ui.belts',
    label: 'Belts',
    sub: 'Belts carry ore to the station',
    subKey: 'ui.belts_hint',
    icon: 'express-transport-belt',
  },
  {
    value: 'bots',
    key: 'ui.bots',
    label: 'Logistic bots',
    sub: 'Provider and requester chests',
    subKey: 'ui.bots_hint',
    icon: 'logistic-robot',
  },
];

export function TransportMode() {
  const { s, o, t } = useKit();
  return (
    <Pick
      label={t('ui.transport', 'Transport')}
      className={s.pickCards}
      value={o.values.botBased ? 'bots' : 'belts'}
      options={TRANSPORT}
      onChange={(value) => o.set('botBased', value === 'bots')}
    />
  );
}

export function BeltTier() {
  const kit = useKit();
  const { o, t } = kit;
  const current = BELTS.find((b) => b.value === o.values.belt_type);
  return (
    <Field label={t('belt_type', 'Belt Type')} value={current && optionLabel(kit, current)}>
      <Pick
        label={t('belt_type', 'Belt Type')}
        value={o.values.belt_type}
        options={BELTS}
        onChange={(value) => o.set('belt_type', value)}
      />
    </Field>
  );
}

export function Underground() {
  const { o, t } = useKit();
  const tier = BELTS.find((b) => b.value === o.values.belt_type)?.icon ?? 'transport-belt';
  return (
    <Toggle
      label={t('underground_belts_info', 'Use underground belts')}
      iconName={tier.replace('transport', 'underground')}
      checked={o.values.undergroundBelts}
      onChange={(checked) => o.set('undergroundBelts', checked)}
    />
  );
}

export function Compact() {
  const { o, t } = useKit();
  return (
    <Toggle
      label={t('ui.compact', 'Compact miners')}
      hint={t('ui.compact_hint', 'No gap between miner columns; poles sit between the underground belts.')}
      checked={o.values.compact}
      onChange={(checked) => o.set('compact', checked)}
    />
  );
}

export function Ore() {
  const kit = useKit();
  const { o, t } = kit;
  const current = ORES.find((x) => x.value === o.values.requestItem);
  return (
    <Field
      label={t('ore_type', 'Ore Type')}
      value={current && optionLabel(kit, current)}
      hint={t('ui.ore_hint', 'What the requester chests at the station ask for.')}
    >
      <Pick
        label={t('ore_type', 'Ore Type')}
        value={o.values.requestItem}
        options={ORES}
        onChange={(value) => o.set('requestItem', value)}
      />
    </Field>
  );
}

export function RequestAmount() {
  const { s, o, t } = useKit();
  return (
    <Field label={t('request_amount', 'Request Amount')}>
      <div className={s.inputRow}>
        <NumberBox
          className={s.input}
          label={t('request_amount', 'Request Amount')}
          value={o.values.requestAmount}
          min={1}
          onChange={(value) => o.set('requestAmount', value)}
        />
        <span className={s.inputSuffix}>{t('ui.per_chest', 'per chest')}</span>
      </div>
    </Field>
  );
}

export function Roboports() {
  const { o, t } = useKit();
  return (
    <Toggle
      label={t('roboports', 'Include Roboports')}
      hint={t('roboports_info', 'Roboports are only based behind the track.')}
      iconName="roboport"
      checked={o.values.roboports}
      onChange={(checked) => o.set('roboports', checked)}
    />
  );
}

/* ---------- train ---------- */

export function StationToggle() {
  const { o, t } = useKit();
  return (
    <Toggle
      label={t('train_station', 'Include Train Station')}
      iconName="train-stop"
      checked={o.values.includeTrainStation}
      onChange={(checked) => o.set('includeTrainStation', checked)}
    />
  );
}

// grid cells (col, row) of a 5x5 layout with the resource patch in the middle
const SIDE_CELL = [
  { col: 3, row: 1 },
  { col: 5, row: 3 },
  { col: 3, row: 5 },
  { col: 1, row: 3 },
];

// entry arrows sit at the two ends of the station's track and point along it
const ARROW_CELL: { [side: number]: { dir: number; col: number; row: number; rotate: number }[] } = {
  0: [
    { dir: 3, col: 2, row: 1, rotate: 90 },
    { dir: 1, col: 4, row: 1, rotate: 270 },
  ],
  1: [
    { dir: 0, col: 5, row: 2, rotate: 180 },
    { dir: 2, col: 5, row: 4, rotate: 0 },
  ],
  2: [
    { dir: 3, col: 2, row: 5, rotate: 90 },
    { dir: 1, col: 4, row: 5, rotate: 270 },
  ],
  3: [
    { dir: 0, col: 1, row: 2, rotate: 180 },
    { dir: 2, col: 1, row: 4, rotate: 0 },
  ],
};

// Station side and entry direction as one diagram: click a side of the
// patch for the station, then an arrow for where trains come from.
export function StationCompass({ centre = 'electric-mining-drill' }: { centre?: string }) {
  const { s, o, t } = useKit();
  const { trainSide, trainDirection } = o.values;
  const name = (dir: number) => t(SIDE_KEYS[dir], SIDE_LABELS[dir]);

  return (
    <div className={s.compass}>
      <div className={s.compassPatch} aria-hidden="true">
        <img src={icon(centre)} alt="" draggable={false} />
      </div>
      {[0, 1, 2, 3].map((side) => {
        const on = side === trainSide;
        const label = `${t('train_station_side', 'Train Station Side')}: ${name(side)}`;
        return (
          <button
            key={side}
            type="button"
            aria-pressed={on}
            aria-label={label}
            title={label}
            className={cx(s.compassSide, on && s.on)}
            style={{ gridColumn: SIDE_CELL[side].col, gridRow: SIDE_CELL[side].row }}
            onClick={() => o.setSide(side)}
          >
            {on && <img src={icon('train-stop')} alt="" draggable={false} />}
          </button>
        );
      })}
      {ARROW_CELL[trainSide].map(({ dir, col, row, rotate }) => {
        const on = dir === trainDirection;
        const label = `${t('train_enter_from', 'Train Enter From')}: ${name(dir)}`;
        return (
          <button
            key={dir}
            type="button"
            aria-pressed={on}
            aria-label={label}
            title={label}
            className={cx(s.compassArrow, on && s.on)}
            style={{ gridColumn: col, gridRow: row }}
            onClick={() => o.set('trainDirection', dir)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: `rotate(${rotate}deg)` }}
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// `belts` is false for tools that have no belts to speak of (oil).
export function StationPlacement({ centre, belts = true }: { centre?: string; belts?: boolean }) {
  const { s, o, t, rich } = useKit();
  const v = o.values;
  const names = {
    side: t(SIDE_KEYS[v.trainSide], SIDE_LABELS[v.trainSide]).toLowerCase(),
    from: t(SIDE_KEYS[v.trainDirection], SIDE_LABELS[v.trainDirection]).toLowerCase(),
  };
  const station = v.includeTrainStation;
  // without a station the same two settings decide where the belts end up
  const sentence = station
    ? rich('ui.station_sentence', 'Station on the {{side}}, trains arrive from the {{from}}.', names)
    : !belts || v.botBased
    ? rich('ui.layout_sentence', 'Layout faces the {{side}}.', names)
    : rich('ui.output_sentence', 'Belts come out on the {{side}}, at the {{from}} end.', names);

  return (
    <Field
      label={
        station ? t('ui.station_position', 'Station position') : t('ui.output_position', 'Output position')
      }
    >
      <div className={s.placement}>
        <StationCompass centre={centre} />
        <p className={s.placementText}>
          {sentence}
          <span className={s.placementHint}>
            {t('ui.compass_hint', 'Click a side of the patch, then an arrow.')}
          </span>
        </p>
      </div>
    </Field>
  );
}

// The train as a row of icons. `wagons` names the setting that counts them.
export function TrainStrip({
  wagons = 'cargoWagonCount',
  wagonIcon = 'cargo-wagon',
}: {
  wagons?: string;
  wagonIcon?: string;
}) {
  const { s, o } = useKit();
  const locos = Math.min(o.values.locomotiveCount, 6);
  const count = Math.min(o.values[wagons], 12);
  return (
    <div className={s.trainStrip} aria-hidden="true">
      {Array.from({ length: locos }, (_, i) => (
        <img key={'l' + i} src={icon('diesel-locomotive')} alt="" draggable={false} />
      ))}
      {Array.from({ length: count }, (_, i) => (
        <img key={'w' + i} src={icon(wagonIcon)} alt="" draggable={false} />
      ))}
    </div>
  );
}

// A whole-number setting with plus and minus buttons.
export function Count({
  name,
  labelKey,
  label,
  hintKey,
  hint,
  max = 20,
}: {
  name: string;
  labelKey: string;
  label: string;
  hintKey?: string;
  hint?: string;
  max?: number;
}) {
  const { o, t } = useKit();
  return (
    <Field label={t(labelKey, label)} hint={hint ? t(hintKey, hint) : undefined}>
      <Stepper
        label={label.toLowerCase()}
        value={o.values[name]}
        min={1}
        max={max}
        onChange={(value) => o.set(name, value)}
      />
    </Field>
  );
}

export const Locomotives = () => (
  <Count name="locomotiveCount" labelKey="loco_count" label="Locomotive Count" />
);
export const Wagons = () => (
  <Count name="cargoWagonCount" labelKey="wagon_count" label="Cargo Wagon Count" />
);
export const FluidWagons = () => (
  <Count name="wagonCount" labelKey="fluid_wagon_count" label="Fluid Wagon Count" />
);
export const Tanks = () => (
  <Count
    name="tanks"
    labelKey="tank_count"
    label="Tank Count"
    hintKey="tank_count_info"
    hint="Number of buffer tanks before each fluid wagon."
  />
);

// Without a station the wagon settings only decide how many belts leave the
// outpost, so offer that number directly.
export function OutputLanes() {
  const { o, t } = useKit();
  return (
    <Field
      label={t('ui.output_belts', 'Output belts')}
      hint={t('ui.output_belts_hint', 'How many belt lanes leave the outpost.')}
    >
      <Stepper
        label="output belts"
        value={laneCount(o.values)}
        min={1}
        max={40}
        onChange={(lanes) => o.patch({ cargoWagonCount: lanes, doubleLoading: false })}
      />
    </Field>
  );
}

export function DoubleLoading() {
  const { o, t } = useKit();
  return (
    <Toggle
      label={t('double_loading', 'Double Loading')}
      hint={t('double_loading_info', 'Load on both sides of each cargo wagon.')}
      checked={o.values.doubleLoading}
      onChange={(checked) => o.set('doubleLoading', checked)}
    />
  );
}

export function ExitRoute() {
  const { o, t } = useKit();
  return (
    <Toggle
      label={t('exit_route', 'Provide Exit Route')}
      hint={t('exit_route_info', 'Useful for single-headed trains (with locomotives on a single side)')}
      checked={o.values.exitRoute}
      onChange={(checked) => o.set('exitRoute', checked)}
    />
  );
}

export function Inserters() {
  const kit = useKit();
  const { o, t } = kit;
  // what there is to choose from depends on the game version the blueprint is for
  const options = INSERTERS[o.values.gameVersion];
  const current = inserterOf(o.values);
  return (
    <Field
      label={t('ui.loading_inserters', 'Loading inserters')}
      value={current && optionLabel(kit, current)}
    >
      <Pick
        label={t('ui.loading_inserters', 'Loading inserters')}
        value={current?.value}
        options={options}
        onChange={(value) => {
          const chosen = options.find((i) => i.value === value);
          o.patch({ useStackInserters: chosen.stack, useFilterInserters: chosen.filter });
        }}
      />
    </Field>
  );
}

// Only needed for lane counts the generator has no balancer for.
export function Balancer() {
  const { s, o, t } = useKit();
  const missing = needsBalancer(o.values);
  return (
    <Field
      label={
        missing
          ? t('ui.balancer_needed', 'Balancer needed for {{lanes}} lanes', { lanes: laneCount(o.values) })
          : t('ui.custom_balancer', 'Custom balancer')
      }
      className={cx(missing && s.warn)}
      hint={t(
        'ui.balancer_hint',
        'Balancers are built in for {{lanes}} lanes (lanes are wagons, doubled when loading both sides). For anything else, paste a blueprint string of an express belt balancer that faces upwards.',
        { lanes: BUILTIN_BALANCERS.join(', ') },
      )}
    >
      <textarea
        className={s.textarea}
        rows={2}
        spellCheck={false}
        aria-label={t('ui.custom_balancer', 'Custom balancer')}
        placeholder={t('balancer_placeholder', 'Blueprint String here...')}
        value={o.values.balancer}
        onChange={(e) => o.set('balancer', e.target.value)}
      />
    </Field>
  );
}

/* ---------- defenses ---------- */

export function Turrets() {
  const kit = useKit();
  const { o, t } = kit;
  const current = TURRETS.find((x) => x.value === o.values.turretType);
  return (
    <Field label={t('turret_type', 'Turret Type')} value={current && optionLabel(kit, current)}>
      <Pick
        label={t('turret_type', 'Turret Type')}
        value={o.values.turretType}
        options={TURRETS}
        onChange={(value) => o.set('turretType', value)}
      />
    </Field>
  );
}

// A whole-number setting on a slider.
function Slide({
  name,
  labelKey,
  label,
  min,
  max,
  hintKey,
  hint,
}: {
  name: string;
  labelKey: string;
  label: string;
  min: number;
  max: number;
  hintKey?: string;
  hint?: string;
}) {
  const { o, t } = useKit();
  return (
    <Field label={t(labelKey, label)} hint={hint ? t(hintKey, hint) : undefined}>
      <Range
        label={t(labelKey, label)}
        value={o.values[name]}
        min={min}
        max={max}
        onChange={(value) => o.set(name, value)}
      />
    </Field>
  );
}

export const TurretSpacing = () => (
  <Slide name="turretSpacing" labelKey="turret_spacing" label="Turret Spacing" min={2} max={9} />
);
export const WallThickness = () => (
  <Slide name="wallThickness" labelKey="wall_thickness" label="Wall Thickness" min={1} max={6} />
);
export const WallSpace = () => (
  <Slide
    name="wallSpace"
    labelKey="wall_space"
    label="Wall Space"
    min={3}
    max={12}
    hintKey="wall_space_info"
    hint="Distance between edge of outpost and walls. Minimum 3 to support laser turrets."
  />
);

// A yes/no setting shown as a checkbox row with an item icon.
function Flag({
  name,
  labelKey,
  label,
  iconName,
  hintKey,
  hint,
}: {
  name: string;
  labelKey: string;
  label: string;
  iconName?: string;
  hintKey?: string;
  hint?: string;
}) {
  const { o, t } = useKit();
  return (
    <Toggle
      label={t(labelKey, label)}
      hint={hint ? t(hintKey, hint) : undefined}
      iconName={iconName}
      checked={!!o.values[name]}
      onChange={(checked) => o.set(name, checked)}
    />
  );
}

export const Walls = () => (
  <Flag name="walls" labelKey="walls" label="Walls Enabled" iconName="stone-wall" />
);
export const Radar = () => (
  <Flag name="includeRadar" labelKey="radar" label="Include Radar" iconName="radar" />
);
export const Lights = () => (
  <Flag name="includeLights" labelKey="lights" label="Include Lights" iconName="small-lamp" />
);
export function UndergroundPipes() {
  const { o, t } = useKit();
  return (
    <Field label={t('ui.underground_pipes', 'Underground pipes')}>
      <Seg
        label={t('ui.underground_pipes', 'Underground pipes')}
        value={o.values.undergroundPipes}
        options={UNDERGROUND_PIPES}
        onChange={(value) => o.set('undergroundPipes', value)}
      />
    </Field>
  );
}

export function Beacons() {
  const { o, t } = useKit();
  return (
    <Field
      label={t('beacons', 'Beacons')}
      hint={t(
        'ui.beacons_hint',
        'Speed beacons on the free spots that add the most.',
      )}
    >
      <Seg
        label={t('beacons', 'Beacons')}
        value={o.values.beacons}
        options={BEACONS}
        onChange={(value) => o.set('beacons', value)}
      />
    </Field>
  );
}

const TILE_FIELDS = {
  concrete: { key: 'tiles', label: 'Tiles' },
  borderConcrete: { key: 'border_tiles', label: 'Border Tiles' },
  trackConcrete: { key: 'track_tiles', label: 'Track Tiles' },
} as const;

export function Tiles({ which }: { which: keyof typeof TILE_FIELDS }) {
  const kit = useKit();
  const { o, t } = kit;
  const def = TILE_FIELDS[which];
  const current = TILES.find((x) => x.value === o.values[which]);
  return (
    <Field label={t(def.key, def.label)} value={current && optionLabel(kit, current)}>
      <Pick
        label={t(def.key, def.label)}
        value={o.values[which]}
        options={TILES}
        onChange={(value) => o.set(which, value)}
      />
    </Field>
  );
}

/* ---------- output options ---------- */

export function GameVersion() {
  const { o, t } = useKit();
  return (
    <Field
      label={t('ui.game_version', 'Blueprint format')}
      hint={
        o.values.gameVersion === '2.0'
          ? t('ui.game_version_hint', '2.0 strings cannot be imported into Factorio 1.1.')
          : undefined
      }
    >
      <Seg
        label={t('ui.game_version', 'Blueprint format')}
        value={o.values.gameVersion}
        options={GAME_VERSIONS}
        onChange={(value) => o.set('gameVersion', value)}
      />
    </Field>
  );
}

// Entity names from mods. `names` lists the settings to show as
// [setting, label key, English label, placeholder].
export function Modded({ names }: { names: [string, string, string, string][] }) {
  const { s, o, t } = useKit();
  return (
    <>
      <Toggle
        label={t('modded', 'Modded')}
        hint={t('ui.modded_hint', 'Use entity names from mods in place of the vanilla ones.')}
        checked={o.values.modded}
        onChange={(checked) => o.set('modded', checked)}
      />
      {o.values.modded && (
        <div className={s.modGrid}>
          {names.map(([name, key, label, placeholder]) => (
            <Field key={name} label={t(key, label)}>
              <TextBox
                label={t(key, label)}
                value={String(o.values[name])}
                placeholder={placeholder}
                onChange={(value) => o.set(name, value)}
              />
            </Field>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- output ---------- */

// Entity counts of the generated outpost, as an inventory of item slots.
// `modulesEach` is how many modules the generator puts in every machine.
export function Bom({ limit = 12, modulesEach = 3 }: { limit?: number; modulesEach?: number }) {
  const { s, o } = useKit();
  const outcome = o.outcome;
  if (!outcome?.counts) return <ul className={s.bom} />;

  const items = outcome.counts.slice();
  const fitted = MODULES.find((m) => m.value === o.values.module);
  if (fitted?.icon && outcome.machines && !(o.values.modded && o.values.customModule)) {
    items.push({ name: String(fitted.label), icon: fitted.icon, count: outcome.machines * modulesEach });
    items.sort((a, b) => b.count - a.count);
  }

  return (
    <ul className={s.bom}>
      {items.slice(0, limit).map((item) => (
        <li key={item.name} className={s.bomItem} title={item.name.split('_').join(' ')}>
          <img
            src={icon(item.icon)}
            alt={item.name.split('_').join(' ')}
            draggable={false}
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
          />
          <span>{item.count.toLocaleString('en-US')}</span>
        </li>
      ))}
    </ul>
  );
}

export function CopyBlueprint({ className }: { className?: string }) {
  const { s, o, t } = useKit();
  const { copied, copy } = useCopy();
  const ready = !!o.outcome?.ok && o.outcome.usable;
  return (
    <button
      type="button"
      className={cx(s.primary, copied && s.done, className)}
      disabled={!ready}
      onClick={() => copy(o.output())}
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('ui.copied', 'Copied to clipboard')}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 3.2v-.2a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {t('ui.copy_blueprint', 'Copy blueprint')}
        </>
      )}
    </button>
  );
}

export function CopySettingsLink({ className }: { className?: string }) {
  const { s, o, t } = useKit();
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      className={cx(s.secondary, copied && s.done, className)}
      title={t('ui.share_hint', 'Copy a link that opens this page with the same settings')}
      onClick={() => copy(o.shareUrl)}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6.8 9.2a3 3 0 0 0 4.2 0l2.1-2.1a3 3 0 0 0-4.2-4.2l-.7.7M9.2 6.8a3 3 0 0 0-4.2 0L2.9 8.9a3 3 0 0 0 4.2 4.2l.7-.7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {copied ? t('ui.link_copied', 'Link copied') : t('ui.share', 'Share settings')}
    </button>
  );
}

// The bar under the preview: reset on the left, the blueprint on the right.
// `share` is off for tools whose settings do not fit in a link.
export function ConfirmBar({ share = true }: { share?: boolean }) {
  const { s, o, t } = useKit();
  return (
    <div className={s.confirmBar}>
      <button
        type="button"
        className={s.back}
        onClick={o.reset}
        disabled={o.isDefault}
        title={t('ui.reset_hint', 'Reset every setting to its default')}
      >
        {t('ui.reset', 'Reset')}
      </button>
      {share && <CopySettingsLink />}
      <span className={s.grooves} aria-hidden="true" />
      <CopyBlueprint />
    </div>
  );
}
