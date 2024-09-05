/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['edujsgames.s3.eu-north-1.amazonaws.com'],
    },
    experimental: {
      serverActions: {
        bodySizeLimit: '30mb',
      },
    },
  };
  
  export default nextConfig;
