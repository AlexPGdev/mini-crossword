import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'default',
    path: '/', // you can leave default
  },
  allowedDevOrigins: ['192.168.178.47'],
};

export default nextConfig;