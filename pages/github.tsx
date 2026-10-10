import { useI18n } from 'next-localization';

import { Disclaimer, Frame, s, Shell } from '../lib/site/Shell';

// Where the code lives and how to reach the author.

const repos = [
  {
    name: 'autotorio',
    url: 'https://github.com/demipixel/autotorio',
    description:
      'This website. Report issues with the site itself (UI, translations, pages) here.',
  },
  {
    name: 'factorio-generators',
    url: 'https://github.com/demipixel/factorio-generators',
    description:
      'The generators used on this website. Report issues or feature requests for the outpost and blueprint tools here.',
  },
  {
    name: 'factorio-blueprint',
    url: 'https://github.com/demipixel/factorio-blueprint',
    description:
      'The blueprint library used by the generators. Probably only developers care about this one.',
  },
];

export default function GitHub() {
  const i18n = useI18n();
  const t = (key: string, fallback: string) => i18n.t(key) || fallback;
  return (
    <Shell title={t('ui.source_code', 'Source code')} kind="doc">
      <Frame title={t('ui.source_code', 'Source code')}>
        <ul className={s.linkList}>
          {repos.map((repo) => (
            <li key={repo.name}>
              <a href={repo.url} target="_blank" rel="noreferrer">
                {repo.name}
              </a>
              <span>{repo.description}</span>
            </li>
          ))}
        </ul>
      </Frame>
      <Frame title={t('ui.contact', 'Contact')}>
        <ul className={s.linkList}>
          <li>
            <a href="https://www.reddit.com/user/DemiPixel" target="_blank" rel="noreferrer">
              /u/DemiPixel
            </a>
            <span>Reddit</span>
          </li>
          <li>
            <strong>DemiPixel#5243</strong>
            <span>Discord</span>
          </li>
        </ul>
      </Frame>
      <Disclaimer />
    </Shell>
  );
}
