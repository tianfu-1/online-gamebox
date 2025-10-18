import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class GhostbustersScene extends MinigameScene {
    //Images
    private gradient !: Phaser.GameObjects.Image;

    //values
    private worldColliders = [
        //Bottom left
        {x: 424, y: 230, width: 162, height: 144},
        {x: 434.5, y: 313, width: 533, height: 18},
        {x: 643, y: 394, width: 114, height: 16},
        {x: 430.5, y: 396, width: 113, height: 16},
        {x: 206.5, y: 394.5, width: 101, height: 9},
        {x: 534, y: 7, width: 548, height: 12},
        {x: 829, y: 244.5, width: 46, height: 467},
        {x: 162.5, y: 354.5, width: 11, height: 63},
        {x: 164, y: 151, width: 6, height: 300},
        {x: 245.5, y: 119.5, width: 7, height: 233},
        {x: 24.5, y: 269.5, width: 43, height: 413},
    ];

    private spikeColliders = [
        {x: 57.5, y: 271.5, width: 21, height: 401},
        {x: 145.5, y: 197, width: 13, height: 382},
        {x: 260, y: 115.5, width: 16, height: 199},
        {x: 257, y: 222, width: 10, height: 14},
        {x: 147, y: 392.5, width: 8, height: 7},
    ];

    private winZones = [{x: 203.5, y: 24.5, width: 67, height: 43}];

    private moveSensitivity = 0.1;
    private spinnerRotationSpeed = -85;
    private laserSwitchFrequency = 1200;

    private cannonConfig = {
        interval: 1300,
        topStartPosition: {x: 829, y: 353.3},
        topEndPosition: 179,
        bottomStartPosition: {x: 829, y: 440.8},
        bottomEndPosition: 86,
        ballSpeed: -4.2,
    }

    //logic vars
    private ghost;
    private spinner;
    private hasGradient = false;
    private pointerOffset = null;
    private collisionPlayer;

    private balls = [];

    constructor(){
        super ({
            sceneName: CONST.SCENES.GHOSTBUSTERS,
            duration: 20000,
            showCountdown: false,
            startScreenColor: 0x1A1A1A,
            startText: "BUST\nOUT!",
            startTextColor: 0xFFFFFF,
            startTextYOrigin: 0.35,
            endScreen: CONST.GHOSTBUSTERS.END,
            nextScene: CONST.SCENES.HEAVENHELL,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 365, scale: 1.25},
                normalWithSkip: {x: 283, y: 365, scale: 1.25},
                skip: {x: 570, y: 365, scale: 1.25}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.ghost = null;
        this.spinner = null;
        this.hasGradient = false;
        this.balls = [];
        this.pointerOffset = null;
    }

    _preload(){
    }

    _create(){
        this.initPhysics();

        this.addBackgroundImage(CONST.GHOSTBUSTERS.BACKGROUND);
        this.add.image(96, 33, CONST.PROTECT.DRAG_TEXT).setTint(0x87878E).setScale(0.32).setDepth(1);

        this.createLevel();
        this.spawnGhost();

        this.createStartGradient();
    }

    private initPhysics(){
        this.matter.world.setBounds(0, 0, this.game.renderer.width, this.game.renderer.height);

        this.worldColliders.forEach((worldCol) => {
            this.matter.add.rectangle(worldCol.x, worldCol.y, worldCol.width, worldCol.height, {isStatic: true});
        });

        this.spikeColliders.forEach((spikeCol) => {
            this.matter.add.rectangle(spikeCol.x, spikeCol.y, spikeCol.width, spikeCol.height, {label: 'killer', isStatic: true});
           });

        this.winZones.forEach((winZone) => {
            this.matter.add.rectangle(winZone.x, winZone.y, winZone.width, winZone.height, {label: 'winZone', isStatic: true});
        });

        this.collisionPlayer = 2;//this.matter.world.nextCategory();

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            if (bodyA.label === 'player' || bodyB.label === 'player'){
                if (bodyA.label === 'killer' || bodyB.label === 'killer'){
                    this.ghost.die();
                }

                if (bodyA.label === 'winZone' || bodyB.label === 'winZone'){
                    this.ghost.win();
                }
            }
        }, this);
    }

    private createLevel(){
        this.add.image(0, 0, CONST.GHOSTBUSTERS.LEVEL).setOrigin(0).setDepth(5);

        this.spawnSpinner(656.3, 157.3);
        this.spawnCannon(866.3, 396);

        this.spawnLaser(473.4, 84, this.laserSwitchFrequency, this.laserSwitchFrequency, true);
        this.spawnLaser(409.5, 84, this.laserSwitchFrequency, this.laserSwitchFrequency, false);
        this.spawnLaser(344.9, 84, this.laserSwitchFrequency, this.laserSwitchFrequency, true);
    }

    private spawnSpinner(x: number, y: number){
        var spinner = this.matter.add.image(x, y, CONST.GHOSTBUSTERS.SPINNER).setDepth(9);

        var Bodies = Phaser.Physics.Matter.Matter.Bodies;
        var rectA = Bodies.rectangle(x, y, 15, 270, {label: 'killer'});
        var rectB = Bodies.rectangle(x, y, 270, 15, {label: 'killer'});
        var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: [ rectA, rectB ]
        });
        compoundBody.isStatic  = true;
        spinner.setExistingBody(compoundBody);

        spinner.onUpdate = (delta: number) => {
            spinner.setAngle(spinner.angle + this.spinnerRotationSpeed * delta/1000);
        }

        this.spinner = spinner;
    }

    private spawnCannon(x: number, y: number){
       var cannon = this.add.image(x, y, CONST.GHOSTBUSTERS.CANNON).setDepth(16);
       cannon.nextSpawnOnTop = true;
       cannon.spawnNextBall = () => {
            this.spawnBall(cannon.nextSpawnOnTop ? this.cannonConfig.topStartPosition : this.cannonConfig.bottomStartPosition, 
                            this.cannonConfig.ballSpeed,
                            cannon.nextSpawnOnTop ? this.cannonConfig.topEndPosition : this.cannonConfig.bottomEndPosition);


            this.time.delayedCall(this.cannonConfig.interval, () => {
                cannon.nextSpawnOnTop = !cannon.nextSpawnOnTop;
                cannon.spawnNextBall();
            }, null, this);
        }

        cannon.spawnNextBall();
    }

    private spawnBall(position: {x: number, y: number}, xVelocity: number, targetX: number){
        var ball = this.matter.add.image(position.x, position.y,
                                         CONST.GHOSTBUSTERS.BALL, 
                                         null, 
                                         {chamfer: {radius: 13},
                                            label: 'killer',
                                            ignoreGravity: true,
                                            frictionAir: 0,
                                            friction: 0,
                                            })
                                    .setDepth(15);

        var Bodies = Phaser.Physics.Matter.Matter.Bodies;
        var rectA = Bodies.rectangle(position.x, position.y, 28, 28, {label: 'killer', 
                                                                        chamfer: {radius: 16},
                                                                        });
        var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: [ rectA ]
        });
        ball.setExistingBody(compoundBody);
        ball.setIgnoreGravity(true);
        ball.setFrictionAir(0);
        ball.setCollidesWith([this.collisionPlayer]);

        ball.onUpdate = (delta) => {
            ball.setVelocity(xVelocity, 0);

            if (ball.x <= targetX){
                ball.setVisible(false);
                ball.setCollidesWith([]);
                this.balls.shift();
                ball.destroy();
            }
        };

        this.balls.push(ball);
}

    private spawnLaser(x: number, y: number, switchFrequency: number, startDelay: number, activeOnStart: boolean){
        var laser = this.matter.add.image(x, y, CONST.GHOSTBUSTERS.LASER).setDepth(5);
        
        this.add.image(x, y, CONST.GHOSTBUSTERS.LASER).setDepth(4).setAlpha(0.1).setBlendMode(Phaser.BlendModes.ERASE).setScale(0.5, 1);

        var Bodies = Phaser.Physics.Matter.Matter.Bodies;
        var rectA = Bodies.rectangle(x, y, 7, 140, {label: 'killer'});
        var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: [ rectA ]
        });
        compoundBody.isStatic  = true;
        laser.setExistingBody(compoundBody);

        laser.logic = {
            timeToSwitch: switchFrequency,
            delay: startDelay,
            active: activeOnStart,

            switchLasers: () => {
                laser.logic.active = !laser.logic.active;
                laser.setVisible(laser.logic.active);
                laser.setCollidesWith(laser.logic.active ? [this.collisionPlayer] : []);

                this.time.delayedCall(laser.logic.timeToSwitch, () => {
                    laser.logic.switchLasers();
                }, null, this);
            }
        }

        this.time.delayedCall(startDelay, laser.logic.switchLasers(), null, this);

        laser.setCollidesWith([]);
        laser.setVisible(false);
    }

    private spawnGhost(){
        var ghost = {
            anim: this.addAnimation(CONST.FLY.GHOST, CONST.ANIMATIONS.GHOST_IDLE)
                        .setDepth(10)
                        .setImageInteractive()
                        .setOffset(-38, -29)
                        .setPositionOverride(38, 29)
                        .setScaleMultiplier(0.70)
                        .setLoop(true)
                        .start(),
           
            body: this.matter.add.image(38, 29, CONST.FLY.GHOST, null, {chamfer: {radius: 55},
                                                                        label: 'player',
                                                                        ignoreGravity: true,
                                                                        frictionAir: 0.25,
                                                                        friction: 0,
                                                                        })
                                .setCollisionCategory(this.collisionPlayer)
                                .setScale(0.22)
                                .setVisible(false),
            
            isDragging: false,
            isAlive: true,

            onUpdate: (delta) => {
                ghost.anim.setPositionOverride(ghost.body.x, ghost.body.y);
                ghost.body.setAngle(0);

                if (!ghost.isAlive || !ghost.isDragging) return;
                var velocity = {x: this.input.activePointer.x + this.pointerOffset.x - ghost.anim.GetPositionOverride().x, y: this.input.activePointer.y + this.pointerOffset.y - ghost.anim.GetPositionOverride().y};
                ghost.body.setVelocity(velocity.x * this.moveSensitivity, velocity.y * this.moveSensitivity, delta);
            },

            die: () => {
                this.triggerLose();
                ghost.isAlive = false;
                ghost.anim.setAnimation(this.cache.json.get(CONST.ANIMATIONS.GHOST_DIE))
                        .setPlaybackSpeed(1)
                        .setLoop(false)
                        .setAnimFinishCallback(() => {ghost.anim.GetImage().setVisible(false)});
            },

            win: () => {
                ghost.isAlive = false;
                ghost.anim.stop();
                this.tweens.add({
                    targets: ghost.anim.GetImage(),
                    alpha: 0,
                    y: '-=100',
                    ease: 'Quad.easeIn',
                    duration: 1000,
                    repeat: 0,
                    yoyo: false,
                }); 
                this.triggerWin();
            }
        };

        this.input.on('pointerdown', function(pointer){
            if (this.hasGradient) {
                this.gradient.fadeOut();
            }
            this.pointerOffset = {x: ghost.anim.GetPositionOverride().x - pointer.x, y: ghost.anim.GetPositionOverride().y - pointer.y};
            this.ghost.isDragging = true;
         }, this);

         this.input.on('pointerup', function(pointer){
            this.ghost.isDragging = false;
         }, this);

        this.ghost = ghost;
    }

    private createStartGradient(){
        var alreadyAttempted = this.registry.get(CONST.REGISTRY.GHOSTBUSTERS_ATTEMPTED);
        this.hasGradient = !alreadyAttempted;
        if (alreadyAttempted) return;
        this.registry.set(CONST.REGISTRY.GHOSTBUSTERS_ATTEMPTED, true);

        var gradient = this.add.image(0, 0, CONST.GHOSTBUSTERS.START_GRADIENT).setOrigin(0).setDepth(100);
        gradient.canFade = true;
        gradient.fadeOut = () => {
            if (!gradient.canFade) return;
            gradient.canFade = false;
            this.tweens.add({
                targets: gradient,
                alpha: 0,
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
            });
        }

        this.gradient = gradient;
    }

    _update(time: number, delta: number){
        this.ghost.onUpdate(delta);
        this.spinner.onUpdate(delta);

        this.balls.forEach(ball => ball.onUpdate(delta));
    }

    _timeout(){
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.loseGame(1500);
    }

    private triggerWin(){
        //trigger win after 1 second and load next scene
        this.winGame(1000);
    }
}
