import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#313031" />
        <meta
          name="description"
          content="Free Factorio blueprint tools: generate ore and oil outposts with train stations and defenses, and swap entities, recipes, and modules in blueprints."
        />
        <meta property="og:site_name" content="Autotorio" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Autotorio | Factorio Blueprint Tools" />
        <meta
          property="og:description"
          content="Generate ore and oil outposts with train stations and defenses, and swap entities, recipes, and modules in blueprints."
        />
        <meta property="og:image" content="https://autotorio.com/icon-192.png" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
