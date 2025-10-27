// Overlay of Ui element that will be present in most screens.

import { Container, Text, TextStyle } from 'pixi.js';
import { app } from 'core-utils/application/applicationUtil.ts';
import { customButtonAsset, shortBabyFontAsset } from 'core-utils/assets/assetRegistry.ts';
import { CustomButton } from '../../ui/CustomButton.ts';
import { backString, fullscreenString, musicString } from 'core-utils/assets/stringRegistry.ts';
import { MainMenuScreen } from '../../screens/main-menu/MainMenuScreen.ts';
import { CustomScreen } from '../../screens/CustomScreen.ts';
import { showScreen } from 'core-utils/responsive/responsiveUtil.ts';
import { toggleMusic } from 'core-utils/music/musicUtil.ts';

let currentFpsText: Text;
let backButton: CustomButton;
let fullscreenButton: CustomButton;
let musicButton: CustomButton;
const maxFpsSample = 10;
const fpsSample: number[] = [];

export function initOverlay(overlayView: Container) {
    // setup fps counter
    const textStyle = new TextStyle({
        fill: 0xe8e8e8,
        fontFamily: shortBabyFontAsset,
        align: 'left',
        fontSize: 20,
    });
    currentFpsText = new Text({
        text: '00',
        style: textStyle,
        anchor: 0,
    });
    currentFpsText.x = 10;
    overlayView.addChild(currentFpsText);

    // setup fullscreen button
    fullscreenButton = new CustomButton(customButtonAsset, fullscreenString, 0.25);
    fullscreenButton.anchor.set(0, 0);
    fullscreenButton.position.set(10, currentFpsText.height + 10);
    fullscreenButton.onPress.connect(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            app.canvas.requestFullscreen().catch((err) => {
                console.warn('Fullscreen request failed:', err);
            });
        }
    });
    overlayView.addChild(fullscreenButton);

    // setup back button
    backButton = new CustomButton(customButtonAsset, backString, 0.25);
    backButton.anchor.set(0, 0);
    backButton.position.set(10, currentFpsText.height + 10);
    backButton.visible = false;
    backButton.onPress.connect(() => showScreen(new MainMenuScreen()));
    overlayView.addChild(backButton);

    // setup music button
    musicButton = new CustomButton(customButtonAsset, musicString, 0.25);
    musicButton.anchor.set(0, 0);
    musicButton.position.set(10, backButton.position.y + backButton.height + 10);
    musicButton.visible = false;
    musicButton.onPress.connect(() => toggleMusic());
    overlayView.addChild(musicButton);
}

export function updateOverlay() {
    // update fps counter
    if (fpsSample.length >= maxFpsSample) {
        const avgFps = Math.round(fpsSample.reduce((sum, value) => sum + value, 0) / fpsSample.length);
        currentFpsText.text = Math.round(avgFps);
        fpsSample.length = 0;
    }
    fpsSample.push(Math.round(app.ticker.FPS));
}

export function onScreenWillChange(newScreen: CustomScreen) {
    // we can control here what overlay elements we want in each screen
    const isInMainMenu = newScreen instanceof MainMenuScreen;
    fullscreenButton.visible = isInMainMenu;
    backButton.visible = !isInMainMenu;
    musicButton.visible = true;
}
