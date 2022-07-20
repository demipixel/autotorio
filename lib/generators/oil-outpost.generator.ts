import * as factorioGenerators from 'factorio-generators';

import { CONTRIBUTORS } from './contributors';

export function generateOilOutpost(form: { [key: string]: any }) {
  var opt: { [key: string]: any } = {};
  Object.keys(form).forEach(function (key) {
    opt[key] = form[key];
  });

  opt.module =
    (opt.modded && opt.customModule) || opt.module != 'None'
      ? ((opt.modded && opt.customModule) || opt.module)
          .split(' ')
          .join('_')
          .toLowerCase()
      : null;
  opt.pumpjackName = opt.modded && opt.pumpjackName ? opt.pumpjackName : null;

  opt.turrets = opt.turretType !== 'none';
  opt.laserTurrets = opt.turretType === 'laser_turrets';

  opt.concrete = (opt.modded && opt.customConcrete) || opt.concrete;
  opt.borderConcrete =
    (opt.modded && opt.customBorderConcrete) || opt.borderConcrete;
  opt.trackConcrete =
    (opt.modded && opt.customTrackConcrete) || opt.trackConcrete;

  opt.name =
    CONTRIBUTORS[Math.floor(Math.random() * CONTRIBUTORS.length)] +
    "'s Outpost - %pumpjacks% Pumpjacks";

  return factorioGenerators.oilOutpost(form.blueprint, opt);
}
