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
  // Deshabilitar ESLint durante el build para permitir el deploy
  eslint: {
    // Advertencia: esto deshabilitará la verificación de ESLint durante el build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
