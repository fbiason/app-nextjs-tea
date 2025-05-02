/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['tea-donaciones.loca.lt'],
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
