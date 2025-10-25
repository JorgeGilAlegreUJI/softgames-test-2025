import {Screen} from "./Screen.ts";
import {ScreenDefinition} from "./ScreenDefinition.ts";
import {Container, Texture, TilingSprite} from "pixi.js";
import {applicationDesignConfig} from "core-utils/application/applicationDesignConfig.ts";
import {CustomButton} from "../ui/CustomButton.ts";
import {customButtonAsset, mainMenuBackgroundAsset} from "core-utils/assets/assetLibrary.ts";
import {aceOfShadowsText} from "core-utils/assets/textLibrary.ts";
import {Tween, Group, Easing} from '@tweenjs/tween.js';
import {app} from "core-utils/application/application.ts";

export class MainMenuScreen extends Screen{
    private readonly _background: TilingSprite;
    private readonly mainButtons: CustomButton[] = [
        new CustomButton(customButtonAsset, aceOfShadowsText, 0.75),
        new CustomButton(customButtonAsset, aceOfShadowsText, 0.75),
        new CustomButton(customButtonAsset, aceOfShadowsText, 0.75),
    ];
    private readonly buttonsTextureWidth = Texture.from(customButtonAsset).width;
    //private buttonTween?: Tween;

    constructor(screenDefinition: ScreenDefinition) {
        super(screenDefinition);

        //TODO: move this?
        this._background = new TilingSprite({
            texture: Texture.from(mainMenuBackgroundAsset),
            tileScale: {
                x: applicationDesignConfig.backgroundTileScale,
                y: applicationDesignConfig.backgroundTileScale,
            }
        });
        this.addChild(this._background);
        // this._button.onPress.connect(()=>{
        //     this.buttonTween = new Tween(this._button)
        //         .to({ x: 500 }, 20000)
        //         .start();
        // });
        for(const button of this.mainButtons)
        {
            this.addChild(button);
        }

        // app.ticker.add(() => {
        //     this.buttonTween?.update();
        // });
    }

    private resizeButtons(width: number, height: number){
        const minSpacing = 40;
        const neededWidth = this.buttonsTextureWidth*this.mainButtons.length + (minSpacing*this.mainButtons.length-1);
        const extraWidth = Math.max(width - neededWidth, 0);
        let spacing = extraWidth*0.1;
        spacing = Math.max(spacing,minSpacing);
        let scale = width >= neededWidth ? 1 : width/neededWidth;
        scale *= 0.75;

        this.mainButtons[0].x = width*0.5 - this.buttonsTextureWidth*scale - spacing*scale;
        this.mainButtons[1].x = width*0.5;
        this.mainButtons[2].x = width*0.5 + this.buttonsTextureWidth*scale + spacing*scale;

        for(const button of this.mainButtons){
            button.y = height - 100;
            button.scale = scale;
        }
    }

    resize = (width: number, height: number): void => {
        this.resizeButtons(width, height);

        this._background.width = width;
        this._background.height = height;

        // // if(this.buttonTween?.isPlaying()){
        // //     this.buttonTween?.end();
        // // }
        // this._button.x = width /2;
        // this._button.y = height /2;
    };
}