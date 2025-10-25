import { Sprite } from 'pixi.js';
import { ApplicationSystem } from 'game-systems/application-system/ApplicationSystem.ts';

export class EntitiesSystem {
    static async init(): Promise<void> {
        const bunny = Sprite.from('bunny');

        // Center the sprite's anchor point
        bunny.anchor.set(0.5);

        // Move the sprite to the center of the screen
        bunny.position.set(ApplicationSystem.app.screen.width / 2, ApplicationSystem.app.screen.height / 2);

        // Add the bunny to the stage
        ApplicationSystem.app.stage.addChild(bunny);

        // Listen for animate update
        ApplicationSystem.app.ticker.add((time) => {
            // Just for fun, let's rotate mr rabbit a little.
            // * Delta is 1 if running at 100% performance *
            // * Creates frame-independent transformation *
            bunny.rotation += 0.1 * time.deltaTime;
        });
    }
}
