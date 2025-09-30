import Document, { Html, Head, Main, NextScript } from 'next/document';

const setInitialTheme = `
(function() {
  try {
    var match = document.cookie.match(/(?:^|;\\s*)dark=([^;]+)/);
    if (match && decodeURIComponent(match[1]) === 'true') {
      document.documentElement.classList.add('dark-mode');
      if (document.body) {
        document.body.classList.add('dark-mode');
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          document.body.classList.add('dark-mode');
        });
      }
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
