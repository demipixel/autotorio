import Head from 'next/head';

import Footer from '../lib/Footer';
import Form from '../lib/Form/Form';
import { generateOreOutpost } from '../lib/generators/ore-outpost.generator';
import Header from '../lib/Header';
import { TILE_OPT } from '../lib/util/tileOpt';

export default function Outpost() {
  return (
    <div>
      <Header />
      <Head>
        <title>Oil Outpost Generator</title>
      </Head>
      <Form
        submitButton="submit_ore_outpost"
        generatorFunc={generateOreOutpost}
        content={[
          {
            type: 'textarea',
            name: 'blueprint',
            title: 'blueprint_string',
            placeholder: 'blueprint_string_placeholder',
            info: 'blueprint_string_info',
          },
          {
            title: 'modded',
            checkbox: {
              name: 'modded',
              info: 'modded_info',
            },
          },
          {
            type: 'select',
            name: 'belt_type',
            title: 'belt_type',
            options: [
              [0, 'entities.transport_belt'],
              ['fast', 'entities.fast_transport_belt'],
              ['express', 'entities.express_transport_belt'],
            ],
            default: 2,
            checkbox: {
              name: 'undergroundBelts',
              info: 'underground_belts_info',
            },
          },
          {
            activate: 'undergroundBelts',
            checkbox: {
              name: 'compact',
              info: 'compact',
            },
          },
          {
            type: 'input',
            name: 'custom_belt_type',
            title: 'custom_belt_type',
            placeholder: 'example_transport_belt',
            info: 'custom_belt_type_info',
            activate: 'modded',
          },
          {
            type: 'select',
            name: 'trainSide',
            title: 'train_station_side',
            options: [
              [1, 'right'],
              [3, 'left'],
              [0, 'top'],
              [2, 'bottom'],
            ],
          },
          {
            type: 'select',
            name: 'trainDirection',
            title: 'train_enter_from',
            options: [
              [2, 'bottom'],
              [0, 'top'],
              [1, 'right'],
              [3, 'left'],
            ],
          },
          {
            type: 'select',
            name: 'minerSpace',
            title: 'miner_space',
            options: ['0', '1', '2', '3', '4', '5'],
            default: 1,
            info: 'miner_space_info',
          },
          {
            type: 'select',
            name: 'minerSize',
            title: 'custom_mining_drill_size',
            options: ['3', '4', '5'],
            default: 3,
            info: 'custom_mining_drill_size_info',
          },
          {
            type: 'input',
            name: 'miningDrillName',
            title: 'custom_mining_drill',
            placeholder: 'example_mining_drill',
            info: 'custom_mining_drill_info',
            activate: 'modded',
          },
          {
            type: 'select',
            name: 'module',
            title: 'modules',
            options: [
              ['None', 'none'],
              ['Speed Module', 'entities.speed_module'],
              ['Speed Module 2', 'entities.speed_module', ' 2'],
              ['Speed Module 3', 'entities.speed_module', ' 3'],
              ['Effectivity Module', 'entities.effectivity_module'],
              ['Effectivity Module 2', 'entities.effectivity_module', ' 2'],
              ['Effectivity Module 3', 'entities.effectivity_module', ' 3'],
              ['Productivity Module', 'entities.productivity_module'],
              ['Productivity Module 2', 'entities.productivity_module', ' 2'],
              ['Productivity Module 3', 'entities.productivity_module', ' 3'],
            ],
            info: 'modules_info',
          },
          {
            type: 'input',
            name: 'customModule',
            title: 'custom_module',
            placeholder: 'example_module_name_2',
            info: 'custom_module_info',
            activate: 'modded',
          },
          {
            title: 'stack_inserters',
            checkbox: {
              name: 'useStackInserters',
              info: 'stack_inserters_info',
              checked: true,
            },
          },
          {
            title: 'filter_inserters',
            checkbox: {
              name: 'useFilterInserters',
              info: 'filter_inserters_info',
              checked: false,
            },
          },
          {
            title: 'radar',
            checkbox: {
              name: 'includeRadar',
              checked: true,
            },
          },
          {
            title: 'lights',
            checkbox: {
              name: 'includeLights',
              checked: true,
            },
          },
          {
            type: 'textarea',
            name: 'balancer',
            title: 'balancer',
            placeholder: 'balancer_placeholder',
            info: 'balancer_info',
          },
          {
            type: 'header',
            title: 'bots',
          },
          {
            title: 'bot_based',
            checkbox: {
              name: 'botBased',
              info: 'bot_based_info',
            },
          },
          {
            type: 'select',
            name: 'requestItem',
            title: 'ore_type',
            options: ['Iron Ore', 'Copper Ore', 'Coal', 'Stone', 'Uranium Ore'],
            info: 'ore_type_info',
            activate: 'botBased',
          },
          {
            type: 'input',
            name: 'customRequestItem',
            title: 'custom_ore_type',
            placeholder: 'example_ore',
            info: 'custom_ore_type_info',
            activate: 'mod bots',
          },
          {
            type: 'input',
            name: 'requestAmount',
            title: 'request_amount',
            placeholder: '4800',
            number: true,
            minimum: 1,
            activate: 'botBased',
          },
          {
            title: 'roboports',
            checkbox: {
              name: 'roboports',
              info: 'roboports_info',
            },
            activate: 'botBased',
          },
          {
            type: 'header',
            title: 'defenses',
          },
          {
            type: 'select',
            name: 'turretType',
            title: 'turret_type',
            options: [
              ['none', 'none'],
              ['gun_turrets', 'entities.gun_turrets'],
              ['laser_turrets', 'entities.laser_turrets'],
            ],
            default: 2,
          },
          {
            type: 'input',
            name: 'turretSpacing',
            title: 'turret_spacing',
            placeholder: '8',

            number: true,
            minimum: 2,
            maximum: 9,
          },
          {
            title: 'walls',
            checkbox: {
              name: 'walls',
              checked: true,
            },
          },
          {
            type: 'input',
            name: 'wallThickness',
            title: 'wall_thickness',
            placeholder: '1',
            activate: 'walls',

            number: true,
            minimum: 1,
          },
          {
            type: 'input',
            name: 'wallSpace',
            title: 'wall_space',
            placeholder: '5',
            info: 'wall_space_info',

            number: true,
            minimum: 3,
          },
          {
            type: 'header',
            title: 'train_info',
          },
          {
            title: 'train_station',
            checkbox: {
              name: 'includeTrainStation',
              checked: true,
            },
          },
          {
            title: 'exit_route',
            checkbox: {
              name: 'exitRoute',
              info: 'exit_route_info',
            },
            activate: 'includeTrainStation',
          },
          {
            title: 'double_loading',
            checkbox: {
              name: 'doubleLoading',
              info: 'double_loading_info',
            },
            activate: 'includeTrainStation',
          },
          {
            type: 'input',
            name: 'locomotiveCount',
            title: 'loco_count',
            info: 'loco_count_info',
            placeholder: '2',
            activate: 'includeTrainStation',

            number: true,
            minimum: 1,
          },
          {
            type: 'input',
            name: 'cargoWagonCount',
            title: 'wagon_count',
            placeholder: '4',
            activate: 'includeTrainStation',

            number: true,
            minimum: 1,
          },
          {
            type: 'header',
            title: 'tiles',
          },
          {
            type: 'select',
            name: 'concrete',
            title: 'tiles',
            options: TILE_OPT,
            info: 'tiles_info',
          },
          {
            type: 'input',
            name: 'customConcrete',
            title: 'custom_tiles',
            placeholder: 'example_concrete',
            info: 'custom_tiles_info',
            activate: 'modded',
          },
          {
            type: 'select',
            name: 'borderConcrete',
            title: 'border_tiles',
            options: TILE_OPT,
            info: 'border_tiles_info',
          },
          {
            type: 'input',
            name: 'customBorderConcrete',
            title: 'custom_border_tiles',
            placeholder: 'example_concrete',
            info: 'custom_tiles_info',
            activate: 'modded',
          },
          {
            type: 'select',
            name: 'trackConcrete',
            title: 'track_tiles',
            options: TILE_OPT,
            info: 'track_tiles_info',
          },
          {
            type: 'input',
            name: 'customTrackConcrete',
            title: 'custom_track_tiles',
            placeholder: 'example_concrete',
            info: 'custom_tiles_info',
            activate: 'modded',
          },
        ]}
      />
      <Footer />
    </div>
  );
}
