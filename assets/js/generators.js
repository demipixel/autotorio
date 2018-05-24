const CONTRIBUTORS = ['phono\'s', 'Goopsky\'s', 'Fahr', 'Dwarf\'s Foundry', 'Tupper\'s', 'Schorty\'s', 'nerdkusi\'s', 'KrzysD\'s', 'Geo\'s', 'Brodo\'s',
  'gigajum\'s', 'Tom\'s', 'SickHippie', 'TheTostu\'s', 'Autotorio Approved™'];
// Okay, last one wasn't technically created by a contributor

// ^ Above is everyone who has donated to the project or helped work on it.
// Thank you so much, everyone!

function generateOutpost(form) {
  var opt = {};
  Object.keys(form).forEach(function(key) {
    opt[key] = form[key];
  });

  opt.beltName = (opt.modded && opt.custom_belt_type) || opt.belt_type;
  opt.trainSide = opt.trainSide;
  opt.trainDirection = opt.trainDirection;

  opt.module = (opt.modded && opt.customModule) || opt.module != 'None' ? ((opt.modded && opt.customModule) || opt.module).split(' ').join('_').toLowerCase() :
    null;

  opt.useStackInserters = opt.useStackInserters == 'on';
  opt.useFilterInserters = opt.useFilterInserters == 'on';
  opt.botBased = opt.botBased == 'on';
  opt.roboports = opt.botBased && opt.roboports == 'on';
  opt.includeRadar = opt.includeRadar == 'on';
  opt.undergroundBelts = opt.undergroundBelts == 'on';
  opt.walls = opt.walls == 'on';
  opt.includeTrainStation = opt.includeTrainStation == 'on';
  opt.exitRoute = opt.exitRoute == 'on';
  opt.requestItem = (opt.modded && opt.customRequestItem) || (opt.requestItem || '').split(' ').join('_').toLowerCase();

  opt.turrets = opt.turretType != 'none';
  opt.laserTurrets = opt.turretType == 'laser_turrets';

  opt.concrete = (opt.modded && opt.customConcrete) || opt.concrete;
  opt.borderConcrete = (opt.modded && opt.customBorderConcrete) || opt.borderConcrete;
  opt.trackConcrete = (opt.modded && opt.customTrackConcrete) || opt.trackConcrete;

  opt.name = CONTRIBUTORS[Math.floor(Math.random() * CONTRIBUTORS.length)] + ' Outpost - %drills% Drills';

  return factorioGenerators.outpost(form.blueprint, opt);
}

function generateOilOutpost(form) {
  var opt = {};
  Object.keys(form).forEach(function(key) {
    opt[key] = form[key];
  });

  opt.trainSide = opt.trainSide;
  opt.trainDirection = opt.trainDirection;

  opt.module = (opt.modded && opt.customModule) || opt.module != 'None' ? ((opt.modded && customModule) || opt.module).split(' ').join('_').toLowerCase() :
    null;
  opt.includeRadar = opt.includeRadar == 'on';
  opt.beacons = opt.beacons == 'on';

  opt.includeTrainStation = opt.includeTrainStation == 'on';
  opt.exitRoute = opt.exitRoute == 'on';

  opt.turrets = opt.turretType != 'none';
  opt.laserTurrets = opt.turretType == 'laser_turrets';
  opt.walls = opt.walls == 'on';

  opt.concrete = (opt.modded && opt.customConcrete) || opt.concrete;
  opt.borderConcrete = (opt.modded && opt.customBorderConcrete) || opt.borderConcrete;
  opt.trackConcrete = (opt.modded && opt.customTrackConcrete) || opt.trackConcrete;

  opt.name = CONTRIBUTORS[Math.floor(Math.random() * CONTRIBUTORS.length)] + '\'s Outpost - %pumpjacks% Pumpjacks';

  return factorioGenerators.oilOutpost(form.blueprint, opt);
}

function blueprintTool(form) {
  var opt = {};
  Object.keys(form).forEach(function(key) {
    opt[key] = form[key];
  });

  opt.flipX = opt.flipX == 'on';
  opt.flipY = opt.flipY == 'on';
  opt.modifiedOnly = opt.modifiedOnly == 'on';

  ['entity', 'recipe', 'module'].forEach(replacer => {
    var replacerOpt = opt[replacer + 'Replacer'];
    if (!replacerOpt) return;

    opt[replacer + 'Replace'] = [];
    replacerOpt.split(' ').forEach(o => {
      if (!o) return;
      var arr = o.split(',');
      if (arr.length < 2) return;
      var obj = { to: arr[1] };

      if (arr[0].startsWith('includes:')) obj.includes = arr[0].replace('includes:', '');
      else obj.from = arr[0];

      opt[replacer + 'Replace'].push(obj);
    });
  });

  return factorioGenerators.blueprintTool(form.blueprint, opt);
}
