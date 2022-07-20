import fs from 'fs';

import Footer from '../lib/Footer';
import Form from '../lib/Form/Form';
import { blueprintTool } from '../lib/generators/blueprint-tool.generator';
import Header from '../lib/Header';

type Props = {
  factorioItems: string[];
  factorioRecipes: string[];
  factorioModules: string[];
};

export default function BlueprintTool({
  factorioItems,
  factorioRecipes,
  factorioModules,
}: Props) {
  return (
    <div>
      <Header />
      <Form
        submitButton="submit_blueprint"
        generatorFunc={blueprintTool}
        content={[
          {
            type: 'textarea',
            name: 'blueprint',
            title: 'blueprint_string_or_book',
            placeholder: 'blueprint_string_or_book_placeholder',
            info: 'blueprint_tool_info',
          },
          {
            title: 'flip_x',
            checkbox: {
              name: 'flipX',
            },
          },
          {
            title: 'flip_y',
            checkbox: {
              name: 'flipY',
            },
          },
          {
            title: 'landfill_entities',
            checkbox: {
              name: 'landfillEntities',
            },
          },
          {
            type: 'replacer',
            replacer: 'entities',
            name: 'entityReplacer',
            items: factorioItems,
          },
          { type: 'hr' },
          {
            type: 'replacer',
            replacer: 'recipes',
            name: 'recipeReplacer',
            items: factorioRecipes,
          },
          { type: 'hr' },
          {
            type: 'replacer',
            replacer: 'modules',
            name: 'moduleReplacer',
            items: factorioModules,
          },
          { type: 'hr' },
          {
            title: 'modified_only',
            checkbox: {
              name: 'modifiedOnly',
              info: 'modified_only_info',
            },
          },
        ]}
      />
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const PREVENT_KEYWORD = [
    // Ignore icons for such items
    'worm',
    'spitter',
    'biter',
    'alien',
    'coral',
    'pita',
    'grass',
    'asterisk',
    'bush',
    'dirt',
    'tree',
    'fluff',
    'cane',
    'trunk',
    'garballo',
    'root',
    'remnants',
    'loader',
    'scorchmark',
    'wreck',
    'water',
    'market',
    'player',
    'plane',
    'coin',
    'background',
    'computer',
    'immunity',
    'crude-oil',
  ];
  let factorioItems = [
    'includes:transport-belt',
    'includes:underground-belt',
    'includes:splitter',
  ];
  let factorioRecipes = [];
  let factorioModules = [
    'includes:module',
    'includes:effectivity-module',
    'includes:productivity-module',
    'includes:speed-module',
  ];

  const files = fs.readdirSync('./public/img/factorio-icons/');
  const items = files
    .filter((file) => file.slice(-4) == '.png')
    .filter((file) => {
      let ret = true;
      PREVENT_KEYWORD.forEach((keyword) => {
        if (!ret) return;
        if (file.includes(keyword)) ret = false;
      });
      return ret;
    })
    .map((file) => file.slice(0, -4));

  factorioItems = factorioItems.concat(items);
  factorioRecipes = factorioRecipes.concat(items);

  factorioModules = factorioModules.concat(
    factorioItems.filter((item) => item.includes('module')).sort(),
  );

  return {
    props: {
      factorioItems,
      factorioRecipes,
      factorioModules,
    } as Props,
  };
}
