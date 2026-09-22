// Nur für die lokale Entwicklung: `npx remotion studio src/remotion/index.ts`
// Die veröffentlichte App nutzt den Player und den Browser-Renderer.
import { Config } from "@remotion/cli/config";
import path from "path";

Config.setVideoImageFormat("jpeg");
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      "@": path.resolve(process.cwd(), "src"),
    },
  },
}));
