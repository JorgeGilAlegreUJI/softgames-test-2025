import { initApplication } from 'core-utils/application/application.ts';
import { initLoader } from 'core-utils/assets/assets.ts';
import { initResponsive } from "core-utils/responsive/responsive.ts";

async function main() {
    await initApplication();
    await initLoader();
    await initResponsive();
}

main().catch((i_error) => console.error('Game failed to start:', i_error));
