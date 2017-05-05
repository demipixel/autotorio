const generator = require('factorio-generators');

module.exports = function(app) {

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
          title: 'Defenses',
          header: true
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
          type: 'input',
          name: 'turretSpacing',
          title: 'Turret Spacing',
          placeholder: '8',
          checkbox: {
            name: 'laserTurrets',
            info: 'Use laser turrets instead of gun turrets.',
            checked: true
          },

          number: true,
          minimum: 2,
          maximum: 9
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
      Object.keys(req.body).forEach(key => obj[key] = req.body[key]);

      opt.beltName = opt.custom_belt_type || CONVERT_BELT_NAME[opt.belt_type];
      opt.trainDirection = CONVERT_DIRECTIONS[opt.trainDirection];
      opt.minedOreDirection = CONVERT_DIRECTIONS[opt.minedOreDirection];
      opt.undergroundBelts = opt.undergroundBelts == 'on';

      console.log(opt);
      const string = generator.outpost(req.body.blueprint, req.body);
      res.send('{"string": "'+string+'" }');
      res.end();
    } catch (e) {
      console.log(e);
      res.send('{"error": "'+e.message+'"}');
      res.end();
    }
  });

}