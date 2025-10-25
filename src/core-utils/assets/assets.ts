import {Assets, AssetsManifest, UnresolvedAsset} from "pixi.js";

/** List of assets grouped in bundles, for dynamic loading */
let assetsManifest: AssetsManifest = { bundles: [] };

/** Store bundles already loaded */
const loadedBundles: string[] = [];

 async function fetchAssetsManifest(url: string) {
    const response = await fetch(url);
    const manifest = await response.json();
    if (!manifest.bundles) {
        throw new Error('[Assets] Invalid assets manifest');
    }
    return manifest;
}

/** Check if a bundle exists in assetManifest  */
function checkBundleExists(bundle: string) {
    return !!assetsManifest.bundles.find((b) => b.name === bundle);
}

/** Load assets bundles that have nott been loaded yet */
export async function loadBundles(bundles: string | string[]) {
    if (typeof bundles === 'string') bundles = [bundles];

    // Check bundles requested if they exists
    for (const bundle of bundles) {
        if (!checkBundleExists(bundle)) {
            throw new Error(`[Assets] Invalid bundle: ${bundle}`);
        }
    }

    // Filter out bundles already loaded
    const loadList = bundles.filter((bundle) => !loadedBundles.includes(bundle));

    // Skip if there is no bundle left to be loaded
    if (!loadList.length) return;

    // Load bundles
    console.log('[Assets] Load:', loadList.join(', '));
    await Assets.loadBundle(loadList);

    // Append loaded bundles to the loaded list
    loadedBundles.push(...loadList);
}

function isBundleLoaded(bundleName: string) {
    const bundleManifest = assetsManifest.bundles.find((b: { name: string; }) => b.name === bundleName);

    if (!bundleManifest) {
        return false;
    }

    for (const asset of bundleManifest.assets as UnresolvedAsset[]) {
        if (!Assets.cache.has(asset.alias as string)) {
            return false;
        }
    }

    return true;
}

export function areBundlesLoaded(bundles: string[]) {
    for (const name of bundles) {
        if (!isBundleLoaded(name)) {
            return false;
        }
    }

    return true;
}

export async function initLoader() {
    // Load assets manifest
    assetsManifest = await fetchAssetsManifest('assets/assets-manifest.json');

    // Init PixiJS assets with this asset manifest
    await Assets.init({ manifest: assetsManifest, basePath: 'assets' });

    // Load assets for the load screen
    await loadBundles('preload');

    // List all existing bundles names
    const allBundles = assetsManifest.bundles.map((item) => item.name);

    // Start up background loading of all bundles
    await Assets.backgroundLoadBundle(allBundles);
}
