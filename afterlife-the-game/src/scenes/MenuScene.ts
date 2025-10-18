import MenuButton from "../components/MenuButton";
import { CONST } from "../CONST";

export class MenuScene extends Phaser.Scene {

    private starParticles !: Phaser.GameObjects.Particles.ParticleEmitter;

    private firstScene = CONST.SCENES.FLY;

    private gameCompleted = false;

    constructor(){
        super({
            key: CONST.SCENES.MENU,
        });
    }

    init(){
        this.resetRegistry();
        this.gameCompleted = this.registry.get(CONST.REGISTRY.GAME_COMPLETED);
    }

    private resetRegistry(){
        this.registry.set(CONST.REGISTRY.SKIPUSED, false);
        this.registry.set(CONST.REGISTRY.JUMPSCARE_ATTEMPTS, 1);
        this.registry.set(CONST.REGISTRY.GHOSTBUSTERS_ATTEMPTED, false);
        this.registry.set(CONST.REGISTRY.HELL_COMPLETED, true);
    }

    preload(){}

    create(){
        this.createParticles();
        this.add.image(0,0, CONST.MENU.BACKGROUND).setOrigin(0, 0).setDepth(0);
        this.add.image(0,0, CONST.MENU.OVERLAY).setOrigin(0, 0).setDepth(2);    
       
        let canContinue = this.canContinueGame();
        let playButton = new MenuButton(this, this.game.renderer.width/2, canContinue ? 370 : 400, CONST.BUTTONS.RED, 'PLAY', () => { this.startGame()});
        if (canContinue){
            let continueButton = new MenuButton(this, this.game.renderer.width/2, 430, CONST.BUTTONS.PURPLE, 'CONTINUE', () => {this.continueGame()}, 30);
        }

        if (!this.gameCompleted){
            var soundtrackScene = this.scene.get(CONST.SCENES.SOUNDTRACK);
            soundtrackScene.pause();
        }
    }

    private createParticles(){
            var particles = this.add.particles(CONST.MENU.STAR_PARTICLE).setDepth(1);
            var particleConfig = {
                active: true,
                visible: true,
                on: false,
                radial:true,
                frequency: 500,
                gravityY: 0,
                timeScale: 1,
                maxParticles: 300,
                blendMode: 0,
                lifespan: 10000,
                alpha: {start: 0, end: 1, ease: "Quad.easeOut"},
                scale: {start: 1, end: 0, ease: "Linear"},
                quantity: {ease: "Linear", min: 0, max: 10},
                emitZone: {
                    source: new Phaser.Geom.Rectangle(-600, -300, 1200, 480),
                    type: "random",
                },
                speed:{  
                    ease:"Linear",
                    min:0,
                    max:27
                 },
                x: 400,
                y: 300,

            }
    
            this.starParticles = particles.createEmitter(particleConfig);
            this.starParticles.start();
            this.starParticles.explode(50, 400, 300);
            this.starParticles.flow(500, 7);
    }

    private startGame(){
        this.scene.start(this.firstScene);
        this.startSoundtrack();
        
    }

    private continueGame(){
        let progressScene = this.storagePlugin.getItem(CONST.STORAGE_KEYS.PROGRESS);
        this.scene.start(progressScene);
        this.startSoundtrack();
    }

    private canContinueGame(){
        //progress is saved and its not the credits scene
        let progress = this.storagePlugin.getItem(CONST.STORAGE_KEYS.PROGRESS);
        return progress && progress != CONST.SCENES.CREDITS;
    }

    private startSoundtrack(){
        if (!this.gameCompleted){
            var soundtrackScene = this.scene.get(CONST.SCENES.SOUNDTRACK);
            soundtrackScene.play();
            soundtrackScene.FadeSoundtrack(1, 1000);
            soundtrackScene.FadeOutEerie();
        }
    }
}