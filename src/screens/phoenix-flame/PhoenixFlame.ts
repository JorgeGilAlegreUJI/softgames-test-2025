import {CustomScreen} from "../CustomScreen.ts";
import {AnimatedSprite, Container, Point, Rectangle, Sprite, Texture, Ticker} from "pixi.js";
import {app} from "core-utils/application/applicationUtil.ts";
import {explosionAsset, flamesAsset} from "core-utils/assets/assetRegistry.ts";
import {screenHeight, screenWidth} from "core-utils/responsive/responsiveUtil.ts";
import gsap from "gsap";

// We will have 10 sprites in total. 9 custom particles and a main sprite in the middle of the screen.
const maxParticles = 9;

interface CustomParticle {
    sprite: Sprite;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
}

export class PhoenixFlame extends CustomScreen{
    private mainSprite? : AnimatedSprite;
    readonly particles: CustomParticle[] = [];
    readonly particlesContainer : Container = new Container();
    private fireOrigin: Point = new Point(0,0);

    constructor() {
        super();
        this.addChild(this.particlesContainer);
        this.particlesContainer.scale = 2;
    }

    private createMainSprite(){
        const scale = 6;
        this.mainSprite = this.createAnimatedSprite(flamesAsset,scale, 32, 32, 8);  // This values are pulled from the spritesheet file.
        this.mainSprite.x = screenWidth/2;
        this.mainSprite.y = screenHeight/2;
        this.mainSprite.scale.set(4);
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to(this.mainSprite.scale, { x: scale, y: scale, duration: 1 });
        this.addChild(this.mainSprite);
    }

    start = async (): Promise<void> =>{
        this.createMainSprite();
    }

    // Common function to load animated sprites with different spritesheets
    private createAnimatedSprite(assetName : string, scale : number, frameWidth : number, frameHeight : number, totalFrames: number): AnimatedSprite {
        const sheetTexture = Texture.from(assetName);

        const frames = [];
        for (let i = 0; i < totalFrames; i++) {
            frames.push(new Texture({source: sheetTexture.source, frame: new Rectangle(i * frameWidth, 0, frameWidth, frameHeight)}));
        }

        const animatedSprite = new AnimatedSprite(frames);
        animatedSprite.animationSpeed = 0.1;
        animatedSprite.loop = true;
        animatedSprite.play();
        animatedSprite.x = screenWidth/2;
        animatedSprite.y = screenHeight/2;

        animatedSprite.anchor.set(0.5);
        animatedSprite.x = this.fireOrigin.x + (Math.random() - 0.5) * 20;
        animatedSprite.y = this.fireOrigin.y + (Math.random() - 0.5) * 10;
        animatedSprite.scale.set(scale);
        animatedSprite.alpha = 1;
        return animatedSprite;
    }

    private spawnParticle() {
        if (this.particles.length >= maxParticles) return;
        const scale = 0.5 + Math.random() * 0.5;
        const animatedSprite = this.createAnimatedSprite(explosionAsset,scale, 64, 64, 11); // This values are pulled from the spritesheet file.

        const particle: CustomParticle = {
            sprite: animatedSprite,
            vx: (Math.random() * 2 - 1)*4,
            vy: (Math.random() * 2 - 1)*4,
            life: 1 + Math.random() * 0.5,
            maxLife: 1 + Math.random() * 0.5
        };

        this.particles.push(particle);
        this.particlesContainer.addChild(animatedSprite);
    }

    assetBundles = () => ["phoenix-flame"];

    update = (ticker: Ticker) : void =>{
        // Spawn new particles
        this.spawnParticle();

        // We rotate the container itself creating a maelstorm effect.
        this.particlesContainer.angle += ticker.deltaTime;

        // Update particles position, alpha, scale... this depends on the lifetime of the particle
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.sprite.x += p.vx * ticker.deltaTime;
            p.sprite.y += p.vy * ticker.deltaTime;

            const frameTime = 0.016; //Assuming 60fps
            p.life -= frameTime * ticker.deltaTime; // We calculate for our time
            p.sprite.alpha = p.life / p.maxLife;
            p.sprite.scale.set(0.5 + 0.5 * (p.life / p.maxLife) * 2); //range of: 0.5–1.5.

            if (p.life <= 0) {
                app.stage.removeChild(p.sprite);
                this.particles.splice(i, 1);
            }
        }
    }

    resize = (width: number, height: number): void => {
        // mostly just to keep things centered
        if(this.mainSprite){
            this.mainSprite.x = width/2;
            this.mainSprite.y = height/2;
        }
        this.particlesContainer.x = width/2;
        this.particlesContainer.y = height/2;
        this.fireOrigin = new Point(0, 0);
    };
}