import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vite";
import { getBuildConfig, getBuildDefine, external, pluginHotRestart } from "./vite.base.config";
import fs from "fs";

// https://vitejs.dev/config
export default defineConfig((env) => {
    const forgeEnv = env as ConfigEnv<"build">;
    const { forgeConfigSelf } = forgeEnv;
    const define = getBuildDefine(forgeEnv);
    const config: UserConfig = {
        build: {
            lib: {
                entry: forgeConfigSelf.entry!,
                fileName: () => "[name].js",
                formats: ["cjs"],
            },
            rollupOptions: {
                external,
            },
        },
        plugins: [pluginHotRestart("restart")],
        define,
        resolve: {
            // Load the Node.js entry.
            mainFields: ["module", "jsnext:main", "jsnext"],
        },
        server: {
            https: {
                key: fs.readFileSync("config/certs/local.mtt.xyz+5-key.pem"),
                cert: fs.readFileSync("config/certs/local.mtt.xyz+5.pem"),
            },
            port: 443,
        },
    };

    return mergeConfig(getBuildConfig(forgeEnv), config);
});
