import {FancyButton} from "@pixi/ui";
import { Text, TextStyle} from 'pixi.js';

export class CustomButton extends FancyButton{
    constructor(defaultViewAsset: string, text: string, scale : number) {
        super({
            defaultView: defaultViewAsset,
            anchor: 0.5,
            scale: scale,
            padding: 10,
            animations: {
                hover: {
                    props: {
                        scale: {
                            x: 1.1,
                            y: 1.1,
                        }
                    },
                    duration: 100,
                },
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

        const textStyle = new TextStyle({
            // Predefine text styles that can be overwritten
            fill: 0xe8e8e8,
            fontFamily: 'short_baby',
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
    }
}