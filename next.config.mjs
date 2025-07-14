/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/py/:path*',
        destination: '/api/index.py',
      },
    ];
  },
};

export default nextConfig;