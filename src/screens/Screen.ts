import {Container, Ticker} from "pixi.js";
import {ScreenDefinition} from "./ScreenDefinition.ts";

export abstract class Screen extends Container{
    private readonly _screenDefinition: ScreenDefinition;

    constructor(screenDefinition: ScreenDefinition) {
        super();
        this._screenDefinition = screenDefinition;
    }

    start?: ()=> Promise<void>;
    update?: (time: Ticker) => void;
    resize?: (width: number, height: number) => void;

    public get screenDefinition(): ScreenDefinition {
        return this._screenDefinition;
    }
}