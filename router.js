const generator = require('factorio-generators');
const moment = require('moment');
const fs = require('fs');

const PREVENT_KEYWORD = [
  'worm', 'spitter', 'biter', 'alien',
  'coral', 'pita', 'grass', 'asterisk', 'bush', 'dirt', 'tree', 'fluff', 'cane', 'trunk', 'garballo', 'root',
  'remnants', 'loader', 'scorchmark', 'wreck', 'water',
  'market', 'player', 'plane', 'coin', 'background', 'computer', 'immunity', 'crude-oil'
];
let factorioItems = ['includes:transport-belt', 'includes:underground-belt', 'includes:splitter'];
let factorioRecipes = [];
let modules = ['includes:module', 'includes:effectivity-module', 'includes:productivity-module', 'includes:speed-module'];

fs.readdir('./assets/img/factorio-icons/', (err, files) => {
  const items =
    files.filter(file => file.slice(-4) == '.png')
         .filter(file => {
          let ret = true;
          PREVENT_KEYWORD.forEach(keyword => {
            if (!ret) return;
            if (file.includes(keyword)) ret = false;
          });
          return ret;
         })
         .map(file => file.slice(0, -4));

  factorioItems = factorioItems.concat(items);
  factorioRecipes = factorioRecipes.concat(items);

  modules = modules.concat(factorioItems.filter(item => item.includes('module')).sort());
});


module.exports = function(app) {

  app.get('/github', (req, res) => {
    res.render('github.html', {
      page: 'github'
    });
  });

  app.get('/outpost', (req, res) => {
    res.render('form.html', {
      page: 'outpost',
      title: 'Ore Outpost Generator',
      generatorName: 'generateOutpost',
      exampleUsage: 'https://gfycat.com/VioletPoliteHomalocephale',
      submitButton: 'Get Ore Outpost Blueprint',
      selections: {},
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
          name: 'trainSide',
          title: 'Train Station Side',
          options: ['Right', 'Left', 'Top', 'Bottom']
        },
        {
          type: 'select',
          name: 'trainDirection',
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
          type: 'select',
          name: 'module',
          title: 'Modules',
          options: ['None', 'Speed Module', 'Speed Module 2', 'Speed Module 3', 'Effectivity Module', 'Effectivity Module 2', 'Effectivity Module 3', 'Productivity Module', 'Productivity Module 2', 'Productivity Module 3'],
          info: 'If chosen, inserts 3 of the selected module in each miner.'
        },
        {
          type: 'input',
          name: 'customModule',
          title: 'Custom Module Name',
          placeholder: 'example_module_name_2',
          info: 'Only necessary when using mods with custom module names.',
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
            info: 'Removes all belts and uses passive providers and requester chests instead. Does not include roboports.',
            activator: 'bots'
          }
        },
        {
          type: 'select',
          name: 'requestItem',
          title: 'Ore Type',
          options: ['Iron Ore', 'Copper Ore', 'Coal', 'Stone', 'Uranium Ore'],
          info: 'If "bot based" is enabled, you must provide an ore type for the requester chests.',
          activate: 'bots'
        },
        {
          type: 'input',
          name: 'customRequestItem',
          title: 'Custom Ore Type (Optional)',
          placeholder: 'example_ore',
          info: 'Only necessary when using mods with custom ore names.',
          activate: 'mod bots'
        },
        {
          type: 'input',
          name: 'requestAmount',
          title: 'Request Amount',
          placeholder: '4800',
          activate: 'bots'
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
            checked: true,
            activator: 'walls'
          }
        },
        {
          type: 'input',
          name: 'wallThickness',
          title: 'Wall Thickness',
          placeholder: '1',
          activate: 'walls',

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
          title: 'Include Train Station',
          checkbox: {
            name: 'includeTrainStation',
            checked: true,
            activator: 'trainStation'
          }
        },
        {
          title: 'Provide exit route',
          checkbox: {
            name: 'exitRoute',
            info: 'Useful for single-headed trains (with locomotives on a single side)'
          },
          activate: 'trainStation'
        },
        {
          type: 'input',
          name: 'locomotiveCount',
          title: 'Locomotive Count',
          info: 'Number of locomotives at the beginning of the train.',
          placeholder: '2',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'cargoWagonCount',
          title: 'Cargo Wagon Count',
          placeholder: '4',
          activate: 'trainStation',

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

  app.get('/blueprint', (req, res) => {
    const ENTITY_REPLACER_DEFAULT = 'inserter,fast-inserter includes:transport-belt,express-transport-belt includes:underground-belt,express-underground-belt includes:splitter,express-splitter small-electric-pole,medium-electric-pole';
    res.render('form.html', {
      page: 'blueprint',
      title: 'Blueprint Tool',
      generatorName: 'blueprintTool',
      exampleUsage: '',
      submitButton: 'Get Blueprint',
      selections: {
        entities: factorioItems,
        recipes: factorioRecipes,
        modules: modules,

        map: {
          'includes:transport-belt': 'All Belts',
          'includes:underground-belt': 'All Undergrounds',
          'includes:splitter': 'All Splitters',

          'includes:module': 'All Modules',
          'includes:effectivity-module': 'All Effectivity Modules',
          'includes:productivity-module': 'All Productivity Modules',
          'includes:speed-module': 'All Speed Modules'
        }
      },
      formElements: [
        {
          type: 'textarea',
          name: 'blueprint',
          title: 'Blueprint String',
          placeholder: 'Blueprint string here...',
          info: 'This is the blueprint to modify.'
        },
        {
          title: 'Flip Along X Axis',
          checkbox: {
            name: 'flipX'
          }
        },
        {
          title: 'Flip Along Y Axis',
          checkbox: {
            name: 'flipY'
          }
        },{
          buttons: [
            {
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Entity Replacer',
              type: 'success',
              onClick: 'createReplacer(\'entityReplacer\',\'entities\')'
            }/*,
            {
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Modded Entity Replacer',
              type: 'warning',
              onClick: 'createReplacer(\'entityReplacer\',\'entities\', true)'
            }*/,
            {
              text: '<span aria-hidden="true" class="fa fa-arrow-circle-up fa-fw"></span>Upgrader Preset',
              type: 'info',
              onClick: 'loadReplacer(\'entityReplacer\',\'entities\', \''+ENTITY_REPLACER_DEFAULT+'\')'
            }
          ],
          info: 'Modded entity/recipe/module replace coming soon'
        },
        {
          type: 'div',
          name: 'entityReplacer',
          replacer: 'entities'
        },
        { hr: true },
        {
          buttons: [
            {
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Recipe Replacer',
              type: 'success',
              onClick: 'createReplacer(\'recipeReplacer\',\'recipes\')'
            }/*,
            {
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Modded Recipe Replacer',
              type: 'warning',
              onClick: 'createReplacer(\'recipeReplacer\',\'recipes\', true)'
            }*/
          ]
        },
        {
          type: 'div',
          name: 'recipeReplacer',
          replacer: 'recipes'
        },
        { hr: true },
        {
          buttons: [
            {
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Module Replacer',
              type: 'success',
              onClick: 'createReplacer(\'moduleReplacer\',\'modules\')'
            }/*,
            {
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Modded Module Replacer',
              type: 'warning',
              onClick: 'createReplacer(\'moduleReplacer\',\'modules\', true)'
            }*/
          ]
        },
        {
          type: 'div',
          name: 'moduleReplacer',
          replacer: 'modules'
        },
        { hr: true },
        {
          title: 'Return Modified Only',
          checkbox: {
            name: 'modifiedOnly',
            info: 'Only include entities in the blueprint that were modified'
          }
        }
      ]
    });
  });

  app.get('/oil', (req, res) => {
    res.render('form.html', {
      page: 'oil',
      title: 'Oil Outpost Generator',
      generatorName: 'generateOilOutpost',
      exampleUsage: 'https://gfycat.com/PeskyPeskyGreendarnerdragonfly',
      submitButton: 'Get Oil Outpost Blueprint',
      selections: {},
      formElements: [
        {
          type: 'textarea',
          name: 'blueprint',
          title: 'Blueprint String',
          placeholder: 'Blueprint string here...',
          info: 'Create a blueprint with your pumpjacks <b>and a single straight track placed anywhere.</b>'
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
          name: 'trainSide',
          title: 'Train Station Side',
          options: ['Right', 'Left', 'Top', 'Bottom']
        },
        {
          type: 'select',
          name: 'trainDirection',
          title: 'Train Enter From',
          options: ['Bottom', 'Top', 'Right', 'Left']
        },
        {
          type: 'select',
          name: 'module',
          title: 'Modules',
          options: ['None', 'Speed Module', 'Speed Module 2', 'Speed Module 3', 'Effectivity Module', 'Effectivity Module 2', 'Effectivity Module 3', 'Productivity Module', 'Productivity Module 2', 'Productivity Module 3'],
          info: 'If chosen, inserts 3 of the selected module in each pumpjack.'
        },
        {
          type: 'input',
          name: 'customModule',
          title: 'Custom Module Name',
          placeholder: 'example_module_name_2',
          info: 'Only necessary when using mods with custom module names.',
          activate: 'mod'
        },
        {
          title: 'Include Radar',
          checkbox: {
            name: 'includeRadar',
            checked: true
          }
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
            checked: true,
            activator: 'walls'
          }
        },
        {
          type: 'input',
          name: 'wallThickness',
          title: 'Wall Thickness',
          placeholder: '1',
          activate: 'walls',

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
          title: 'Include Train Station',
          checkbox: {
            name: 'includeTrainStation',
            checked: true,
            activator: 'trainStation'
          }
        },
        {
          title: 'Provide exit route',
          checkbox: {
            name: 'exitRoute',
            info: 'Useful for single-headed trains (with locomotives on a single side)'
          },
          activate: 'trainStation'
        },
        {
          type: 'input',
          name: 'locomotiveCount',
          title: 'Locomotive Count',
          info: 'Number of locomotives at the beginning of the train.',
          placeholder: '1',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'wagonCount',
          title: 'Fluid Wagon Count',
          placeholder: '2',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'tanks',
          title: 'Tank Count',
          info: 'Number of buffer tanks before each fluid wagon.',
          placeholder: '2',
          activate: 'trainStation',

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

  app.get('*', (req, res) => {
    res.redirect('/outpost');
  });

  app.post('/outpost/string', (req, res) => {
    LOG('Outpost error', 'This is no longer a valid endpoint');
    res.send('{"error": "This is no longer a valid endpoint"}');
    res.end();
  });

  app.post('/blueprint/string', (req, res) => {
    LOG('Blueprint Tool error', 'This is no longer a valid endpoint');
    res.send('{"error": "This is no longer a valid endpoint"}');
    res.end();
  });

}

function LOG(...args) {
  console.log('['+moment().format('MMMM Do YYYY, h:mm:ss a')+']', ...args);
}