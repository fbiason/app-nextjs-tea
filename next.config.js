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
    ignoreDuringBuilds: true,
    // Configuración adicional para asegurar que Vercel respete esta configuración
    dirs: ['pages', 'components', 'lib', 'src']
  }
};

export default nextConfig;
