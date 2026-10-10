import '../styles/globals.css';
// Titillium Web is the game's own interface font; JetBrains Mono is for
// blueprint strings
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/titillium-web/400.css';
import '@fontsource/titillium-web/600.css';
import '@fontsource/titillium-web/700.css';

import { I18nProvider } from 'next-localization';
import type { AppProps } from 'next/app';
import { CookiesProvider, useCookies } from 'react-cookie';
import ReactGA from 'react-ga4';

import Localisations from '../lib/localisation.json';
import { useHydrated } from '../lib/site/useHydrated';

ReactGA.initialize('G-63G9G48L19');

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CookiesProvider>
      <Translated>
        <Component {...pageProps} />
      </Translated>
    </CookiesProvider>
  );
}

function Translated({ children }: { children: React.ReactNode }) {
  const [cookie] = useCookies(['language']);
  // Pages are built in English. The visitor's language is only known in the
  // browser, so it applies once the built page has been hydrated.
  const locale = (useHydrated() && cookie.language) || 'en';

  return (
    <I18nProvider lngDict={getLocaleForLang(Localisations, locale) as Locale} locale={locale}>
      {children}
    </I18nProvider>
  );
}

type Locale = { [key: string]: Locale | string };

// The translations file nests every text under its language; this picks one
// language out of the whole tree.
function getLocaleForLang(locale: Locale, lang: string): Locale | string {
  const firstKey = Object.keys(locale)[0];
  if (typeof locale[firstKey] === 'string') {
    return locale[lang] ?? locale.en;
  }
  return Object.fromEntries(
    Object.entries(locale).map(([key, value]) => [key, getLocaleForLang(value as Locale, lang)]),
  );
}
