import Document, { Html, Head, Main, NextScript } from 'next/document';

const setInitialTheme = `
(function() {
  try {
    var match = document.cookie.match(/(?:^|;\\s*)dark=([^;]+)/);
    var isDark = match && decodeURIComponent(match[1]) === 'true';
    var theme = isDark ? 'dark' : 'light';

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

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
