const generator = require('factorio-generators');
const moment = require('moment');

module.exports = function(app) {

  app.get('/github', (req, res) => {
    res.render('github.html');
  });

  app.get('*', (req, res) => {
    res.render('outpost.html', {
      formElements: [
        {
          type: 'textarea',
          name: 'blueprint',
          title: 'Blueprint String',
          placeholder: 'Blueprint string here...',
          info: 'Place two walls, one at each corner of the ore patch, and then place a blueprint string of the walls here.'
        },
        {
          title: 'Modded',
          checkbox: {
            name: 'modded',
            info: '(Shows options for modded entity names)',
            activator: 'mod'
          }
        },
        {
          type: 'select',
          name: 'belt_type',
          title: 'Belt Type',
          options: ['Transport Belt', 'Fast Transport Belt', 'Express Transport Belt'],
          default: 2,
          checkbox: {
            name: 'undergroundBelts',
            info: 'Use underground belts'
          }
        },
        {
          type: 'input',
          name: 'custom_belt_type',
          title: 'Custom Belt Type (Optional)',
          placeholder: 'example_transport_belt',
          info: 'Only necessary when using mods with custom belt names.',
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'trainDirection',
          title: 'Train Station Side',
          options: ['Right', 'Left', 'Top', 'Bottom']
        },
        {
          type: 'select',
          name: 'minedOreDirection',
          title: 'Train Enter From',
          options: ['Bottom', 'Top', 'Right', 'Left']
        },
        {
          type: 'select',
          name: 'minerSpace',
          title: 'Miner Space',
          options: ['0', '1', '2', '3', '4', '5'],
          default: 1,
          info: 'Side-by-side space between miners.'
        },
        {
          type: 'input',
          name: 'miningDrillName',
          title: 'Custom Mining Drill Name (optional)',
          placeholder: 'example_mining_drill',
          info: 'Only necessary when using mods with custom mining drill names.',
          activate: 'mod'
        },
        {
          title: 'Use stack inserters',
          checkbox: {
            name: 'useStackInserters',
            info: 'Use stack inserters between the buffer chests and the cargo wagon',
            checked: true
          }
        },
        {
          title: 'Include Radar',
          checkbox: {
            name: 'includeRadar',
            checked: true
          }
        },
        {
          type: 'textarea',
          name: 'balancer',
          title: 'Balancer Blueprint String (Optional)',
          placeholder: 'Blueprint string here...',
          info: 'If a balancer of NxN is not available (where N is the # of cargo wagons), put a blueprint string of a balancer here.<br>'+
                'Only balancers for 1, 2, and 4 cargo wagons are provided.<br>'+
                'The balancer should be made of express belt and be facing upwards. If it is not "inline", make sure it sticks out to right and increase "wall space".<br>'+
                'This is not required if bot-based.'
        },
        {
          type: 'header',
          title: 'Bots',
          header: true
        },
        {
          title: 'Bot based',
          checkbox: {
            name: 'botBased',
            info: 'Removes all belts and uses passive providers and requester chests instead. Does not include roboports.'
          }
        },
        {
          type: 'select',
          name: 'requestItem',
          title: 'Ore Type',
          options: ['Iron Ore', 'Copper Ore', 'Coal', 'Stone', 'Uranium Ore'],
          info: 'If "bot based" is enabled, you must provide an ore type for the requester chests.'
        },
        {
          type: 'input',
          name: 'requestAmount',
          title: 'Request Amount',
          placeholder: '4800'
        },
        {
          type: 'input',
          name: 'customRequestItem',
          title: 'Custom Ore Type (Optional)',
          placeholder: 'example_ore',
          info: 'Only necessary when using mods with custom ore names.',
          activate: 'mod'
        },
        {
          type: 'header',
          title: 'Defenses',
          header: true
        },
        {
          type: 'select',
          name: 'turretType',
          title: 'Turret Type',
          options: ['None', 'Gun Turrets', 'Laser Turrets'],
          default: 2
        },
        {
          type: 'input',
          name: 'turretSpacing',
          title: 'Turret Spacing',
          placeholder: '8',

          number: true,
          minimum: 2,
          maximum: 9
        },
        {
          title: 'Walls Enabled',
          checkbox: {
            name: 'walls',
            checked: true
          }
        },
        {
          type: 'input',
          name: 'wallThickness',
          title: 'Wall Thickness',
          placeholder: '1',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'wallSpace',
          title: 'Wall Space',
          placeholder: '5',
          info: 'Distance between edge of outpost and walls. Minimum 3 to support laser turrets.',

          number: true,
          minimum: 3
        },
        {
          type: 'header',
          title: 'Train Info',
          header: true
        },
        {
          title: 'Provide exit route',
          checkbox: {
            name: 'exitRoute',
            info: 'Useful for single-headed trains (with locomotives on a single side)'
          }
        },
        {
          type: 'input',
          name: 'locomotiveCount',
          title: 'Locomotive Count',
          info: 'Number of locomotives at the beginning of the train.',
          placeholder: '2',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'cargoWagonCount',
          title: 'Cargo Wagon Count',
          placeholder: '4',

          number: true,
          minimum: 1
        },
        {
          type: 'header',
          title: 'Tiles',
          header: true
        },
        {
          type: 'select',
          name: 'concrete',
          title: 'Tiles',
          options: ['None', 'Stone Path', 'Concrete', 'Hazard Concrete Left', 'Hazard Concrete Right'],
          info: 'Covers the entire area surrounded by the walls in the specified tile type.'
        },
        {
          type: 'input',
          name: 'customConcrete',
          title: 'Custom Tiles (Optional)',
          placeholder: 'example_concrete',
          info: 'Only necessary when using mods with custom tile names.',
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'borderConcrete',
          title: 'Border Tiles',
          options: ['None', 'Stone Path', 'Concrete', 'Hazard Concrete Left', 'Hazard Concrete Right'],
          info: 'Covers the walls and tile inside with the specified tile type.'
        },
        {
          type: 'input',
          name: 'customBorderConcrete',
          title: 'Custom Border Tiles (Optional)',
          placeholder: 'example_concrete',
          info: 'Only necessary when using mods with custom tile names.',
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'trackConcrete',
          title: 'Track Tiles',
          options: ['None', 'Stone Path', 'Concrete', 'Hazard Concrete Left', 'Hazard Concrete Right'],
          info: 'Covers and surrounds tracks with the specified tile type.'
        },
        {
          type: 'input',
          name: 'customTrackConcrete',
          title: 'Custom Track Tiles (Optional)',
          placeholder: 'example_concrete',
          info: 'Only necessary when using mods with custom tile names.',
          activate: 'mod'
        },
      ]
    });
  });

  const CONVERT_BELT_NAME = {
    'Transport Belt': '',
    'Fast Transport Belt': 'fast',
    'Express Transport Belt': 'express'
  };

  const CONVERT_DIRECTIONS = {
    Up: 0,
    Top: 0,

    Right: 1,

    Down: 2,
    Bottom: 2,

    Left: 3
  };

  const CONVERT_TILE = {
    'None': '',
    'Stone Path': 'stone_path',
    'Concrete': 'concrete',
    'Hazard Concrete Left': 'hazard_concrete_left',
    'Hazard Concrete Right': 'hazard_concrete_right'
  };

  app.post('/outpost/string', (req, res) => {
    LOG('Outpost request made');
    try {
      if (!req.body.blueprint) {
        res.send('{"error": "You must provide a blueprint string." }');
        res.end();
        return;
      }
      const opt = {};
      Object.keys(req.body).forEach(key => opt[key] = req.body[key]);

      opt.beltName = (opt.modded && opt.custom_belt_type) || CONVERT_BELT_NAME[opt.belt_type];
      opt.trainDirection = CONVERT_DIRECTIONS[opt.trainDirection];
      opt.minedOreDirection = CONVERT_DIRECTIONS[opt.minedOreDirection];
      opt.botBased = opt.botBased == 'on';
      opt.includeRadar = opt.includeRadar == 'on';
      opt.undergroundBelts = opt.undergroundBelts == 'on';
      opt.walls = opt.walls == 'on';
      opt.exitRoute = opt.exitRoute == 'on';
      opt.requestItem = (opt.modded && opt.customRequestItem) || (opt.requestItem || '').split(' ').join('_').toLowerCase();

      opt.turrets = opt.turretType != 'None';
      opt.laserTurrets = opt.turretType == 'Laser Turrets';

      opt.concrete = (opt.modded && opt.customConcrete) || CONVERT_TILE[opt.concrete];
      opt.borderConcrete = (opt.modded && opt.customBorderConcrete) || CONVERT_TILE[opt.borderConcrete];
      opt.trackConcrete = (opt.modded && opt.customTrackConcrete) || CONVERT_TILE[opt.trackConcrete];

      const string = generator.outpost(req.body.blueprint, opt);
      res.send('{"string": "'+string+'" }');
      res.end();
    } catch (e) {
      LOG('Outpost error', e.message);
      res.send('{"error": "'+e.message+'"}');
      res.end();
    }
  });

}

function LOG(...args) {
  console.log('['+moment().format('MMMM Do YYYY, h:mm:ss a')+']', ...args);
}