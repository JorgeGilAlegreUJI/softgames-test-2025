import { ApplicationSystem } from 'game-systems/application-system/ApplicationSystem.ts';
import { LoaderSystem } from 'game-systems/loader-system/LoaderSystem.ts';
import { EntitiesSystem } from 'game-systems/entities-system/EntitiesSystem.ts';

async function main(): Promise<void> {
    await ApplicationSystem.init();
    await LoaderSystem.init();
    await EntitiesSystem.init();
}

main().catch((i_error) => console.error('Game failed to start:', i_error));
