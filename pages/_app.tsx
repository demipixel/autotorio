import '../styles/globals.css';
import '../styles/dark-mode.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { useEffect, useMemo } from 'react';

import { I18nProvider } from 'next-localization';
import App, { AppContext, AppProps } from 'next/app';
import { Cookies, CookiesProvider, useCookies } from 'react-cookie';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Localisations from '../lib/localisation.json';

const primaryColor = '#0c84e4';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: primaryColor },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: primaryColor },
  },
});

type Extra = { cookieHeader?: string };
type Props = AppProps & Extra;

function MyApp({ Component, pageProps, cookieHeader }: Props) {
  const cookies = useMemo(
    () =>
      typeof window === 'undefined'
        ? new Cookies(cookieHeader) // server
        : new Cookies(), // browser
    [cookieHeader],
  );

  return (
    <CookiesProvider cookies={cookies}>
      <InsideCookieProvider>
        <Component {...pageProps} />
      </InsideCookieProvider>
    </CookiesProvider>
  );
}

MyApp.getInitialProps = async (appCtx: AppContext) => {
  const appProps = await App.getInitialProps(appCtx);
  const cookieHeader = appCtx.ctx.req?.headers.cookie ?? '';
  return { ...appProps, cookieHeader };
};

export default MyApp;

function InsideCookieProvider({ children }: { children: JSX.Element }) {
  const [cookie] = useCookies(['language', 'dark']);

  const theme = useMemo(
    () => (cookie.dark === 'true' ? darkTheme : lightTheme),
    [cookie.dark],
  );

  useEffect(() => {
    const themeName = cookie.dark === 'true' ? 'dark' : 'light';
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.theme = themeName;
    if (document.body) {
      document.body.dataset.theme = themeName;
    }
  }, [cookie.dark]);

  const locale = cookie.language ?? 'en';

  return (
    <I18nProvider
      lngDict={getLocaleForLang(Localisations, locale) as Locale}
      locale={locale}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
  }
  return Object.fromEntries(
    Object.entries(locale).map(([key, value]) => [
      key,
      getLocaleForLang(value as Locale, lang),
    ]),
  );
}
