import { Application } from 'pixi.js';

export class ApplicationSystem {
    static app: Application;

    static async init() {
        const pixiContainer = 'pixi-container';
        const container = document.getElementById(pixiContainer);
        if (!container) {
            throw new Error(`Could not find expected container: ${pixiContainer}`);
        }
        this.app = new Application();
        await this.app.init({ resizeTo: window });
        container.appendChild(this.app.canvas);
    }
}
