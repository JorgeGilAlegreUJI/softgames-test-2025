import {Application} from "pixi.js";

export class ApplicationSystem {
    static application: Application;

    static async init(): Promise<void> {
        const pixiContainer = "pixi-container";
        const container = document.getElementById(pixiContainer);
        if(!container){
            throw new Error(`Could not find expected container: ${pixiContainer}`);
        }
        this.application = new Application();
        await this.application.init({ resizeTo: window });
        container.appendChild(this.application.canvas);
    }
}