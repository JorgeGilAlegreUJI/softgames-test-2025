import { Assets, AssetsManifest} from "pixi.js";

export class LoaderSystem {
    private static assetsManifest: AssetsManifest;
    private static loadedBundles: string[] = [];

    private static async fetchAssetsManifest(url: string) {
        const response = await fetch(url);
        const manifest = await response.json();
        if (!manifest.bundles) {
            throw new Error('[Assets] Invalid assets manifest');
        }
        return manifest;
    }

    /** Check if a bundle exists in assetManifest  */
    private static checkBundleExists(bundle: string) {
        return !!this.assetsManifest.bundles.find((b) => b.name === bundle);
    }

    /** Load assets bundles that have nott been loaded yet */
    private static async loadBundles(bundles: string | string[]) {
        if (typeof bundles === 'string') bundles = [bundles];

        // Check bundles requested if they exists
        for (const bundle of bundles) {
            if (!this.checkBundleExists(bundle)) {
                throw new Error(`[Assets] Invalid bundle: ${bundle}`);
            }
        }

        // Filter out bundles already loaded
        const loadList = bundles.filter((bundle) => !this.loadedBundles.includes(bundle));

        // Skip if there is no bundle left to be loaded
        if (!loadList.length) return;

        // Load bundles
        console.log('[Assets] Load:', loadList.join(', '));
        await Assets.loadBundle(loadList);

        // Append loaded bundles to the loaded list
        this.loadedBundles.push(...loadList);
    }


    static async init() {
        // Load assets manifest
        this.assetsManifest = await this.fetchAssetsManifest('assets/assets-manifest.json');

        // Init PixiJS assets with this asset manifest
        await Assets.init({ manifest: this.assetsManifest, basePath: 'assets' });

        // Load assets for the load screen
        await this.loadBundles('preload');

        // List all existing bundles names
        const allBundles = this.assetsManifest.bundles.map((item) => item.name);

        // Start up background loading of all bundles
        await Assets.backgroundLoadBundle(allBundles);
    }
}
