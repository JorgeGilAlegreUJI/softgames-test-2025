import { Application } from 'pixi.js';

export const app: Application = new Application();


export async function initApplication() {
    const pixiContainer = 'pixi-container';
    const container = document.getElementById(pixiContainer);
    if (!container) {
        throw new Error(`Could not find expected container: ${pixiContainer}`);
    }
    await app.init({ resolution: Math.max(window.devicePixelRatio, 2), backgroundColor: 0x242424 });
    container.appendChild(app.canvas);
}
