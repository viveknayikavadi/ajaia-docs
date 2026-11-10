/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // mammoth (used for .docx import) runs as a normal Node dependency on the server
    serverComponentsExternalPackages: ['mammoth'],
    // Always fetch fresh data when navigating back to the document list
    staleTimes: { dynamic: 0 },
  },
};

export default nextConfig;
