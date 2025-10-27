import {app} from "core-utils/application/applicationUtil.ts";
import {Container, Texture, TilingSprite} from "pixi.js";
import {applicationConfig} from "core-utils/application/applicationConfig.ts";
import {CustomScreen} from "../../screens/CustomScreen.ts";
import {MainMenuScreen} from "../../screens/main-menu/MainMenuScreen.ts";
import {areBundlesLoaded, loadBundles} from "core-utils/assets/assetsUtil.ts";
import {applicationBackgroundAsset} from "core-utils/assets/assetLibrary.ts";
import {initOverlay, onScreenWillChange, updateOverlay} from "core-utils/responsive/overlay.ts";

export let screenWidth: number;
export let screenHeight: number;

const screenView = new Container();
const overlayView = new Container();
let currentBackground  : TilingSprite;
let currentScreen : CustomScreen;

export async function removeScreen(screen: CustomScreen){
    // Unlink update function if method is available
    if (screen.update) {
        app.ticker.remove(screen.update, screen);
    }

    // Remove screen from its parent (usually app.stage, if not changed)
    if (screen.parent) {
        screen.parent.removeChild(screen);
    }
}

export async function showScreen(screen: CustomScreen) {
    // If there is a screen already created, remove it
    if (currentScreen) {
        await removeScreen(currentScreen);
    }

    onScreenWillChange(screen);

    // Load assets for the new screen, if available
    if (screen.assetBundles && !areBundlesLoaded(screen.assetBundles())) {
        //TODO: we could benefit of a loading screen here

        // Load all assets required by the new screen
        await loadBundles(screen.assetBundles());
    }
    currentScreen = screen;

    // Add screen to stage
    screenView.addChild(screen);

    // Add screen's resize handler, if available
    if (screen.resize) {
        // Trigger a first resize
        screen.resize(screenWidth, screenHeight);
    }

    // Add update function if available
    if (screen.update) {
        app.ticker.add(screen.update, screen);
    }

    // Start the new screen
    if (screen.start) {
        await screen.start();
    }
}

function resize(){
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = applicationConfig.content.width;
    const minHeight = applicationConfig.content.height;

    // Calculate renderer and canvas sizes based on current dimensions
    const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const scaledWidth = windowWidth * scale;
    const scaledHeight = windowHeight * scale;

    // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
    app.renderer.canvas.style.width = `${windowWidth}px`;
    app.renderer.canvas.style.height = `${windowHeight}px`;
    window.scrollTo(0, 0);

    screenWidth = scaledWidth;
    screenHeight = scaledHeight;
    app.renderer.resize(screenWidth, screenHeight);


    // Update elements
    currentBackground.width = screenWidth;
    currentBackground.height = screenHeight;
    currentScreen?.resize?.(screenWidth, screenHeight);
}

export async function initResponsive() {
    app.stage.addChild(screenView);
    currentBackground = new TilingSprite({
        texture: Texture.from(applicationBackgroundAsset),
        tileScale: {
            x: applicationConfig.backgroundTileScale,
            y: applicationConfig.backgroundTileScale,
        }
    });
    screenView.addChild(currentBackground);

    app.stage.addChild(overlayView);
    initOverlay(overlayView);
    app.ticker.add(updateOverlay);

    window.addEventListener('resize', resize);
    resize();

    await showScreen(new MainMenuScreen());
}