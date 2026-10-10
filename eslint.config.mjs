import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    rules: {
      // images are plain <img>: next/image needs a server, the site is static
      '@next/next/no-img-element': 'off',
    },
  },
  { ignores: ['.next/**', 'out/**', 'vendor/**', 'next-env.d.ts'] },
];

export default config;
