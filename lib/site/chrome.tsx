import { useEffect, useRef, useState } from 'react';

import { useI18n } from 'next-localization';
import { useCookies } from 'react-cookie';

import { GlobeIcon } from './Icons';
import { useHydrated } from './useHydrated';

// Site-level pieces of the window chrome: the tools as navigation and the
// language menu.

export const NAV = [
  { key: 'navbar.outpost_generator', label: 'Outpost Generator', href: '/outpost' },
  { key: 'navbar.oil_outpost_generator', label: 'Oil Outpost Generator', href: '/oil' },
  { key: 'navbar.blueprint_tool', label: 'Blueprint Tool', href: '/blueprint' },
];

export const LANGUAGES = [
  ['English', 'en'],
  ['Español', 'es'],
  ['Português (BR)', 'pt-br'],
  ['Français', 'fr'],
  ['Italiano', 'it'],
  ['Deutsch', 'de'],
  ['Polski', 'pl'],
  ['中文', 'cn'],
  ['Русский', 'ru'],
];

export function useChrome() {
  const i18n = useI18n();
  const [cookie, setCookie] = useCookies(['language']);
  // the cookie is only known in the browser, so the built page starts in English
  const language = (useHydrated() && cookie.language) || 'en';

  return {
    language,
    languageName: LANGUAGES.find(([, code]) => code === language)?.[0] ?? 'English',
    setLanguage: (code: string) => setCookie('language', code, { path: '/' }),
    nav: NAV.map((page) => ({ ...page, label: i18n.t(page.key) || page.label })),
  };
}

type Styles = { readonly [key: string]: string };

export function LanguageMenu({ s }: { s: Styles }) {
  const { language, languageName, setLanguage } = useChrome();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className={s.lang} ref={ref}>
      <button
        type="button"
        className={s.chromeBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <GlobeIcon size={15} />
        <span>{languageName}</span>
      </button>
      {open && (
        <div className={s.menu} role="menu">
          {LANGUAGES.map(([name, code]) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === language}
              className={s.menuItem + (code === language ? ' ' + s.on : '')}
              onClick={() => {
                setLanguage(code);
                setOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
