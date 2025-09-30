import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document';
import { parse } from 'cookie';

type Theme = 'light' | 'dark';

const setInitialTheme = `
(function() {
  try {
    var theme = document.documentElement.dataset.theme;
    if (!theme) {
      var match = document.cookie.match(/(?:^|;\\s*)dark=([^;]+)/);
      var isDark = match && decodeURIComponent(match[1]) === 'true';
      theme = isDark ? 'dark' : 'light';
    }

    var applyTheme = function() {
      document.documentElement.dataset.theme = theme;
      if (document.body) {
        document.body.dataset.theme = theme;
      }
    };

    applyTheme();

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', applyTheme);
    }
  } catch (e) {
    // ignore errors and fall back to default theme
  }
})();
`;

class MyDocument extends Document<{ initialTheme?: Theme }> {
  render() {
    const theme = this.props.initialTheme ?? 'light';

    return (
      <Html data-theme={theme}>
        <Head>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
        </Head>
        <body data-theme={theme}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const initialProps = await Document.getInitialProps(ctx);

  let initialTheme: Theme = 'light';
  const cookieHeader = ctx.req?.headers.cookie;
  if (cookieHeader) {
    const cookies = parse(cookieHeader);
    if (cookies.dark === 'true') {
      initialTheme = 'dark';
    }
  }

  return { ...initialProps, initialTheme };
};

export default MyDocument;
