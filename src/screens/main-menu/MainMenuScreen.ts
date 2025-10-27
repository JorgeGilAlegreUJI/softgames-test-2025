import {CustomScreen} from "../CustomScreen.ts";
import {Container, Sprite, Text, Texture} from "pixi.js";
import {CustomButton} from "../../ui/CustomButton.ts";
import {aceOfShadowsString, authorNameString, magicWordsString, phoenixFlameString} from "core-utils/assets/stringRegistry.ts";
import {
    customButtonAsset,
    frogAsset,
    shortBabyFontAsset,
    softgamesLogoAsset
} from "core-utils/assets/assetRegistry.ts";
import {screenHeight, screenWidth, showScreen} from "core-utils/responsive/responsiveUtil.ts";
import {AceOfShadowsScreen} from "../ace-of-shadows/AceOfShadowsScreen.ts";
import gsap from "gsap";
import {MagicWordsScreen} from "../magic-words/MagicWordsScreen.ts";
import {PhoenixFlame} from "../phoenix-flame/PhoenixFlame.ts";
export type Tween = gsap.core.Tween | gsap.core.Timeline;

export class MainMenuScreen extends CustomScreen{
    private readonly funnyContainer : Container = new Container();
    private readonly funnySprites: { sprite: Sprite; vx: number; vy: number }[] = [];
    private readonly buttonsMinSpacing = 40;
    private readonly mainButtons: CustomButton[] = [
        new CustomButton(customButtonAsset, aceOfShadowsString, 0.75),
        new CustomButton(customButtonAsset, magicWordsString, 0.75),
        new CustomButton(customButtonAsset, phoenixFlameString, 0.75),
    ];
    private readonly buttonsTextureWidth = Texture.from(customButtonAsset).width;
    private readonly brandLogo : Sprite = Sprite.from(softgamesLogoAsset);
    private logoTween: Tween | null = null;
    private nameTween: Tween | null = null;
    private readonly nameText : Text =  new Text({
        text: authorNameString,
        style: {
            fill: 0xe8e8e8,
            fontFamily: shortBabyFontAsset,
            align: 'center',
            fontSize: 100,
        }
    });

    constructor() {
        super();
        // Setup funny sprites
        this.addChild(this.funnyContainer);
        for (let i = 0; i < 5; i++) {
            const sprite = Sprite.from(frogAsset);
            sprite.anchor.set(0.5);
            sprite.x = Math.random() * screenWidth;
            sprite.y = Math.random() * screenHeight;
            sprite.scale.set(0.1);

            // random velocities
            const vx = (Math.random() - 0.5) * 5;
            const vy = (Math.random() - 0.5) * 5;

            this.funnySprites.push({ sprite, vx, vy });
            this.funnyContainer.addChild(sprite);
        }

        // Setup main buttons
        this.mainButtons[0].onPress.connect(() => showScreen(new AceOfShadowsScreen()));
        this.mainButtons[1].onPress.connect(() => showScreen(new MagicWordsScreen()));
        this.mainButtons[2].onPress.connect(() => showScreen(new PhoenixFlame()));

        // Setup company logo
        this.brandLogo.anchor = 0.5;
        this.brandLogo.scale = 0;
        this.logoTween = gsap.to(this.brandLogo, { scale: this.computeResponsiveScale(), duration: 0.75, ease: "power1.inOut", delay: 0.2 ,onComplete: () =>
        {
            // We free the ref so GC can get it
            this.logoTween = null;
        }});
        this.addChild(this.brandLogo);

        // Setup name text
        this.nameText.anchor = 0.5;
        this.nameText.scale = 0;
        this.nameTween = gsap.to(this.nameText, { scale: this.computeResponsiveScale(), duration: 0.75, ease: "power1.inOut", delay: 0.4, onComplete: () =>
        {
            // We free the ref so GC can get it
            this.nameTween = null;
        }});
        this.addChild(this.nameText);
        for(const button of this.mainButtons)
        {
            this.addChild(button);
        }
    }

    // Calculated width for the main buttons to fit well. We'll use this value in general for this screen.
    private neededWidth(){
        return this.buttonsTextureWidth*this.mainButtons.length + (this.buttonsMinSpacing*this.mainButtons.length-1);
    }

    // Calculating general scale based on the previous neededWidth
    private computeResponsiveScale(){
        const width = screenWidth;
        const neededWidth = this.neededWidth();
        let scale = width >= neededWidth ? 1 : width/neededWidth;
        const scaleConstant = 0.75;
        scale = scaleConstant * scale;
        return scale;
    }

    // Resize and reposition buttons. If the screen is very wide we can increase spacing.
    private resizeButtons(width: number, height: number, neededWidth : number, scale : number){
        const extraWidth = Math.max(width - neededWidth, 0);
        let spacing = extraWidth*0.1;
        spacing = Math.max(spacing,this.buttonsMinSpacing);

        this.mainButtons[0].x = width*0.5 - this.buttonsTextureWidth*scale - spacing*scale;
        this.mainButtons[1].x = width*0.5;
        this.mainButtons[2].x = width*0.5 + this.buttonsTextureWidth*scale + spacing*scale;

        for(const button of this.mainButtons){
            button.y = height - 100;
            button.scale = scale;
        }
    }

    // Update funny scripts to move randomly and bounce on edges.
    private updateFunnySprites() {
        for (const obj of this.funnySprites) {
            const { sprite } = obj;

            sprite.x += obj.vx;
            sprite.y += obj.vy;

            const halfW = sprite.width / 2;
            const halfH = sprite.height / 2;

            if (sprite.x - halfW < 0) {
                sprite.x = halfW;
                obj.vx *= -1;
            } else if (sprite.x + halfW > screenWidth) {
                sprite.x = screenWidth - halfW;
                obj.vx *= -1;
            }

            if (sprite.y - halfH < 0) {
                sprite.y = halfH;
                obj.vy *= -1;
            } else if (sprite.y + halfH > screenHeight) {
                sprite.y = screenHeight - halfH;
                obj.vy *= -1;
            }
        }
    }

    update = () : void =>{
        this.updateFunnySprites();
    }

    resize = (width: number, height: number): void => {
        // Multiple objs can use this value
        const responsiveScale = this.computeResponsiveScale();

        this.brandLogo.x = width*0.5;
        this.brandLogo.y = height*0.3;
        if(this.logoTween && this.logoTween.progress() > 0){
            this.logoTween.kill();
            this.logoTween = null;
        }
        if(this.logoTween === null) this.brandLogo.scale = responsiveScale;

        if(this.nameTween && this.nameTween.progress() > 0){
            this.nameTween.kill();
            this.nameTween = null;
        }
        if(this.nameTween === null){ this.nameText.scale = responsiveScale;}
        this.nameText.x = width*0.5;
        this.nameText.y = height*0.5;
        this.resizeButtons(width, height, this.neededWidth(), responsiveScale);
    };
}