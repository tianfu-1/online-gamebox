import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class FlyScene extends MinigameScene {
    //Images

    //values
    private grassConfig = [
        {x: 290, y: 513.5, scaleX: 1, image: CONST.FLY.START_GRASS},
        {x: 922, y: 489, scaleX: -1, image: CONST.FLY.GRASS_2},
        {x: 1439, y: 489, scaleX: 1, image: CONST.FLY.GRASS_2},
        {x: 1956, y: 489, scaleX: -1, image: CONST.FLY.GRASS_2},
        {x: 2476, y: 495, scaleX: 1, image: CONST.FLY.GRASS_1},
        {x: 2996, y: 495, scaleX: 1, image: CONST.FLY.GRASS_1},
        {x: 5586, y: 495, scaleX: 1, image: CONST.FLY.GRASS_1},
        {x: 5067, y: 495, scaleX: -1, image: CONST.FLY.GRASS_1},
        {x: 4547, y: 489, scaleX: 1, image: CONST.FLY.GRASS_2},
        {x: 4029, y: 489, scaleX: 1, image: CONST.FLY.GRASS_2},
        {x: 3512, y: 489, scaleX: -1, image: CONST.FLY.GRASS_2},
        {x: -350, y: 489, scaleX: 1, image: CONST.FLY.GRASS_2},
    ];

    private ghostConfig = {
        xSpeed: 266,
        maxYSpeed: -267,
        maxYPosition: -134,
        upForce: 3200,
        gravity: 785,
        startAngle: -275,
        maxAngle: -20,
        winXPosition: 5584
    };

    private cameraZoom = 4.5/7;
    private physicsShapes;

    //logic vars
    
    private ghost;

    constructor(){
        super ({
            sceneName: CONST.SCENES.FLY,
            duration: 1000,
            showCountdown: false,
            startScreenColor: 0xBA1313,
            startText: "FLY!",
            startTextColor: 0xFFFFFF,
            endScreen: CONST.FLY.END,
            nextScene: CONST.SCENES.PROTECT,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 398, scale: 1.30},
                normalWithSkip: {x: 283, y: 398, scale: 1.30},
                skip: {x: 570, y: 398, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.ghost = null;
    }

    _preload(){
    }

    _create(){
        this.initPhysics();
        this.addStaticImages();  
        this.createLevel();
        this.spawnGhost(this.ghostConfig);
        this.startCameraFollow();
        this.createParticles();
    }

    private createParticles(){
        var particles = this.add.particles(CONST.MENU.STAR_PARTICLE).setDepth(1);
        var particleConfig = {
            active: true,
            visible: true,
            on: false,
            radial:true,
            frequency: 1000,
            gravityY: 0,
            timeScale: 1,
            maxParticles: 1500,
            blendMode: 0,
            lifespan: 10000,
            alpha: {start: 0, end: 1, ease: "Quad.easeOut"},
            scale: {start: 1, end: 0, ease: "Linear"},
            quantity: {ease: "Linear", min: 0, max: 10},
            emitZone: {
                source: new Phaser.Geom.Rectangle(0, 0, 6700, 800),
                type: "random",
            },
            speed:{  
                ease:"Linear",
                min:0,
                max:27
             },
            x: -600,
            y: -500,

        }

        var starParticles = particles.createEmitter(particleConfig);
        starParticles.flow(500, 50);
    }

    private initPhysics(){
        this.physicsShapes = this.cache.json.get(CONST.PHYSICS.FLY_SHAPES);

        this.matter.add.rectangle(3100, 425, 6700, 95, {label: 'ground', isStatic: true,});

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            this.ghost.die();
            this.triggerLose();
        }, this);
    }

    private addStaticImages(){
        this.add.image(2201, 66, CONST.FLY.BACKGROUND).setScale(400, 1.63).setDepth(0);
        this.add.image(58, 239, CONST.FLY.HOLD_TEXT).setDepth(1);
        this.add.image(5113, -42, CONST.FLY.GRADIENT).setDepth(30).setScale(1.2, 6*1.2);
        this.add.image(6306, 240, CONST.FLY.WHITE_SQUARE).setDepth(29).setScale(10.859*1.2, 14.6*1.2);
        this.createGrass();
    }

    private createGrass(){
        this.grassConfig.forEach(grass => {
            this.add.image(grass.x, grass.y, grass.image).setDepth(2).setScale(grass.scaleX * 1.2, 1);
        });

        //Add filler for grass background
        this.add.graphics({fillStyle: {color: 0x594A43, alpha: 1}})
                .fillRect(-600, 600, 8000, 300)
                .setDepth(100);
    }

    private createLevel(){
        this.matter.add.image(1748, 300, CONST.FLY.FOUNTAIN, undefined, {shape: this.physicsShapes.foutain}).setScale(1.2).setDepth(9); 
        this.matter.add.image(3374, -196, CONST.FLY.MOON, undefined, {shape: this.physicsShapes.moon}).setScale(-1.2, 1.2).setDepth(9).setAngle(-38); 
        this.matter.add.image(2188, -215, CONST.FLY.TWIG, undefined, {shape: this.physicsShapes.twig}).setDepth(9).setScale(2.855*0.6);
        this.matter.add.image(2842, 265, CONST.FLY.LIGHT, undefined, {shape: this.physicsShapes["light-2"]}).setScale(0.5).setDepth(9); 
        this.matter.add.image(3798, 274, CONST.FLY.TWIG, undefined, {shape: this.physicsShapes.twig}).setScale(0.6, -0.6).setDepth(9); 

        this.matter.add.image(4376, 2.7, CONST.FLY.SPIDER_1, undefined, {shape: this.physicsShapes["spider-1"]}).setScale(1.413*0.52).setDepth(9); 
        this.matter.add.image(4454, -154, CONST.FLY.SPIDER_2, undefined, {shape: this.physicsShapes["spider-2"]}).setScale(1.336*1.2).setDepth(9); 
        this.matter.add.image(4296, -121, CONST.FLY.SPIDER_3, undefined, {shape: this.physicsShapes["spider-3"]}).setScale(1.52*1.2).setDepth(9); 

        this.add.image(4294.6, -385, CONST.FLY.SPIDER_LINE).setScale(0.77, 1.33).setDepth(8);
        this.add.image(4460, -454, CONST.FLY.SPIDER_LINE).setScale(0.77, 1.33).setDepth(8);
        this.add.image(4377.6, -292, CONST.FLY.SPIDER_LINE).setScale(1.08, 1.866).setDepth(8);
    }

    private spawnGhost(config: FlyScene["ghostConfig"]){
        var ghost = this.matter.add.image(344, 262,
                                             CONST.FLY.GHOST, 
                                             null, 
                                             {shape: this.physicsShapes.duhc})
                                        .setIgnoreGravity(true)
                                        .setDepth(20)
                                        .setScale(-0.5, 0.5)
                                        .setAngle(8);

        ghost.isActive = false; //we activate ghost on first touch
        ghost.isAlive = true;
        ghost.isHolding = false; //is player currently touching the screen?
        ghost.yVelocity = 0;
        ghost.xVelocity = config.xSpeed;

        ghost.updateVelocity = (delta: number) => {
            if (!ghost.isActive) return;

            if (ghost.isHolding 
                && ghost.yVelocity > config.maxYSpeed 
                && ghost.y > config.maxYPosition){
                ghost.yVelocity -= config.upForce * delta/1000;
            } 

            if (!(ghost.isHolding && ghost.yVelocity <= config.maxYSpeed && ghost.y > config.maxYPosition)){
                ghost.yVelocity += config.gravity * delta/1000;    
            }  
        };

        ghost.die = () => {
            ghost.isAlive = false;
        }

        ghost.move = (delta: number) => {
            if (!ghost.isActive || !ghost.isAlive) return;
           ghost.x += ghost.xVelocity * delta/1000;
           ghost.y += ghost.yVelocity * delta/1000;

           ghost.angle = config.startAngle + (ghost.yVelocity / config.maxYSpeed) * config.maxAngle;

           if (ghost.x > config.winXPosition){
               ghost.isAlive = false;
               this.triggerWin();
           }
        };

        ghost.onUpdate = (delta: number) => {
            ghost.updateVelocity(delta);
            ghost.move(delta);
        };

        this.input.on("pointerdown", (pointer) => {
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            this.ghost.isActive = true;
            this.ghost.isHolding = true;
        }, this);

        this.input.on("pointerup", () => {
            this.ghost.isHolding = false;
        }, this);

        this.ghost = ghost;
    }

    private startCameraFollow(){
        this.cameras.main.startFollow(this.ghost);
    }

    _update(time: number, delta: number){
        this.ghost.onUpdate(delta);
    }

    _timeout(){
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.time.delayedCall(500, () => {this.setCameraZoom(false);}, [], this);
        this.loseGame(500);
    }

    private triggerWin(){
        this.setCameraZoom(false);
        this.winAnimation();
        this.winGame(3000);
    }

    private winAnimation(){
        var winbg = this.add.image(this.ghost.x, this.ghost.y, CONST.FLY.WIN_IMAGE).setDepth(500).setAlpha(0);
        this.tweens.add({
            targets: winbg,
            alpha: 1,
            ease: 'Linear',
            duration: 500,
            repeat: 0,
            yoyo: false,
        });

        this.time.delayedCall(1000, () => {
            this.addAnimation(CONST.FLY.WIN_GHOST, CONST.ANIMATIONS.FLY_WIN, 30)
                .setOffset(this.ghost.x - 853/2, this.ghost.y - 240)
                .setDepth(550)
                .setLoop(false)
                .start();
        }, [], this);
    }

    onGameStarted = () => {
        this.setCameraZoom(true);
    }

    private setCameraZoom(isPlaying: boolean){
        this.cameras.main.setZoom(isPlaying ? this.cameraZoom : 1);

    }
}
