import * as factorioGenerators from 'factorio-generators';

import { CONTRIBUTORS } from './contributors';

export function generateOreOutpost(form: { [key: string]: any }) {
  var opt: { [key: string]: any } = {};
  Object.keys(form).forEach(function (key) {
    opt[key] = form[key];
  });

  opt.beltName = (opt.modded && opt.custom_belt_type) || opt.belt_type || '';

  // Handle miner type selection
  if (opt.minerType === 'big') {
    opt.minerSize = 4;
    opt.miningDrillName = 'big_mining_drill';
  } else if (opt.minerType === 'standard') {
    opt.minerSize = 3;
    opt.miningDrillName = undefined;
  }
  // For custom, use the values provided in minerSize and miningDrillName

  opt.module =
    (opt.modded && opt.customModule) || opt.module != 'None'
      ? ((opt.modded && opt.customModule) || opt.module)
          .split(' ')
          .join('_')
          .toLowerCase()
      : null;

  opt.roboports = opt.botBased && opt.roboports;
  opt.requestItem =
    (opt.modded && opt.customRequestItem) ||
    (opt.requestItem || '').split(' ').join('_').toLowerCase();

  opt.turrets = opt.turretType !== 'none';
  opt.laserTurrets = opt.turretType === 'laser_turrets';

  opt.concrete = (opt.modded && opt.customConcrete) || opt.concrete || '';
  opt.borderConcrete =
    (opt.modded && opt.customBorderConcrete) || opt.borderConcrete || '';
  opt.trackConcrete =
    (opt.modded && opt.customTrackConcrete) || opt.trackConcrete || '';

  opt.name =
    CONTRIBUTORS[Math.floor(Math.random() * CONTRIBUTORS.length)] +
    ' Outpost - %drills% Drills';

  return factorioGenerators.outpost(form.blueprint, opt);
}
