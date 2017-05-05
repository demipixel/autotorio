const generator = require('factorio-generators');

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
          info: 'Only necessary when using mods with custom belt names.'
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
          title: 'Ore Travel',
          options: ['Down', 'Up', 'Right', 'Left']
        },
        {
          type: 'select',
          name: 'minerSpace',
          title: 'Miner Space',
          options: ['0', '1', '2'],
          default: 1,
          info: 'Side-by-side space between miners.'
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
          name: 'customRequestItem',
          title: 'Custom Ore Type (Optional)',
          placeholder: 'example_ore',
          info: 'Only necessary when using mods with custom ore names'
        },
        {
          type: 'header',
          title: 'Defenses',
          header: true
        },
        {
          title: 'Use Laser Turrets',
          checkbox: {
            name: 'laserTurrets',
            info: '',
            checked: true
          }
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
          type: 'textarea',
          name: 'balancer',
          title: 'Balancer Blueprint String (Optional)',
          placeholder: 'Blueprint string here...',
          info: 'If a balancer of NxN is not available (where N is the # of cargo wagons), put a blueprint string of a balancer here. '+
                'The balancer should be made of express belt and be facing upwards. This is not required if bot-based.'
        }
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

  app.post('/outpost/string', (req, res) => {
    try {
      if (!req.body.blueprint) {
        res.send('{"error": "You must provide a blueprint string." }');
        res.end();
        return;
      }
      const opt = {};
      Object.keys(req.body).forEach(key => opt[key] = req.body[key]);

      opt.beltName = opt.custom_belt_type || CONVERT_BELT_NAME[opt.belt_type];
      opt.trainDirection = CONVERT_DIRECTIONS[opt.trainDirection];
      opt.minedOreDirection = CONVERT_DIRECTIONS[opt.minedOreDirection];
      opt.undergroundBelts = opt.undergroundBelts == 'on';
      opt.requestItem = opt.customRequestItem || (opt.requestItem || '').split(' ').join('_').toLowerCase();

      console.log(opt);
      const string = generator.outpost(req.body.blueprint, opt);
      res.send('{"string": "'+string+'" }');
      res.end();
    } catch (e) {
      console.log(e);
      res.send('{"error": "'+e.message+'"}');
      res.end();
    }
  });

}