import {app} from "core-utils/application/application.ts";
import {Container} from "pixi.js";
import {applicationDesignConfig} from "core-utils/application/applicationDesignConfig.ts";
import {Screen} from "../../screens/Screen.ts";
import {ScreenDefinition} from "../../screens/ScreenDefinition.ts";
import {MainMenuScreen} from "../../screens/MainMenuScreen.ts";
import {areBundlesLoaded, loadBundles} from "core-utils/assets/assets.ts";

const screenView = new Container();
let currentScreen : Screen;

/** The width of the screen */
let width: number;
/** The height of the screen */
let height: number;

export async function removeScreen(screen: Screen){
    // Unlink update function if method is available
    if (screen.update) {
        app.ticker.remove(screen.update, screen);
    }

    // Remove screen from its parent (usually app.stage, if not changed)
    if (screen.parent) {
        screen.parent.removeChild(screen);
    }
}

export async function showScreen(screen: Screen) {
    // If there is a screen already created, hide it
    if (currentScreen) {
        await removeScreen(currentScreen);
    }

    // Load assets for the new screen, if available
    if (screen.screenDefinition.assetBundles && !areBundlesLoaded(screen.screenDefinition.assetBundles)) {
        //TODO: loading screen
        // If assets are not loaded yet, show loading screen, if there is one
        // if (loadScreen) {
        //     _addScreen(loadScreen, isOverlay);
        // }

        // Load all assets required by ResponsiveSystem new screen
        await loadBundles(screen.screenDefinition.assetBundles);

        //TODO: loading screen
        // Hide loading screen, if exists
        // if (loadScreen) {
        //     _removeScreen(loadScreen, isOverlay);
        // }
    }
    currentScreen = screen;

    // Add screen to stage
    screenView.addChild(screen);

    // Add screen's resize handler, if available
    if (screen.resize) {
        // Trigger a first resize
        screen.resize(width, height);
    }

    // Add update function if available
    if (screen.update) {
        app.ticker.add(screen.update, screen);
    }

    // Show the new screen
    if (screen.start) {
        await screen.start();
    }

}

function resize(){
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = applicationDesignConfig.content.width;
    const minHeight = applicationDesignConfig.content.height;

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

    width = scaledWidth;
    height = scaledHeight;
    app.renderer.resize(width, height);

    currentScreen?.resize?.(width, height);
}

export async function initResponsive() {
    app.stage.addChild(screenView);

    const screenDef = new ScreenDefinition("Test");
    const screen = new MainMenuScreen(screenDef);
    await showScreen(screen);
    window.addEventListener('resize', resize);
    resize();
}