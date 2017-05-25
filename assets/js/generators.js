
var CONVERT_BELT_NAME = {
  'Transport Belt': '',
  'Fast Transport Belt': 'fast',
  'Express Transport Belt': 'express'
};

var CONVERT_DIRECTIONS = {
  Up: 0,
  Top: 0,

  Right: 1,

  Down: 2,
  Bottom: 2,

  Left: 3
};

var CONVERT_TILE = {
  'None': '',
  'Stone Path': 'stone_path',
  'Concrete': 'concrete',
  'Hazard Concrete Left': 'hazard_concrete_left',
  'Hazard Concrete Right': 'hazard_concrete_right'
};

function generateOutpost(form) {
  var opt = {};
  Object.keys(form).forEach(function(key) {
    opt[key] = form[key];
  });

  opt.beltName = (opt.modded && opt.custom_belt_type) || CONVERT_BELT_NAME[opt.belt_type];
  opt.trainDirection = CONVERT_DIRECTIONS[opt.trainDirection];
  opt.minedOreDirection = CONVERT_DIRECTIONS[opt.minedOreDirection];

  opt.module = (opt.modded && opt.customModule) || opt.module != 'None' ? ((opt.modded && customModule) || opt.module).split(' ').join('_').toLowerCase() : null;

  opt.useStackInserters = opt.useStackInserters == 'on';
  opt.botBased = opt.botBased == 'on';
  opt.includeRadar = opt.includeRadar == 'on';
  opt.undergroundBelts = opt.undergroundBelts == 'on';
  opt.walls = opt.walls == 'on';
  opt.includeTrainStation = opt.includeTrainStation == 'on';
  opt.exitRoute = opt.exitRoute == 'on';
  opt.requestItem = (opt.modded && opt.customRequestItem) || (opt.requestItem || '').split(' ').join('_').toLowerCase();

  opt.turrets = opt.turretType != 'None';
  opt.laserTurrets = opt.turretType == 'Laser Turrets';

  opt.concrete = (opt.modded && opt.customConcrete) || CONVERT_TILE[opt.concrete];
  opt.borderConcrete = (opt.modded && opt.customBorderConcrete) || CONVERT_TILE[opt.borderConcrete];
  opt.trackConcrete = (opt.modded && opt.customTrackConcrete) || CONVERT_TILE[opt.trackConcrete];

  return factorioGenerators.outpost(form.blueprint, opt);
}

function generateOilOutpost(form) {
  var opt = {};
  Object.keys(form).forEach(function(key) {
    opt[key] = form[key];
  });

  opt.trainSide = CONVERT_DIRECTIONS[opt.trainSide];
  opt.trainDirection = CONVERT_DIRECTIONS[opt.trainDirection];

  opt.module = (opt.modded && opt.customModule) || opt.module != 'None' ? ((opt.modded && customModule) || opt.module).split(' ').join('_').toLowerCase() : null;
  opt.includeRadar = opt.includeRadar == 'on';

  opt.includeTrainStation = opt.includeTrainStation == 'on';
  opt.exitRoute = opt.exitRoute == 'on';

  opt.turrets = opt.turretType != 'None';
  opt.laserTurrets = opt.turretType == 'Laser Turrets';
  opt.walls = opt.walls == 'on';

  opt.concrete = (opt.modded && opt.customConcrete) || CONVERT_TILE[opt.concrete];
  opt.borderConcrete = (opt.modded && opt.customBorderConcrete) || CONVERT_TILE[opt.borderConcrete];
  opt.trackConcrete = (opt.modded && opt.customTrackConcrete) || CONVERT_TILE[opt.trackConcrete];

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
    var replacerOpt = opt[replacer+'Replacer'];
    if (!replacerOpt) return;

    opt[replacer+'Replace'] = [];
    replacerOpt.split(' ').forEach(o => {
      if (!o) return;
      var arr = o.split(',');
      if (arr.length < 2) return;
      var obj = { to: arr[1] };

      if (arr[0].startsWith('includes:')) obj.includes = arr[0].replace('includes:', '');
      else obj.from = arr[0];

      opt[replacer+'Replace'].push(obj);
    });
  });

  return factorioGenerators.blueprintTool(form.blueprint, opt);
}