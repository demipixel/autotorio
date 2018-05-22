const generator = require('factorio-generators');
const moment = require('moment');
const fs = require('fs');
const localisation = require('./localisation.json');

const PREVENT_KEYWORD = [ // Ignore icons for such items
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

function getNavbarLocalisation(lng) {
  const ret = {};
  Object.keys(localisation.navbar).forEach(key => {
    ret[key] = localisation.navbar[key].hasOwnProperty(lng) ? localisation.navbar[key][lng] : localisation.navbar[key]["en"];
  });
  return ret;
}

function getTileOptions(lcl, ent_lcl) {
  return [
    ['', lcl('none')],
    ['stone_path', ent_lcl('stone_path')],
    ['concrete', ent_lcl('concrete')],
    ['hazard_concrete_left', ent_lcl('hazard_concrete_left')],
    ['hazard_concrete_right', ent_lcl('hazard_concrete_right')],
    ['refined_concrete', ent_lcl('refined_concrete')],
    ['refined_hazard_concrete_left', ent_lcl('refined_hazard_concrete_left')],
    ['refined_hazard_concrete_right', ent_lcl('refined_hazard_concrete_right')]
  ];
}


module.exports = function(app) {

  app.get('/github', (req, res) => {
    res.render('github.html', {
      page: 'github',
      navbar_lcl: getNavbarLocalisation(req.cookies.language || 'en'),
      dark: req.cookies.dark == 'true'
    });
  });

  app.get('/outpost', (req, res) => {
    const lng = req.cookies.language || 'en';

    const lcl = (name) => localisation.hasOwnProperty(name) ? (localisation[name].hasOwnProperty(lng) ? localisation[name][lng] : localisation[
      name]["en"]) : "";
    const ent_lcl = (entity) => localisation.entities.hasOwnProperty(entity) ? (localisation.entities[entity].hasOwnProperty(lng) ?
      localisation.entities[entity][lng] : localisation.entities[entity]["en"]) : "";

    res.render('form.html', {
      page: 'outpost',
      title: lcl('ore_outpost_generator'),
      dark: req.cookies.dark == 'true',
      generatorName: 'generateOutpost',
      howToUse: '/example/outpost',
      submitButton: lcl('submit_ore_outpost'),
      settingsUrlButton: lcl('settings_url'),
      selections: {},
      navbar_lcl: getNavbarLocalisation(lng),
      formElements: [{
          type: 'textarea',
          name: 'blueprint',
          title: lcl('blueprint_string'),
          placeholder: lcl('blueprint_string_placeholder'),
          info: lcl('blueprint_string_info')
        },
        {
          title: lcl('modded'),
          checkbox: {
            name: 'modded',
            info: lcl('modded_info'),
            activator: 'mod'
          }
        },
        {
          type: 'select',
          name: 'belt_type',
          title: lcl('belt_type'),
          options: [
            ['', ent_lcl('transport_belt')],
            ['fast', ent_lcl('fast_transport_belt')],
            ['express', ent_lcl('express_transport_belt')]
          ],
          default: 2,
          checkbox: {
            name: 'undergroundBelts',
            info: lcl('underground_belts_info'),
            activator: 'underground'
          }
        },
        {
          activate: 'underground',
          checkbox: {
            name: 'compact',
            info: lcl('compact')
          }
        },
        {
          type: 'input',
          name: 'custom_belt_type',
          title: lcl('custom_belt_type'),
          placeholder: 'example_transport_belt',
          info: lcl('custom_belt_type_info'),
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'trainSide',
          title: lcl('train_station_side'),
          options: [
            [1, lcl('right')],
            [3, lcl('left')],
            [0, lcl('top')],
            [2, lcl('bottom')]
          ]
        },
        {
          type: 'select',
          name: 'trainDirection',
          title: lcl('train_enter_from'),
          options: [
            [2, lcl('bottom')],
            [0, lcl('top')],
            [1, lcl('right')],
            [3, lcl('left')]
          ]
        },
        {
          type: 'select',
          name: 'minerSpace',
          title: lcl('miner_space'),
          options: ['0', '1', '2', '3', '4', '5'],
          default: 1,
          info: lcl('miner_space_info')
        },
        {
          type: 'input',
          name: 'miningDrillName',
          title: lcl('custom_mining_drill'),
          placeholder: 'example_mining_drill',
          info: lcl('custom_mining_drill_info'),
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'module',
          title: lcl('modules'),
          options: [
            ['None', lcl('none')],
            ['Speed Module', ent_lcl('speed_module')],
            ['Speed Module 2', ent_lcl('speed_module') + ' 2'],
            ['Speed Module 3', ent_lcl('speed_module') + ' 3'],
            ['Effectivity Module', ent_lcl('effectivity_module')],
            ['Effectivity Module 2', ent_lcl('effectivity_module') + ' 2'],
            ['Effectivity Module 3', ent_lcl('effectivity_module') + ' 3'],
            ['Productivity Module', ent_lcl('productivity_module')],
            ['Productivity Module 2', ent_lcl('productivity_module') + ' 2'],
            ['Productivity Module 3', ent_lcl('productivity_module') + ' 3']
          ],
          info: lcl('modules_info')
        },
        {
          type: 'input',
          name: 'customModule',
          title: lcl('custom_module'),
          placeholder: 'example_module_name_2',
          info: lcl('custom_module_info'),
          activate: 'mod'
        },
        {
          title: lcl('stack_inserters'),
          checkbox: {
            name: 'useStackInserters',
            info: lcl('stack_inserters_info'),
            checked: true
          }
        },
        {
          title: lcl('filter_inserters'),
          checkbox: {
            name: 'useFilterInserters',
            info: lcl('filter_inserters_info'),
            checked: false
          }
        },
        {
          title: lcl('radar'),
          checkbox: {
            name: 'includeRadar',
            checked: true
          }
        },
        {
          type: 'textarea',
          name: 'balancer',
          title: lcl('balancer'),
          placeholder: lcl('balancer_placeholder'),
          info: lcl('balancer_info')
        },
        {
          type: 'header',
          title: lcl('bots'),
          header: true
        },
        {
          title: lcl('bot_based'),
          checkbox: {
            name: 'botBased',
            info: lcl('bot_based_info'),
            activator: 'bots'
          }
        },
        {
          type: 'select',
          name: 'requestItem',
          title: lcl('ore_type'),
          options: ['Iron Ore', 'Copper Ore', 'Coal', 'Stone', 'Uranium Ore'],
          info: lcl('ore_type_info'),
          activate: 'bots'
        },
        {
          type: 'input',
          name: 'customRequestItem',
          title: lcl('custom_ore_type'),
          placeholder: 'example_ore',
          info: lcl('custom_ore_type_info'),
          activate: 'mod bots'
        },
        {
          type: 'input',
          name: 'requestAmount',
          title: lcl('request_amount'),
          placeholder: '4800',
          activate: 'bots'
        },
        {
          title: lcl('roboports'),
          checkbox: {
            name: 'roboports',
            info: lcl('roboports_info')
          },
          activate: 'bots'
        },
        {
          type: 'header',
          title: lcl('defenses'),
          header: true
        },
        {
          type: 'select',
          name: 'turretType',
          title: lcl('turret_type'),
          options: [
            ['none', lcl('none')],
            ['gun_turrets', ent_lcl('gun_turrets')],
            ['laser_turrets', ent_lcl('laser_turrets')]
          ],
          default: 2
        },
        {
          type: 'input',
          name: 'turretSpacing',
          title: lcl('turret_spacing'),
          placeholder: '8',

          number: true,
          minimum: 2,
          maximum: 9
        },
        {
          title: lcl('walls'),
          checkbox: {
            name: 'walls',
            checked: true,
            activator: 'walls'
          }
        },
        {
          type: 'input',
          name: 'wallThickness',
          title: lcl('wall_thickness'),
          placeholder: '1',
          activate: 'walls',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'wallSpace',
          title: lcl('wall_space'),
          placeholder: '5',
          info: lcl('wall_space_info'),

          number: true,
          minimum: 3
        },
        {
          type: 'header',
          title: lcl('train_info'),
          header: true
        },
        {
          title: lcl('train_station'),
          checkbox: {
            name: 'includeTrainStation',
            checked: true,
            activator: 'trainStation'
          }
        },
        {
          title: lcl('exit_route'),
          checkbox: {
            name: 'exitRoute',
            info: lcl('exit_route_info')
          },
          activate: 'trainStation'
        },
        {
          title: lcl('double_loading'),
          checkbox: {
            name: 'doubleLoading',
            info: lcl('double_loading_info')
          },
          activate: 'trainStation'
        },
        {
          type: 'input',
          name: 'locomotiveCount',
          title: lcl('loco_count'),
          info: lcl('loco_count_info'),
          placeholder: '2',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'cargoWagonCount',
          title: lcl('wagon_count'),
          placeholder: '4',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'header',
          title: lcl('tiles'),
          header: true
        },
        {
          type: 'select',
          name: 'concrete',
          title: lcl('tiles'),
          options: getTileOptions(lcl, ent_lcl),
          info: lcl('tiles_info')
        },
        {
          type: 'input',
          name: 'customConcrete',
          title: lcl('custom_tiles'),
          placeholder: 'example_concrete',
          info: lcl('custom_tiles_info'),
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'borderConcrete',
          title: lcl('border_tiles'),
          options: getTileOptions(lcl, ent_lcl),
          info: lcl('border_tiles_info')
        },
        {
          type: 'input',
          name: 'customBorderConcrete',
          title: lcl('custom_border_tiles'),
          placeholder: 'example_concrete',
          info: lcl('custom_tiles_info'),
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'trackConcrete',
          title: lcl('track_tiles'),
          options: getTileOptions(lcl, ent_lcl),
          info: lcl('track_tiles_info')
        },
        {
          type: 'input',
          name: 'customTrackConcrete',
          title: lcl('custom_track_tiles'),
          placeholder: 'example_concrete',
          info: lcl('custom_tiles_info'),
          activate: 'mod'
        },
      ]
    });
  });

  app.get('/blueprint', (req, res) => {
    const ENTITY_REPLACER_DEFAULT =
      'inserter,fast-inserter includes:transport-belt,express-transport-belt includes:underground-belt,express-underground-belt includes:splitter,express-splitter small-electric-pole,medium-electric-pole';
    const lng = req.cookies.language || 'en';

    const lcl = (name) => localisation.hasOwnProperty(name) ? (localisation[name].hasOwnProperty(lng) ? localisation[name][lng] : localisation[
      name]["en"]) : "";
    const ent_lcl = (entity) => localisation.entities.hasOwnProperty(entity) ? (localisation.entities[entity].hasOwnProperty(lng) ?
      localisation.entities[entity][lng] : localisation.entities[entity]["en"]) : "";

    res.render('form.html', {
      page: 'blueprint',
      title: lcl('blueprint_tool'),
      dark: req.cookies.dark == 'true',
      generatorName: 'blueprintTool',
      howToUse: '',
      submitButton: lcl('submit_blueprint'),
      settingsUrlButton: lcl('settings_url'),
      navbar_lcl: getNavbarLocalisation(lng),
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
      formElements: [{
          type: 'textarea',
          name: 'blueprint',
          title: lcl('blueprint_string_or_book'),
          placeholder: lcl('blueprint_string_or_book_placeholder'),
          info: lcl('blueprint_tool_info')
        },
        {
          title: lcl('flip_x'),
          checkbox: {
            name: 'flipX'
          }
        },
        {
          title: lcl('flip_y'),
          checkbox: {
            name: 'flipY'
          }
        }, {
          buttons: [{
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>' + lcl('entity_replacer'),
              type: 'success',
              onClick: 'createReplacer(\'entityReplacer\',\'entities\')'
            }
            /*,
                        {
                          text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>New Modded Entity Replacer',
                          type: 'warning',
                          onClick: 'createReplacer(\'entityReplacer\',\'entities\', true)'
                        }*/
            ,
            {
              text: '<span aria-hidden="true" class="fa fa-arrow-circle-up fa-fw"></span>' + lcl('upgrader_preset'),
              type: 'info',
              onClick: 'loadReplacer(\'entityReplacer\',\'entities\', \'' + ENTITY_REPLACER_DEFAULT + '\')'
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
          buttons: [{
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>' + lcl('recipe_replacer'),
              type: 'success',
              onClick: 'createReplacer(\'recipeReplacer\',\'recipes\')'
            }
            /*,
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
          buttons: [{
              text: '<span aria-hidden="true" class="fa fa-plus fa-fw"></span>' + lcl('module_replacer'),
              type: 'success',
              onClick: 'createReplacer(\'moduleReplacer\',\'modules\')'
            }
            /*,
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
          title: lcl('modified_only'),
          checkbox: {
            name: 'modifiedOnly',
            info: lcl('modified_only_info')
          }
        }
      ]
    });
  });

  app.get('/oil', (req, res) => {
    const lng = req.cookies.language || 'en';

    const lcl = (name) => localisation.hasOwnProperty(name) ? (localisation[name].hasOwnProperty(lng) ? localisation[name][lng] : localisation[
      name]["en"]) : "";
    const ent_lcl = (entity) => localisation.entities.hasOwnProperty(entity) ? (localisation.entities[entity].hasOwnProperty(lng) ?
      localisation.entities[entity][lng] : localisation.entities[entity]["en"]) : "";

    res.render('form.html', {
      page: 'oil',
      title: 'Oil Outpost Generator',
      dark: req.cookies.dark == 'true',
      generatorName: 'generateOilOutpost',
      howToUse: '/example/oil',
      submitButton: lcl('submit_oil_outpost'),
      settingsUrlButton: lcl('settings_url'),
      selections: {},
      navbar_lcl: getNavbarLocalisation(lng),
      formElements: [{
          type: 'textarea',
          name: 'blueprint',
          title: lcl('blueprint_string'),
          placeholder: lcl('blueprint_string_placeholder'),
          info: lcl('oil_blueprint_info')
        },
        {
          title: lcl('modded'),
          checkbox: {
            name: 'modded',
            info: lcl('modded_info'),
            activator: 'mod'
          }
        },
        {
          type: 'select',
          name: 'trainSide',
          title: lcl('train_station_side'),
          options: [
            [1, lcl('right')],
            [3, lcl('left')],
            [0, lcl('top')],
            [2, lcl('bottom')]
          ]
        },
        {
          type: 'select',
          name: 'trainDirection',
          title: lcl('train_enter_from'),
          options: [
            [2, lcl('bottom')],
            [0, lcl('top')],
            [1, lcl('right')],
            [3, lcl('left')]
          ]
        },
        {
          type: 'select',
          name: 'module',
          title: lcl('modules'),
          options: [
            ['None', lcl('none')],
            ['Speed Module', ent_lcl('speed_module')],
            ['Speed Module 2', ent_lcl('speed_module') + ' 2'],
            ['Speed Module 3', ent_lcl('speed_module') + ' 3'],
            ['Effectivity Module', ent_lcl('effectivity_module')],
            ['Effectivity Module 2', ent_lcl('effectivity_module') + ' 2'],
            ['Effectivity Module 3', ent_lcl('effectivity_module') + ' 3'],
            ['Productivity Module', ent_lcl('productivity_module')],
            ['Productivity Module 2', ent_lcl('productivity_module') + ' 2'],
            ['Productivity Module 3', ent_lcl('productivity_module') + ' 3']
          ],
          info: lcl('oil_modules_info')
        },
        {
          type: 'input',
          name: 'customModule',
          title: lcl('custom_module'),
          placeholder: 'example_module_name_2',
          info: lcl('custom_module_info'),
          activate: 'mod'
        },
        {
          title: lcl('radar'),
          checkbox: {
            name: 'includeRadar',
            checked: true
          }
        },
        {
          title: lcl('beacons'),
          checkbox: {
            name: 'beacons'
          }
        },
        {
          type: 'header',
          title: lcl('defenses'),
          header: true
        },
        {
          type: 'select',
          name: 'turretType',
          title: lcl('turret_type'),
          options: [
            ['none', lcl('none')],
            ['gun_turrets', ent_lcl('gun_turrets')],
            ['laser_turrets', ent_lcl('laser_turrets')]
          ],
          default: 2
        },
        {
          type: 'input',
          name: 'turretSpacing',
          title: lcl('turret_spacing'),
          placeholder: '8',

          number: true,
          minimum: 2,
          maximum: 9
        },
        {
          title: lcl('walls'),
          checkbox: {
            name: 'walls',
            checked: true,
            activator: 'walls'
          }
        },
        {
          type: 'input',
          name: 'wallThickness',
          title: lcl('wall_thickness'),
          placeholder: '1',
          activate: 'walls',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'wallSpace',
          title: lcl('wall_space'),
          placeholder: '5',
          info: lcl('wall_space_info'),

          number: true,
          minimum: 3
        },
        {
          type: 'header',
          title: lcl('train_info'),
          header: true
        },
        {
          title: lcl('train_station'),
          checkbox: {
            name: 'includeTrainStation',
            checked: true,
            activator: 'trainStation'
          }
        },
        {
          title: lcl('exit_route'),
          checkbox: {
            name: 'exitRoute',
            info: lcl('exit_route_info')
          },
          activate: 'trainStation'
        },
        {
          type: 'input',
          name: 'locomotiveCount',
          title: lcl('loco_count'),
          info: lcl('loco_count_info'),
          placeholder: '1',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'wagonCount',
          title: lcl('fluid_wagon_count'),
          placeholder: '2',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'input',
          name: 'tanks',
          title: lcl('tank_count'),
          info: lcl('tank_count_info'),
          placeholder: '2',
          activate: 'trainStation',

          number: true,
          minimum: 1
        },
        {
          type: 'header',
          title: lcl('tiles'),
          header: true
        },
        {
          type: 'select',
          name: 'concrete',
          title: lcl('tiles'),
          options: getTileOptions(lcl, ent_lcl),
          info: 'Covers the entire area surrounded by the walls in the specified tile type.'
        },
        {
          type: 'input',
          name: 'customConcrete',
          title: lcl('custom_tiles'),
          placeholder: 'example_concrete',
          info: lcl('custom_tiles_info'),
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'borderConcrete',
          title: lcl('border_tiles'),
          options: getTileOptions(lcl, ent_lcl),
          info: lcl('border_tiles_info')
        },
        {
          type: 'input',
          name: 'customBorderConcrete',
          title: lcl('custom_border_tiles'),
          placeholder: 'example_concrete',
          info: lcl('custom_tiles_info'),
          activate: 'mod'
        },
        {
          type: 'select',
          name: 'trackConcrete',
          title: lcl('track_tiles'),
          options: getTileOptions(lcl, ent_lcl),
          info: lcl('track_tiles_info')
        },
        {
          type: 'input',
          name: 'customTrackConcrete',
          title: lcl('custom_track_tiles'),
          placeholder: 'example_concrete',
          info: lcl('custom_tiles_info'),
          activate: 'mod'
        },
      ]
    });
  });

  app.get('/example/outpost', (req, res) => {
    const lng = req.cookies.language || 'en';

    const lcl = (name) => localisation.hasOwnProperty(name) ? (localisation[name].hasOwnProperty(lng) ? localisation[name][lng] : localisation[
      name]["en"]) : "";
    const ent_lcl = (entity) => localisation.entities.hasOwnProperty(entity) ? (localisation.entities[entity].hasOwnProperty(lng) ?
      localisation.entities[entity][lng] : localisation.entities[entity]["en"]) : "";

    res.render('sections.html', {
      page: 'example',
      title: 'How To Use the Outpost Generator',
      dark: req.cookies.dark == 'true',
      howToUse: '',
      navbar_lcl: getNavbarLocalisation(lng),
      sections: [{
          title: 'Create a blueprint',
          text: 'Place 2 walls at the corners of the ore patch.<br/>Take a new blueprint and select your 2 walls. Then, click on Export to string and copy the string into the textbox on the website.',
          image: 'https://puu.sh/z8BiA/3688fa38bf.gif'
        },
        {
          title: 'Fill in the form',
          text: 'Select all of the options you want, like the position of the train station, belts...<br/>Turrets and walls can be useful if your ore patch is far from your base.',
          image: 'https://puu.sh/z8Bsr/9e9371e376.gif'
        },
        {
          title: 'Prepare your balancer',
          text: 'If your number of cargo wagons is 1, 2 or 4, you can skip this step.<br/>Otherwise, you\'ll need to provide a balancer blueprint.',
          // link: ['Create a balancer blueprint', '/example/balancerBlueprint']
        },
        {
          title: 'Generate your outpost',
          text: 'Now, you can click on Get Ore Outpost Blueprint. It will give you a string to use in Factorio, copy it.<br/>If you want to save your settings for a other use, you can click on Get Settings URL. It will give you an URL. When you will load it, the website will set all of his settings as you selected them.',
          image: 'https://puu.sh/z8BuB/533ede1945.gif'
        },
        {
          title: 'Import the blueprint in Factorio',
          text: 'Now, you have your copied blueprint string. Open the Blueprint Library in Factorio and then click on Import string.<br/>In the textbox, paste the blueprint string and click on Import. It will give you a blueprint that you can place on your ore patch. Don\'t forget to remove your 2 walls.',
          image: 'https://puu.sh/z8BA4/98bf879ecc.gif'
        }
      ]
    });
  });

  app.get('/example/oil', (req, res) => {
    const lng = req.cookies.language || 'en';

    const lcl = (name) => localisation.hasOwnProperty(name) ? (localisation[name].hasOwnProperty(lng) ? localisation[name][lng] : localisation[
      name]["en"]) : "";
    const ent_lcl = (entity) => localisation.entities.hasOwnProperty(entity) ? (localisation.entities[entity].hasOwnProperty(lng) ?
      localisation.entities[entity][lng] : localisation.entities[entity]["en"]) : "";

    res.render('sections.html', {
      page: 'example',
      title: 'How To Use the Oil Outpost Generator',
      dark: req.cookies.dark == 'true',
      howToUse: '',
      navbar_lcl: getNavbarLocalisation(lng),
      sections: [{
          title: 'Create a blueprint',
          text: 'Place your pumpjacks and a single track anywhere.<br/>Create a blueprint with the pumjacks and the track, then, click on Export to string and copy the string into the textbox on the website.',
          image: 'https://puu.sh/z8BTs/5e1c054e30.gif'
        },
        {
          title: 'Fill in the form',
          text: 'Select all of the options you want, like the position of the train station, radar...<br/>Turrets and walls can be useful if your pumpjacks are far from your base.',
          image: 'https://puu.sh/z8BXY/503f3c2567.gif'
        },
        {
          title: 'Generate your outpost',
          text: 'Now, you can click on Get Oil Outpost Blueprint. It will give you a string to use in Factorio, copy it.<br/>If you want to save your settings for a other use, you can click on Get Settings URL. It will give you an URL. When you will load it, the website will set all of his settings as you selected them.',
          image: 'https://puu.sh/z8C0A/7a6c29f238.gif'
        },
        {
          title: 'Import the blueprint in Factorio',
          text: 'Now, you have your copied blueprint string. Open the Blueprint Library in Factorio and then click on Import string.<br/>In the textbox, paste the blueprint string and click on Import. It will give you a blueprint that you can place.',
          image: 'https://puu.sh/z8C3G/4917376c36.gif'
        }
      ]
    });
  });

  app.get('*', (req, res) => {
    res.redirect('/outpost');
  });
}

function LOG(...args) {
  console.log('[' + moment().format('MMMM Do YYYY, h:mm:ss a') + ']', ...args);
}
