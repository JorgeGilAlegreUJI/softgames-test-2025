import { initApplication } from 'core-utils/application/applicationUtil.ts';
import { initLoader } from 'core-utils/assets/assetsUtil.ts';
import { initResponsive } from "core-utils/responsive/responsiveUtil.ts";

async function main() {
    await initApplication();
    await initLoader();
    await initResponsive();
}

main().catch((i_error) => console.error('Game failed to start:', i_error));
