import '../styles/globals.css';
import '../styles/dark-mode.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { useMemo } from 'react';

import { I18nProvider } from 'next-localization';
import App, { AppContext, AppProps } from 'next/app';
import { Cookies, CookiesProvider, useCookies } from 'react-cookie';

import { createTheme, ThemeProvider } from '@mui/material';

import Localisations from '../lib/localisation.json';

const normalTheme = createTheme({});
const darkTheme = createTheme({ palette: { mode: 'dark' } });

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
    () => (cookie.dark === 'true' ? darkTheme : normalTheme),
    [cookie.dark],
  );

  const locale = cookie.language ?? 'en';

  return (
    <I18nProvider
      lngDict={getLocaleForLang(Localisations, locale) as Locale}
      locale={locale}
    >
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
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
