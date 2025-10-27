import { CustomScreen } from '../CustomScreen.ts';
import { Container, Point, Sprite } from 'pixi.js';
import { cardAssetA, cardAssetB } from 'core-utils/assets/assetRegistry.ts';
import gsap from 'gsap';

export class AceOfShadowsScreen extends CustomScreen {
    private readonly deckTop: Container = new Container();
    private readonly dynamicContainer: Container = new Container();
    private readonly deckBot: Container = new Container();

    start = async (): Promise<void> => {
        //Deck top setup
        this.deckTop.cacheAsTexture(true);
        this.addChild(this.deckTop);
        const numCards = 144;
        for (let i = 0; i < numCards; i++) {
            const sprite = Sprite.from(i % 2 === 0 ? cardAssetA : cardAssetB);
            sprite.scale = 0.45;
            sprite.anchor.set(0.5);
            sprite.position = this.computeTopCardPosition(this.deckTop);
            this.transferToContainer(sprite, this.deckTop);
        }

        //Deck bot setup
        this.deckBot.cacheAsTexture(true);
        this.addChild(this.deckBot);
        this.startCardMovement();

        // Dynamic container setup
        this.addChild(this.dynamicContainer);
    };

    private transferToContainer(sprite: Sprite, container: Container, insertAsFirst: boolean = false) {
        const globalPos = this.toGlobal(sprite.position); // get global coords
        sprite.position.copyFrom(container.toLocal(globalPos)); // convert to new container space
        if (insertAsFirst) {
            container.addChildAt(sprite, 0);
        } else {
            container.addChild(sprite);
        }
    }

    // Position will be relative to the deck but with a slight offset, causing a stacking effect.
    private computeTopCardPosition(deck: Container): Point {
        const deckLength = deck.children.length;
        return new Point(deck.x + deckLength * 0.1, deck.y - deckLength * 0.5);
    }

    resize = (width: number, height: number): void => {
        this.deckTop.x = width * 0.5;
        this.deckTop.y = 200;

        this.deckBot.x = width * 0.5;
        this.deckBot.y = height - 200;

        this.dynamicContainer.x = width * 0.5;
        this.dynamicContainer.y = height * 0.5;
    };

    assetBundles = () => ['ace-of-spades'];

    // In order to move card we play with the cacheAsTexture value
    private moveTopCard() {
        if (this.deckTop.children.length === 0) return;
        const topCard = this.deckTop.getChildAt(this.deckTop.children.length - 1) as Sprite;
        topCard.position = this.computeTopCardPosition(this.deckTop);
        this.deckTop.cacheAsTexture(false);
        this.deckTop.removeChild(topCard);
        this.deckTop.cacheAsTexture(true);
        this.transferToContainer(topCard, this.dynamicContainer, true);

        const globalPos = this.toGlobal(this.computeTopCardPosition(this.deckBot));
        const targetPos = this.dynamicContainer.toLocal(globalPos);

        gsap.to(topCard, {
            x: targetPos.x,
            y: targetPos.y,
            duration: 2, // seconds
            ease: 'power1.inOut',
            onComplete: () => {
                this.dynamicContainer.removeChild(topCard);
                topCard.position = this.computeTopCardPosition(this.deckBot);
                this.deckBot.cacheAsTexture(false);
                this.transferToContainer(topCard, this.deckBot);
                this.deckBot.cacheAsTexture(true);
            },
        });
    }

    private startCardMovement() {
        setInterval(() => {
            this.moveTopCard();
        }, 1000); // 1 second
    }
}
