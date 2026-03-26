/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ["pg"],
    serverComponentsExternalPackages: ["pg"],
  },
};
export default nextConfig;