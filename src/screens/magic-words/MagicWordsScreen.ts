import {CustomScreen} from "../CustomScreen.ts";
import {Container, Sprite, Texture, Text, Point, TextStyle} from "pixi.js";
import {DialogueData} from "./dialogueData.ts";
import {loadJSON, loadTexture} from "core-utils/json/jsonUtil.ts";
import {anonymousAsset, shortBabyFontAsset} from "core-utils/assets/assetRegistry.ts";
import {screenHeight, screenWidth} from "core-utils/responsive/responsiveUtil.ts";
import gsap from "gsap";
import {AlignedContainer} from "./AlignedContainer.ts";
import {messageIntervalTime, scrollTime} from "./magicWordsConfig.ts";
import {loadingString} from "core-utils/assets/stringRegistry.ts";

// value used to keep the view responsive and shrink if the width becomes too small.
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
        // Setup entries container
        this.entriesContainer.width = screenWidth;
        this.entriesContainer.height = screenHeight;
        this.addChild(this.entriesContainer);

        // Setup loading text
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
        // Load general json
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

        // Remove loading text
        if(this.loadingText){
            this.removeChild(this.loadingText);
            this.loadingText = null;
        }
        this.startDialogMovement();
    }

    assetBundles = () => ["magic-words"];

    // Takes a string with some {emojiName} elements and creates a container that combines text and sprites to achieve the desired result.
    private generateFromRichText(richText: string) {
        const container = new Container();
        const parts = richText.split(/({[^}]+})/g);
        const fontSize = 50;
        // Important value to guide us about where to insert the next element.
        let xOffset = 0;

        parts.forEach(part => {
            const isEmoji = part.match(/{([^}]+)}/);
            if (isEmoji) {
                const emojiName = isEmoji[1];
                const texture = this.emojiDataByName[emojiName];
                console.assert(texture, "emoji has no texture: " + emojiName); // If this happens we simply do not draw the emoji
                if (texture) {
                    // insert sprite in container
                    const sprite = new Sprite(texture);
                    sprite.width = fontSize;
                    sprite.height = fontSize;
                    sprite.y = -fontSize / 2;
                    sprite.x = xOffset;
                    container.addChild(sprite);

                    const offset = sprite.width + 4;
                    xOffset += offset;
                }
            } else {
                // insert text in container
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


    // We take the data we loaded before and created all the necessary UI elements with it (per dialogue entry);
    popNextMessage() {
        if(!this.dialogueData){
            return;
        }

        if (this.currentDialogueIndex >= this.dialogueData.dialogue.length) {
            return;
        }

        // Setup avatar data
        const dialogueEntry = this.dialogueData.dialogue[this.currentDialogueIndex];
        let avatarData = this.avatarDataByName[dialogueEntry.name];
        if (!avatarData) {
            // If no avatar data is provided we use the anonymous asset and asume position as left.
            avatarData = { texture: Texture.from(anonymousAsset), position: 'left' };
        }

        // Setup text container, avatar sprite and avatar text
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

        // The aligment is diferent if it is left or right aligned.
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

        // entry container will hold the previous elements so we can manipulate all together.
        this.entriesContainer.addChild(entryContainer);

        const tl = gsap.timeline({
            onComplete: () => {
                this.entriesContainer.removeChild(entryContainer);
            }
        });
        // little animation to "pop in"
        tl.to(entryContainer, { scale: this.computeContainerScale(), duration: 0.5, ease: "power1.inOut" });
        // animation so the entries scroll upwards like in a chat.
        tl.to(entryContainer, { y: -entryContainer.height, duration: scrollTime, ease: "linear" });
        entryContainer.scale = 0;

        // We're done with this index so we increment for the next one.
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

            if (alignedContainer.isRightAligned) {
                alignedContainer.x = width - alignedContainer.width;
            }
        });
    };
}