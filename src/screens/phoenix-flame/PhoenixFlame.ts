import {CustomScreen} from "../CustomScreen.ts";
import {AnimatedSprite, Container, Point, Rectangle, Sprite, Texture, Ticker} from "pixi.js";
import {app} from "core-utils/application/applicationUtil.ts";
import {explosionAsset, flamesAsset} from "core-utils/assets/assetLibrary.ts";
import {screenHeight, screenWidth} from "core-utils/responsive/responsiveUtil.ts";
import gsap from "gsap";

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

    start = async (): Promise<void> =>{
        const scale = 6;
        this.mainSprite = this.createAnimatedSprite(flamesAsset,scale, 32, 32);
        this.mainSprite.x = screenWidth/2;
        this.mainSprite.y = screenHeight/2;
        this.mainSprite.scale.set(4);
        const tl = gsap.timeline({ repeat: -1, yoyo: true }); // yoyo makes it scale back automatically
        tl.to(this.mainSprite.scale, { x: scale, y: scale, duration: 1 });
        this.addChild(this.mainSprite);
    }

    private createAnimatedSprite(assetName : string, scale : number, frameWidth : number, frameHeight : number): AnimatedSprite {
        const sheetTexture = Texture.from(assetName);

        const frames = [];
        for (let i = 0; i < 8; i++) {
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
        const animatedSprite = this.createAnimatedSprite(explosionAsset,scale, 64, 64);

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

        this.particlesContainer.angle += ticker.deltaTime;

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.sprite.x += p.vx * ticker.deltaTime;
            p.sprite.y += p.vy * ticker.deltaTime;

            p.life -= 0.016 * ticker.deltaTime;
            p.sprite.alpha = p.life / p.maxLife;
            p.sprite.scale.set(0.5 + 0.5 * (p.life / p.maxLife) * 2);

            if (p.life <= 0) {
                app.stage.removeChild(p.sprite);
                this.particles.splice(i, 1);
            }
        }
    }

    resize = (width: number, height: number): void => {
        if(this.mainSprite){
            this.mainSprite.x = width/2;
            this.mainSprite.y = height/2;
        }
        this.particlesContainer.x = width/2;
        this.particlesContainer.y = height/2;
        this.fireOrigin = new Point(0, 0);
    };
}