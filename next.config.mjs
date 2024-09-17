/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'edujsgames.s3.eu-north-1.amazonaws.com',
          pathname: '/**',
        },
      ]    },
    experimental: {
      serverActions: {
        bodySizeLimit: '30mb',
      },
    },
    trailingSlash: true,
  };
  
  export default nextConfig;
