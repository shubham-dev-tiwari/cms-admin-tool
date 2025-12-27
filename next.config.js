// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  //images: {
  //  domains: ['ai.arlox.io'],
  //  domains: ['uploads-ssl.webflow.com'],
  //},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};
module.exports = nextConfig;
