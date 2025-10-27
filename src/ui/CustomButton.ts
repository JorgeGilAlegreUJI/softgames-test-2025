import {FancyButton} from "@pixi/ui";
import { Text, TextStyle} from 'pixi.js';
import {clickSoundAsset, shortBabyFontAsset} from "core-utils/assets/assetRegistry.ts";
import {playOneShotSound} from "core-utils/music/musicUtil.ts";

// Generic class for button, so we can define our default behaviour. Mostly Ui presentation and  animation but also sound.
export class CustomButton extends FancyButton{
    constructor(defaultViewAsset: string, text: string, scale : number) {
        super({
            defaultView: defaultViewAsset,
            anchor: 0.5,
            scale: scale,
            padding: 10,
            animations: {
                // Will grow bigger on hover
                hover: {
                    props: {
                        scale: {
                            x: 1.1,
                            y: 1.1,
                        }
                    },
                    duration: 100,
                },
                // Will shrink on pressed
                pressed: {
                    props: {
                        scale: {
                            x: 0.9,
                            y: 0.9,
                        }
                    },
                    duration: 70,
                }
            }
        });

        // Setup button text with shadow
        const textStyle = new TextStyle({
            fill: 0xe8e8e8,
            fontFamily: shortBabyFontAsset,
            align: 'center',
            fontSize: 100,
        });
        textStyle.dropShadow = true;
        textStyle.dropShadow.color = 0x696969;

        this.textView = new Text({
            text: text,
            style: textStyle,
            anchor: 0.5
        });

        // Play generic click sound
        this.onPress.connect(() => {
            playOneShotSound(clickSoundAsset);
        });
    }
}