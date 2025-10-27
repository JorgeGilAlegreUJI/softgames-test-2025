import {Container, Ticker} from "pixi.js";

export abstract class CustomScreen extends Container{
    assetBundles?: ()=>string[];
    start?: ()=> Promise<void>;
    update?: (ticker: Ticker) => void;
    resize?: (width: number, height: number) => void;
}