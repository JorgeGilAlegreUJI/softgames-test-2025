import {CustomScreen} from "../CustomScreen.ts";
import {Container, Sprite, Texture, Text, Point, TextStyle} from "pixi.js";
import {DialogueData} from "./dialogueData.ts";
import {loadJSON, loadTexture} from "core-utils/json/jsonUtil.ts";
import {anonymousAsset, shortBabyFontAsset} from "core-utils/assets/assetLibrary.ts";
import {screenHeight, screenWidth} from "core-utils/responsive/responsiveUtil.ts";
import gsap from "gsap";
import {AlignedContainer} from "./AlignedContainer.ts";
import {messageIntervalTime, scrollTime} from "./magicWordsConfig.ts";
import {loadingString} from "core-utils/assets/stringLibrary.ts";

const maxWidth = 1100;

export class MagicWordsScreen extends CustomScreen{
    private loadingText: Text | null;
    private entriesContainer: Container = new Container();
    private emojiDataByName: Record<string, Texture> = {};
    private avatarDataByName: Record<string, { texture: Texture ; position: string }> = {};
    private dialogueData?: DialogueData;
    private currentDialogueIndex: number = 0;
    private alignedContainers: AlignedContainer[] = [];

    constructor() {
        super();
        this.entriesContainer.width = screenWidth;
        this.entriesContainer.height = screenHeight;
        this.addChild(this.entriesContainer);

        const textStyle = new TextStyle({
            fill: 0x70f1ff,
            fontFamily: shortBabyFontAsset,
            fontSize: 30,
        });
        this.loadingText = new Text({
            text: loadingString,
            style: textStyle
        });
        this.loadingText.x = screenWidth / 2;
        this.loadingText.y = screenHeight / 2;
        this.addChild(this.loadingText);
    }

    start = async (): Promise<void> =>{
        const dataUrl = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords";
        this.dialogueData = await loadJSON<DialogueData>(dataUrl);

        // Load emojis
        for (const emoji of this.dialogueData.emojies) {
            this.emojiDataByName[emoji.name] = await loadTexture(emoji.url);
        }

        // Load avatars
        for (const avatar of this.dialogueData.avatars) {
            const texture = await loadTexture(avatar.url);
            this.avatarDataByName[avatar.name] = {
                texture : texture
                , position : avatar.position
            };
        }

        if(this.loadingText){
            this.removeChild(this.loadingText);
            this.loadingText = null;
        }
        this.startDialogMovement();
    }

    assetBundles = () => ["magic-words"];

    private generateFromRichText(richText: string) {
        const container = new Container();
        const parts = richText.split(/({[^}]+})/g);
        const fontSize = 50;
        let xOffset = 0;

        // Process each part
        parts.forEach(part => {
            const isEmoji = part.match(/{([^}]+)}/);
            if (isEmoji) {
                const emojiName = isEmoji[1];
                const texture = this.emojiDataByName[emojiName];
                console.assert(texture, "emoji has no texture: " + emojiName);
                if (texture) {
                    const sprite = new Sprite(texture);
                    sprite.width = fontSize;
                    sprite.height = fontSize;
                    sprite.y = -fontSize / 2;

                    // Position sprite based on current offset
                    sprite.x = xOffset;
                    container.addChild(sprite);

                    const offset = sprite.width + 4;
                    xOffset += offset;
                }
            } else {
                const textStyle = new TextStyle({
                    fill: 0xe8e8e8,
                    fontFamily: "Arial",
                    fontSize: fontSize,
                });
                const text = new Text({
                    text: part,
                    style: textStyle,
                    anchor: new Point(0,0.5),
                });
                text.y = 0;
                text.x = xOffset;
                container.addChild(text);

                const offset = text.width;
                xOffset += offset;
            }
        });

        return container;
    }


    popNextMessage() {
        if(!this.dialogueData){
            return;
        }

        if (this.currentDialogueIndex >= this.dialogueData.dialogue.length) {
            return;
        }

        const dialogueEntry = this.dialogueData.dialogue[this.currentDialogueIndex];

        let avatarData = this.avatarDataByName[dialogueEntry.name];
        if (!avatarData) {
            avatarData = { texture: Texture.from(anonymousAsset), position: 'left' };
        }

        const textContainer = this.generateFromRichText(dialogueEntry.text);
        textContainer.scale = 0.5;

        const avatarContainer = new Container();
        let avatarSprite = Sprite.from(avatarData.texture);
        avatarSprite.scale = 0.5;
        avatarContainer.addChild(avatarSprite);

        const textStyle = new TextStyle({
            fill: 0x70f1ff,
            fontFamily: shortBabyFontAsset,
            fontSize: 20,
        });
        const avatarText = new Text({
            text: dialogueEntry.name,
            style: textStyle
        });
        avatarContainer.addChild(avatarText);

        const entryContainer = new AlignedContainer();
        entryContainer.addChild(textContainer);
        entryContainer.addChild(avatarContainer);

        textContainer.position.y += avatarSprite.height / 2;

        const isOnLeft = avatarData.position === 'left';
        if (isOnLeft) {
            avatarSprite.position.x = 0;
            textContainer.position.x = avatarSprite.width + 15;
            avatarText.position.x = avatarSprite.position.x + 10;
        } else {
            avatarSprite.position.x = entryContainer.width;
            entryContainer.x = screenWidth - entryContainer.width * this.computeContainerScale();
            avatarText.anchor.x = 1;
            avatarText.position.x = avatarSprite.position.x + avatarSprite.width -10;
            entryContainer.isRightAligned = true;
        }
        avatarText.position.y = avatarSprite.position.y + avatarSprite.height;


        entryContainer.y = screenHeight - 100;
        this.alignedContainers.push(entryContainer);
        this.entriesContainer.addChild(entryContainer);

        const tl = gsap.timeline({
            onComplete: () => {
                this.entriesContainer.removeChild(entryContainer);
            }
        });
        tl.to(entryContainer, { scale: this.computeContainerScale(), duration: 0.5, ease: "power1.inOut" });
        tl.to(entryContainer, { y: -entryContainer.height, duration: scrollTime, ease: "linear" });
        entryContainer.scale = 0;

        this.currentDialogueIndex++;
    }

    private startDialogMovement() {
        this.popNextMessage();
        setInterval(() => {
            this.popNextMessage();
        }, messageIntervalTime);
    }

    private computeContainerScale(){
        return Math.min(screenWidth / maxWidth,1);
    }

    resize = (width: number, height: number): void => {
        if(this.loadingText){
            this.loadingText.x = width*0.5;
            this.loadingText.y = height*0.5;
        }

        this.alignedContainers.forEach((alignedContainer) => {
            alignedContainer.scale = this.computeContainerScale();
            console.log(this.computeContainerScale());

            // If on the right side, align to the right edge
            if (alignedContainer.isRightAligned) {
                alignedContainer.x = width - alignedContainer.width;
            }
        });
    };
}