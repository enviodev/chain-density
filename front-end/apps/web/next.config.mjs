/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  serverExternalPackages: ["@envio-dev/hypersync-client"],
}

export default nextConfig
