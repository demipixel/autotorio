import '../styles/globals.css';
import '../styles/dark-mode.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { useEffect, useState } from 'react';

import { I18nProvider } from 'next-localization';
import { CookiesProvider, useCookies } from 'react-cookie';

import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';

import Localisations from '../lib/localisation.json';

const normalTheme = createTheme({});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <CookiesProvider>
      <InsideCookieProvider>
        <Component {...pageProps} />
      </InsideCookieProvider>
    </CookiesProvider>
  );
}

function InsideCookieProvider({ children }: { children: JSX.Element }) {
  const [cookie] = useCookies(['language', 'dark']);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    if (cookie.language) {
      setLocale(cookie.language);
    }
  }, [cookie.language]);

  return (
    <I18nProvider
      lngDict={getLocaleForLang(Localisations, locale) as Locale}
      locale={locale}
    >
      <ThemeProvider theme={cookie.dark === 'true' ? darkTheme : normalTheme}>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}

type Locale = { [key: string]: Locale | string };
function getLocaleForLang(locale: Locale, lang: string): Locale | string {
  const firstKey = Object.keys(locale)[0];
  if (typeof locale[firstKey] === 'string') {
    return locale[lang];
  } else {
    return Object.fromEntries(
      Object.entries(locale).map(([key, value]) => [
        key,
        getLocaleForLang(value as Locale, lang),
      ]),
    );
  }
}

export default MyApp;
