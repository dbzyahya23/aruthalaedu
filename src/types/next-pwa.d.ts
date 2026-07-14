declare module "next-pwa" {
  import type { NextConfig } from "next";
  type PWAConfig = Record<string, unknown>;
  function pwa(pluginConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export default pwa;
}

declare module "next-pwa/cache" {
  const runtimeCaching: Array<Record<string, unknown>>;
  export { runtimeCaching };
  export default runtimeCaching;
}
