import fs from 'fs';

import { useI18n } from 'next-localization';

import { Pair, Result, useBlueprintTool } from '../lib/blueprint/useBlueprintTool';
import { cx, KitProvider, Toggle, useKit } from '../lib/kit/controls';
import * as F from '../lib/kit/fields';
import ItemPicker from '../lib/kit/ItemPicker';
import { icon } from '../lib/kit/options';
import { Count } from '../lib/preview/decode';
import { Disclaimer, Frame, s, Shell, usePageTitle } from '../lib/site/Shell';

// The blueprint tool: paste a blueprint or a book, pick what to change, and
// the changed string is ready to copy. Blueprints from Factorio 2.0 are
// edited without losing anything the tool does not touch.

type Props = {
  factorioItems: string[];
  factorioRecipes: string[];
  factorioModules: string[];
};

export default function BlueprintTool({ factorioItems, factorioRecipes, factorioModules }: Props) {
  const { tool, values, set, result } = useBlueprintTool();
  const i18n = useI18n();
  const t = (key: string, fallback: string) => i18n.t(key) || fallback;
  const modern = !!result.before?.modern;

  return (
    <KitProvider styles={s} tool={tool}>
      <Shell title={t('navbar.blueprint_tool', 'Blueprint Tool')}>
        <aside className={cx(s.panel, s.first)}>
          <Frame title={t('blueprint_string_or_book', 'Blueprint or Blueprint Book String')}>
            <F.PasteBox rows={3} />
            <Status result={result} />
          </Frame>

          <Frame title={t('ui.flip_and_fill', 'Flip and landfill')}>
            {modern ? (
              <p className={s.note}>
                {t(
                  'ui.modern_note',
                  'This blueprint is from Factorio 2.0, which flips blueprints itself (hold one and press H or V) and adds landfill when building over water.',
                )}
              </p>
            ) : (
              <>
                <Flip name="flipX" label={t('flip_x', 'Flip Along X Axis')} />
                <Flip name="flipY" label={t('flip_y', 'Flip Along Y Axis')} />
                <Toggle
                  label={t('landfill_entities', 'Landfill under entities')}
                  iconName="landfill"
                  checked={values.landfillEntities}
                  onChange={(checked) => set('landfillEntities', checked)}
                />
              </>
            )}
          </Frame>

          <Replacer
            title={t('ui.replace_entities', 'Replace entities')}
            items={factorioItems}
            value={values.entityReplacer}
            onChange={(pairs) => set('entityReplacer', pairs)}
          />
          <Replacer
            title={t('ui.replace_recipes', 'Replace recipes')}
            items={factorioRecipes}
            value={values.recipeReplacer}
            onChange={(pairs) => set('recipeReplacer', pairs)}
          />
          <Replacer
            title={t('ui.replace_modules', 'Replace modules')}
            items={factorioModules}
            value={values.moduleReplacer}
            onChange={(pairs) => set('moduleReplacer', pairs)}
          />

          <Frame title={t('ui.output', 'Output')}>
            <Toggle
              label={t('modified_only', 'Return Modified Only')}
              hint={t('modified_only_info', 'Only include entities in the blueprint that were modified')}
              checked={values.modifiedOnly}
              onChange={(checked) => set('modifiedOnly', checked)}
            />
          </Frame>
          <Disclaimer />
        </aside>

        <main className={cx(s.stage, s.after)}>
          <ResultFrame result={result} />
          <F.ConfirmBar share={false} />
        </main>
      </Shell>
    </KitProvider>
  );
}

function Status({ result }: { result: Result }) {
  const { t } = useKit();
  if (result.inputError) {
    return (
      <div className={cx(s.status, s.statusError)} role="alert">
        <span className={s.statusDot} />
        {result.inputError}
      </div>
    );
  }
  const before = result.before;
  return (
    <div className={cx(s.status, before && s.statusOk)}>
      <span className={s.statusDot} />
      {!before
        ? t('blueprint_tool_info', 'This is the blueprint(s) to modify.')
        : before.blueprints > 1
        ? t('ui.book_read', 'Book read: {{blueprints}} blueprints, {{entities}} entities', {
            blueprints: before.blueprints,
            entities: before.entities,
          })
        : t('ui.blueprint_read', 'Blueprint read: {{entities}} entities', { entities: before.entities })}
    </div>
  );
}

// A flip switch with a letter F that shows what the flip does.
function Flip({ name, label }: { name: 'flipX' | 'flipY'; label: string }) {
  const { o } = useKit();
  const on = !!o.values[name];
  return (
    <div className={s.flipRow}>
      <Toggle label={label} checked={on} onChange={(checked) => o.set(name, checked)} />
      <span
        className={s.flipDemo}
        style={{ transform: on ? (name === 'flipX' ? 'scaleX(-1)' : 'scaleY(-1)') : undefined }}
        aria-hidden="true"
      >
        F
      </span>
    </div>
  );
}

// A list of "replace this with that" rows.
function Replacer({
  title,
  items,
  value,
  onChange,
}: {
  title: string;
  items: string[];
  value: Pair[];
  onChange: (pairs: Pair[]) => void;
}) {
  const { t } = useKit();
  const targets = items.filter((item) => !item.startsWith('includes:'));
  const change = (index: number, changes: Partial<Pair>) =>
    onChange(value.map((pair, i) => (i === index ? { ...pair, ...changes } : pair)));

  return (
    <Frame title={title}>
      {value.map((pair, index) => (
        <div className={s.replaceRow} key={index}>
          <ItemPicker
            label={t('ui.replace_from', 'Replace')}
            items={items}
            value={pair.from}
            onChange={(from) => change(index, { from })}
          />
          <svg className={s.replaceArrow} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <ItemPicker
            label={t('ui.replace_to', 'With')}
            items={targets}
            value={pair.to}
            onChange={(to) => change(index, { to })}
          />
          <button
            type="button"
            className={s.removeBtn}
            aria-label={t('ui.remove', 'Remove')}
            title={t('ui.remove', 'Remove')}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        className={s.addBtn}
        onClick={() => onChange([...value, { from: items[0], to: targets[0] }])}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6h7M6 2.5v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {t('ui.add_replacement', 'Add a replacement')}
      </button>
    </Frame>
  );
}

function Inventory({ counts }: { counts?: Count[] }) {
  return (
    <ul className={s.bom}>
      {(counts ?? []).slice(0, 60).map((item) => (
        <li key={item.name} className={s.bomItem} title={item.name.split('-').join(' ')}>
          <img
            src={icon(item.icon)}
            alt={item.name.split('-').join(' ')}
            draggable={false}
            onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
          />
          <span>{item.count.toLocaleString('en-US')}</span>
        </li>
      ))}
    </ul>
  );
}

function ResultFrame({ result }: { result: Result }) {
  const { t } = useKit();
  const { before, after } = result;
  return (
    <Frame
      title={usePageTitle()}
      className={s.previewFrame}
      aside={
        <span className={s.readout}>
          {before && after
            ? t('ui.tool_readout', '{{before}} entities in, {{after}} out', {
                before: before.entities,
                after: after.entities,
              })
            : '\u00a0'}
        </span>
      }
    >
      <div className={s.result}>
        <div className={s.caption}>{t('ui.before', 'Before')}</div>
        <Inventory counts={before?.counts} />
        <div className={s.caption}>{t('ui.after', 'After')}</div>
        <Inventory counts={after?.counts} />
        <div className={s.caption}>{t('ui.result', 'Result')}</div>
        {result.error && !result.inputError ? (
          <div className={cx(s.status, s.statusError)} role="alert">
            <span className={s.statusDot} />
            {result.error}
          </div>
        ) : (
          <textarea
            className={cx(s.textarea, s.resultText)}
            readOnly
            spellCheck={false}
            aria-label={t('ui.result', 'Result')}
            placeholder={t('ui.result_placeholder', 'The changed blueprint string appears here.')}
            value={result.output ?? ''}
            onFocus={(e) => e.target.select()}
          />
        )}
      </div>
    </Frame>
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
