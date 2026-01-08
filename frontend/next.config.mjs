/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow access from any IP in development
  // Allow access from LAN IP in development
  server: {
    allowedOrigins: ["192.168.1.3:3000"],
  },
}

export default nextConfig
