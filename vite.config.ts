// vite.config.ts
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { AssetPack, type AssetPackConfig } from '@assetpack/core';

function assetPackPlugin(): Plugin {
    const apConfig: AssetPackConfig = {
        entry: './raw-assets',
        pipes: [
            //AssetPack.pipes.generateManifest({ filename: 'assets-manifest.json' }),
        ],
    };
    let mode: ResolvedConfig['command'];
    let ap: AssetPack | undefined;

    return {
        name: 'vite-plugin-assetpack',
        configResolved(resolvedConfig) {
            mode = resolvedConfig.command;
            if (!resolvedConfig.publicDir) return;
            if (apConfig.output) return;

            // Output to public/assets so Vite copies to dist/assets
            apConfig.output = path.join(resolvedConfig.publicDir, 'assets');
        },
        buildStart: async () => {
            if (mode === 'serve') {
                if (ap) return;
                ap = new AssetPack(apConfig);
                void ap.watch();
            } else {
                await new AssetPack(apConfig).run();
            }
        },
        buildEnd: async () => {
            if (ap) {
                await ap.stop();
                ap = undefined;
            }
        },
    };
}

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        assetPackPlugin(),
    ],
    server: {
        port: 8080,
        open: true,
    },
});
