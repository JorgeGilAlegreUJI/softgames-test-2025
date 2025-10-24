import {Assets} from "pixi.js";

export class LoaderSystem {

    static async init(): Promise<void> {
        console.log("Starting to preload assets...");

        try {
            await Assets.load([
                "/raw-assets/bunny.png"
            ]);
            console.log("Assets loaded successfully.");
        }catch (error) {
            console.error("Failed to load raw-assets:", error);
        }
    }
}