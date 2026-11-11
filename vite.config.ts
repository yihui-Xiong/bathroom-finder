import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const offlineData = ["bryant-park-restroom.jpg", "favicon.png", "nyc-restrooms.json"];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "bathroom-finder-offline-shell",
      apply: "build",
      enforce: "post",
      generateBundle(_options, bundle) {
        const template = readFileSync(new URL("./src/service-worker.js", import.meta.url), "utf8");
        const files = ["index.html", ...offlineData, ...Object.keys(bundle)].sort();
        const uniqueFiles = [...new Set(files)];
        const hash = createHash("sha256").update(template).update(JSON.stringify(uniqueFiles));
        for (const name of offlineData) {
          hash.update(readFileSync(new URL(`./public/${name}`, import.meta.url)));
        }
        hash.update(readFileSync(new URL("./index.html", import.meta.url)));
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: template
            .replace("__BUILD_VERSION__", hash.digest("hex").slice(0, 20))
            .replace("__APP_FILES__", JSON.stringify(uniqueFiles)),
        });
      },
    },
  ],
});
