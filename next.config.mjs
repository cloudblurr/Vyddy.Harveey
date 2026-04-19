const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
    serverComponentsExternalPackages: ["archiver"],
  },
};

export default nextConfig;
