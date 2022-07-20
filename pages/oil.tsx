import Footer from '../lib/Footer';
import Form from '../lib/Form/Form';
import { generateOilOutpost } from '../lib/generators/oil-outpost.generator';
import Header from '../lib/Header';
import { TILE_OPT } from '../lib/util/tileOpt';

export default function OilOutpost() {
  return (
    <div>
      <Header />
      <Form
        submitButton="submit_oil_outpost"
        generatorFunc={generateOilOutpost}
        content={[
          {
            type: 'textarea',
            name: 'blueprint',
            title: 'blueprint_string',
            placeholder: 'blueprint_string_placeholder',
            info: 'oil_blueprint_info',
          },
          {
            title: 'modded',
            checkbox: {
              name: 'modded',
              info: 'modded_info',
            },
          },
          {
            type: 'input',
            name: 'pumpjackName',
            title: 'custom_pumpjack',
            placeholder: 'example_pumpjack_name_2',
            info: 'custom_pumpjack_info',
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
            info: 'oil_modules_info',
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
            title: 'beacons',
            checkbox: {
              name: 'beacons',
            },
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
            type: 'input',
            name: 'locomotiveCount',
            title: 'loco_count',
            info: 'loco_count_info',
            placeholder: '1',
            activate: 'includeTrainStation',

            number: true,
            minimum: 1,
          },
          {
            type: 'input',
            name: 'wagonCount',
            title: 'fluid_wagon_count',
            placeholder: '2',
            activate: 'includeTrainStation',

            number: true,
            minimum: 1,
          },
          {
            type: 'input',
            name: 'tanks',
            title: 'tank_count',
            info: 'tank_count_info',
            placeholder: '2',
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
            info: 'Covers the entire area surrounded by the walls in the specified tile type.',
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
