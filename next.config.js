/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/outpost',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
