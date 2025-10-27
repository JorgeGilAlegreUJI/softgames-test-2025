import {Container, Ticker} from "pixi.js";

// base abstract class that our Screen can inherit from.
// It has some optional members in order to define behaviours
export abstract class CustomScreen extends Container{
    assetBundles?: ()=>string[]; // What bundles should we load when loading this screen
    start?: ()=> Promise<void>; // Execute one shot of logic, after the first resize
    update?: (ticker: Ticker) => void; // Execute every frame. Uses pixi ticker
    resize?: (width: number, height: number) => void; // Execute when the screen is resized.
}