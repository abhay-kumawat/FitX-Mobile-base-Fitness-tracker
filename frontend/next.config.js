/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/meals', destination: '/meal-planner', permanent: true },
      { source: '/vitals', destination: '/wearables', permanent: true },
      { source: '/social', destination: '/community', permanent: true },
      { source: '/schedule', destination: '/calendar', permanent: true },
      { source: '/journal', destination: '/timeline', permanent: true },
      { source: '/settings', destination: '/profile', permanent: true },
      { source: '/home', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;


