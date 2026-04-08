import path from "path";
import type { Plugin } from "vite";
import packageJson from "../../package.json" with { type: "json" };

const SRC_PATH = path.resolve(import.meta.dirname, "..");

export default function vitePresets(): Plugin[] {
  return [
    {
      name: `${packageJson.name}:alias`,
      resolveId: {
        order: "pre",
        async handler(source, importer, options) {
          if (!source.startsWith("@/") || !importer) return;
          if (!importer.startsWith(SRC_PATH + "/")) return;

          const resolved = path.join(SRC_PATH, source.slice(2));
          return this.resolve(resolved, importer, {
            ...options,
            skipSelf: true,
          });
        },
      },
    },
  ];
}
