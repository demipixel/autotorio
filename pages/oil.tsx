import { useI18n } from 'next-localization';

import { KitProvider, useKit } from '../lib/kit/controls';
import * as F from '../lib/kit/fields';
import { useOil } from '../lib/oil/useOil';
import { PreviewFrame } from '../lib/preview/PreviewFrame';
import { Disclaimer, Frame, s, Shell } from '../lib/site/Shell';

// The oil outpost generator: pipes from your pumpjacks to a fluid train
// station, with the same live map and defenses as the ore outposts.

// entity names a modded game may need, as [setting, label key, label, placeholder]
const MOD_NAMES: [string, string, string, string][] = [
  ['pumpjackName', 'ui.mod_pumpjack', 'Pumpjack', 'example_pumpjack_name_2'],
  ['customModule', 'ui.mod_module', 'Module', 'example_module_name_2'],
  ['customConcrete', 'ui.mod_tiles', 'Tiles', 'example_concrete'],
  ['customBorderConcrete', 'ui.mod_border', 'Border tiles', 'example_concrete'],
  ['customTrackConcrete', 'ui.mod_track', 'Track tiles', 'example_concrete'],
];

export default function OilOutpost() {
  const oil = useOil();
  const i18n = useI18n();
  return (
    <KitProvider styles={s} tool={oil}>
      <Shell title={i18n.t('navbar.oil_outpost_generator') || 'Oil Outpost Generator'}>
        <aside className={s.panel}>
          <Settings />
          <Disclaimer />
        </aside>
        <main className={s.stage}>
          <Preview />
          <F.Bom limit={40} modulesEach={2} />
          <F.ConfirmBar />
        </main>
      </Shell>
    </KitProvider>
  );
}

function Settings() {
  const { o, t } = useKit();
  const v = o.values;

  return (
    <>
      <Frame title={t('ui.oil_field', 'Oil field')}>
        <div className={s.patchHelp}>
          <img src="/img/factorio-icons/pumpjack.png" alt="" width={48} height={48} />
          <p>
            {t(
              'ui.oil_help',
              'Blueprint your pumpjacks together with one piece of straight track placed anywhere (it lines the station up with your rails), and paste the string below.',
            )}
          </p>
        </div>
        <F.PasteBox rows={2} />
        <F.InputStatus />
      </Frame>

      <Frame title={t('ui.pumpjacks', 'Pumpjacks')}>
        <F.UndergroundPipes />
        <F.Modules
          infoKey="oil_modules_info"
          info="If chosen, inserts 2 of the selected module in each pumpjack."
        />
        <F.Beacons />
      </Frame>

      <Frame title={t('ui.train_station', 'Train station')}>
        <F.StationToggle />
        <F.StationPlacement centre="pumpjack" belts={false} />
        {v.includeTrainStation && (
          <>
            <F.TrainStrip wagons="wagonCount" wagonIcon="fluid-wagon" />
            <div className={s.two}>
              <F.Locomotives />
              <F.FluidWagons />
            </div>
            <F.Tanks />
            <F.ExitRoute />
          </>
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
        <F.Modded names={MOD_NAMES} />
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
          ? t('ui.oil_readout', '{{count}} pumpjacks · {{w}} × {{h}} tiles', {
              count: outcome.machines,
              w: outcome.width,
              h: outcome.height,
            })
          : ''
      }
    />
  );
}
