/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The site is plain static files: `next build` writes them to out/.
  // (Redirects are not available in a static export; pages/index.tsx sends
  // visitors of "/" to the outpost generator.)
  output: 'export',
};

module.exports = nextConfig;
