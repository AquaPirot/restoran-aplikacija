/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Konfiguracija da se mysql2 koristi samo na server strani
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ne uključuj mysql2 i node modules u client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        mysql2: false,
      };
    }
    return config;
  },
};

export default nextConfig;