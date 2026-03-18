import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'default',
    path: '/', // you can leave default
  },
};

export default nextConfig;