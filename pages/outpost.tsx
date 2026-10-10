import { useI18n } from 'next-localization';

import { KitProvider, useKit } from '../lib/kit/controls';
import * as F from '../lib/kit/fields';
import { needsBalancer } from '../lib/outpost/model';
import { useOutpost } from '../lib/outpost/useOutpost';
import { PreviewFrame } from '../lib/preview/PreviewFrame';
import { Disclaimer, Frame, s, Shell } from '../lib/site/Shell';

// The ore outpost generator: settings scroll on the left, the outpost (drawn
// with the game's sprites, regenerated on every change) takes the rest, with
// its materials and the confirm button below.

// entity names a modded game may need, as [setting, label key, label, placeholder]
const BELT_NAMES: [string, string, string, string][] = [
  ['custom_belt_type', 'ui.mod_belt', 'Belt', 'example_transport_belt'],
];
const ORE_NAMES: [string, string, string, string][] = [
  ['customRequestItem', 'ui.mod_ore', 'Ore', 'example_ore'],
];
const SHARED_NAMES: [string, string, string, string][] = [
  ['customModule', 'ui.mod_module', 'Module', 'example_module_name_2'],
  ['customConcrete', 'ui.mod_tiles', 'Tiles', 'example_concrete'],
  ['customBorderConcrete', 'ui.mod_border', 'Border tiles', 'example_concrete'],
  ['customTrackConcrete', 'ui.mod_track', 'Track tiles', 'example_concrete'],
];

export default function Outpost() {
  const outpost = useOutpost();
  const i18n = useI18n();
  return (
    <KitProvider styles={s} tool={outpost}>
      <Shell title={i18n.t('navbar.outpost_generator') || 'Outpost Generator'}>
        <aside className={s.panel}>
          <Settings />
          <Disclaimer />
        </aside>
        <main className={s.stage}>
          <Preview />
          <F.Bom limit={40} />
          <F.ConfirmBar />
        </main>
      </Shell>
    </KitProvider>
  );
}

function Settings() {
  const { o, t } = useKit();
  const v = o.values;
  const balancer = needsBalancer(v) || !!v.balancer;

  return (
    <>
      <Frame title={t('ui.ore_patch', 'Ore patch')}>
        <div className={s.patchHelp}>
          <F.PatchDiagram size={64} />
          <p>
            {t(
              'ui.patch_help',
              'Place a wall on two opposite corners of the ore patch, blueprint the two walls, and paste the string below.',
            )}
          </p>
        </div>
        <F.PasteBox rows={2} />
        <F.InputStatus />
        <div className={s.row}>
          <span className={s.caption}>
            {o.outcome?.inputSource === 'paste'
              ? t('ui.patch_size', 'Patch size')
              : t('ui.or_set_size', 'Or set the size')}
          </span>
          <F.PatchSize />
        </div>
      </Frame>

      <Frame title={t('ui.presets', 'Presets')}>
        <F.Presets />
      </Frame>

      <Frame title={t('ui.mining', 'Mining')}>
        <F.MinerType />
        <F.MinerSpace />
        <F.Modules />
      </Frame>

      <Frame title={t('ui.transport', 'Transport')}>
        <F.TransportMode />
        {v.botBased ? (
          <>
            <F.Ore />
            <F.RequestAmount />
          </>
        ) : (
          <>
            <F.BeltTier />
            <F.Underground />
            {v.undergroundBelts && <F.Compact />}
          </>
        )}
      </Frame>

      <Frame title={t('ui.train_station', 'Train station')}>
        <F.StationToggle />
        <F.StationPlacement />
        {v.includeTrainStation ? (
          <>
            <F.TrainStrip />
            <div className={s.two}>
              <F.Locomotives />
              <F.Wagons />
            </div>
            {balancer && <F.Balancer />}
            <F.Inserters />
            <F.DoubleLoading />
            <F.ExitRoute />
            {v.botBased && <F.Roboports />}
          </>
        ) : (
          !v.botBased && (
            <>
              <F.OutputLanes />
              {balancer && <F.Balancer />}
            </>
          )
        )}
      </Frame>

      <Frame title={t('defenses', 'Defenses')}>
        <F.Turrets />
        {v.turretType !== 'none' && <F.TurretSpacing />}
        <F.Walls />
        {v.walls && <F.WallThickness />}
        {(v.walls || v.turretType !== 'none') && <F.WallSpace />}
      </Frame>

      <Frame title={t('tiles', 'Tiles')}>
        <F.Tiles which="concrete" />
        <F.Tiles which="borderConcrete" />
        <F.Tiles which="trackConcrete" />
      </Frame>

      <Frame title={t('ui.extras', 'Extras')}>
        <F.Radar />
        <F.Lights />
        <F.GameVersion />
        <F.Modded names={[...(v.botBased ? ORE_NAMES : BELT_NAMES), ...SHARED_NAMES]} />
      </Frame>
    </>
  );
}

function Preview() {
  const { o, t } = useKit();
  const outcome = o.outcome;
  return (
    <PreviewFrame
      readout={
        outcome?.width
          ? t('ui.readout', '{{pw}} × {{ph}} patch · {{w}} × {{h}} tiles · {{drills}} drills', {
              pw: outcome.patch.w,
              ph: outcome.patch.h,
              w: outcome.width,
              h: outcome.height,
              drills: outcome.machines,
            })
          : ''
      }
    />
  );
}
