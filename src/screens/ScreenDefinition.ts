export class ScreenDefinition {
    readonly screenId: string;
    readonly assetBundles?: string[];
    constructor(screenId: string, assetBundles?: string[] ) {
        this.screenId = screenId;
        this.assetBundles = assetBundles;
    }
}