import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  basePath: '/mini-crossword',

  assetPrefix: '/mini-crossword/',

  images: {
    loader: 'default',
    path: '/mini-crossword/',
  },
};

export default nextConfig;
