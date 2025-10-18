import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class ProtectScene extends MinigameScene {
    //Images

    //values
    private moveSensitivity = 0.1;

    private enemyConfig = [
        {spawnPos: {x: -172, y: 65}, image: CONST.PROTECT.AXE, rotationSpeed: 540, moveSpeed: 240, scale: 1, colliderW: 50, colliderH: 150, chamferRadius: 16},
        {spawnPos: {x: 957, y: 57}, image: CONST.PROTECT.KNIFE, rotationSpeed: 540, moveSpeed: 240, scale: 1, colliderW: 90, colliderH: 90, chamferRadius: 45},
        {spawnPos: {x: -131, y: 300}, image: CONST.PROTECT.NINJA, rotationSpeed: 0, moveSpeed: 240, scale: 1, colliderW: 130, colliderH: 200, chamferRadius: 0},
        {spawnPos: {x: 1058, y: 121}, image: CONST.PROTECT.POOP, rotationSpeed: 360, moveSpeed: 240, scale: 1, colliderW: 140, colliderH: 140, chamferRadius: 70},
        {spawnPos: {x: 1009, y: 295}, image: CONST.PROTECT.PORCUPINE, rotationSpeed: 0, moveSpeed: 240, scale: 1, colliderW: 100, colliderH: 75, chamferRadius: 0},
        {spawnPos: {x: 691, y: 607}, image: CONST.PROTECT.KNIFE, rotationSpeed: -540, moveSpeed: 240, scale: 1, colliderW: 90, colliderH: 90, chamferRadius: 45},
        {spawnPos: {x: 151, y: 621}, image: CONST.PROTECT.POOP, rotationSpeed: 360, moveSpeed: 240, scale: 1, colliderW: 140, colliderH: 140, chamferRadius: 70},
        {spawnPos: {x: 1026, y: 580}, image: CONST.PROTECT.AXE, rotationSpeed: -540, moveSpeed: 240, scale: 1, colliderW: 50, colliderH: 150, chamferRadius: 16},
        {spawnPos: {x: 1249, y: 417}, image: CONST.PROTECT.NINJA, rotationSpeed: 0, moveSpeed: 240, scale: -1, colliderW: 130, colliderH: 200, chamferRadius: 0},
        {spawnPos: {x: -342, y: 19}, image: CONST.PROTECT.POOP, rotationSpeed: 360, moveSpeed: 240, scale: 1, colliderW: 140, colliderH: 140, chamferRadius: 70},
        {spawnPos: {x: -168, y: 469}, image: CONST.PROTECT.PORCUPINE, rotationSpeed: 0, moveSpeed: 240, scale: -1, colliderW: 100, colliderH: 75, chamferRadius: 0},
    ];

    private enemySpawning = {
        startDelay: 1000,
        spawnInterval: {min: 600, max: 1200}
    };

    private enemyTargetPos = {x: 422, y: 146};

    //logic vars
    private ghost;
    private lady;
    private collisionPlayer;
    private collisionKiller;
    private collisionLady;
    private enemyActivationTimer = 0;
    private nextEnemySpawnTime = 0;
    private activatedEnemiesCount = 0;
    private canActivateEnemies = false;

    private enemies = [];
    private killedEnemiesCount = 0;
    private spawnedEnemiesCount = 0;


    constructor(){
        super ({
            sceneName: CONST.SCENES.PROTECT,
            duration: 10000,
            showCountdown: false,
            startScreenColor: 0x493500,
            startText: "PROTECT!",
            startTextColor: 0xFFFFFF,
            endScreen: CONST.PROTECT.END,
            nextScene: CONST.SCENES.ALAN,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 417, scale: 1.2},
                normalWithSkip: {x: 284.5, y: 417, scale: 1.2},
                skip: {x: 547, y: 417, scale: 1.2}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.ghost = null;
        this.lady = null;
        this.enemies = [];
        this.killedEnemiesCount = 0;
        this.spawnedEnemiesCount = 0;
        this.enemyActivationTimer = 0;
        this.nextEnemySpawnTime = this.enemySpawning.startDelay;
        this.activatedEnemiesCount = 0;
        this.canActivateEnemies = false;
    }

    _preload(){
    }

    _create(){
        this.addBackgroundImage(CONST.PROTECT.BACKGROUND).setDepth(1);
        this.add.image(409, 240, CONST.PROTECT.BACKGROUND).setDepth(0);

        this.add.image(700, 55, CONST.PROTECT.DRAG_TEXT).setScale(0.84).setDepth(1).setTint(0x09343A);

        this.initPhysics();

        this.spawnLady();
        this.spawnGhost();
        this.spawnEnemies();
    }

    private initPhysics(){
        //this.matter.world.setBounds(0, 0, this.game.renderer.width, this.game.renderer.height);

        this.collisionPlayer = 2;//this.matter.world.nextCategory();
        this.collisionKiller = 4;//this.matter.world.nextCategory();
        this.collisionLady = 8;//this.matter.world.nextCategory();

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            if (bodyA.label.startsWith("killer") || bodyB.label.startsWith("killer")){
                var killer = bodyA.label.startsWith("killer") ? bodyA : bodyB;
                if (bodyA.label === 'player' || bodyB.label === 'player'){
                    this.killEnemyWithLabel(killer.label);
                }
                if (bodyA.label === 'lady' || bodyB.label === 'lady'){
                    this.deactivateEnemyWithLabel(killer.label);
                    this.lady.kill();
                }
            }
        }, this);
    }

    private killEnemyWithLabel(label: string){
        //Enemies are labeled like "killer1", "killer2" because for some reason phaser doesnt give me any other information except label -.-
        for (let enemy of this.enemies){
            if (enemy.isLabelEqual(label)){
                enemy.kill();
                return;
            }
        }
    }
    private deactivateEnemyWithLabel(label: string){
        //Enemies are labeled like "killer1", "killer2" because for some reason phaser doesnt give me any other information except label -.-
        for (let enemy of this.enemies){
            if (enemy.isLabelEqual(label)){
                enemy.deactivate();
                return;
            }
        }
    }

    private spawnLady(){     
        this.add.image(300, 204, CONST.PROTECT.YARN).setDepth(5);
   
        var lady = this.matter.add.image(412, 161, CONST.GHOSTBUSTERS.BALL, null, {label: 'lady', isStatic: true})
                    .setScale(1.5, 3)
                    .setVisible(false)
                    .setCollisionCategory(this.collisionLady);

        lady.bodyAnim = this.addAnimation(CONST.PROTECT.LADY, CONST.ANIMATIONS.GRANNYDIE_BODY)
                            .setLoop(false)
                            .setImagePosition(0)
                            .setDepth(3);//this.add.image(402, 161, CONST.PROTECT.LADY).setDepth(3);
        lady.hand1 = this.addAnimation(CONST.PROTECT.HAND_1, CONST.ANIMATIONS.GRANNY_HAND1)
                            .setImageOrigin(0.0355, 0.889)
                            .setDepth(10)
                            .setLoop(true)
                            .start();// this.add.image(449, 186, CONST.PROTECT.HAND_1).setOrigin(0.0355, 0.889).setDepth(10);
        lady.hand2 =this.addAnimation(CONST.PROTECT.HAND_2, CONST.ANIMATIONS.GRANNY_HAND2)
                            .setImageOrigin(0.933, 0.9564)
                            .setDepth(10)
                            .setLoop(true)
                            .start();// this.add.image(381, 188, CONST.PROTECT.HAND_2).setOrigin(0.933, 0.9564).setDepth(10);

        lady.kill = () => {
            lady.bodyAnim.start();
            lady.hand1.setAnimation(this.cache.json.get(CONST.ANIMATIONS.GRANNYDIE_HAND1)).setLoop(false);
            lady.hand2.setAnimation(this.cache.json.get(CONST.ANIMATIONS.GRANNYDIE_HAND2)).setLoop(false);
            //Animate death
            this.triggerLose();
        }

        this.lady = lady;
    }

    private spawnGhost(){
        //Ghost: is draggable,
            //has collision group (like in ghostbusters) 
            // can collide with enemies -> turns them around!
            // game starts when player starts dragging the ghost
        var ghost = {
            anim: this.addAnimation(CONST.FLY.GHOST, CONST.ANIMATIONS.GHOST_IDLE)
                        .setDepth(10)
                        .setImageInteractive()
                        .setOffset(-38, -29)
                        .setPositionOverride(695, 153)
                        .setScaleMultiplier(2)
                        .setLoop(true)
                        .start(),
            
            body: this.matter.add.image(695, 153, CONST.FLY.GHOST, null, {chamfer: {radius: 55},
                                                                        label: 'player',
                                                                        ignoreGravity: true,
                                                                        frictionAir: 0.25,
                                                                        friction: 0,
                                                                        })
                                .setCollisionCategory(this.collisionPlayer)
                                .setCollidesWith([this.collisionKiller])
                                .setScale(0.5)
                                .setVisible(false),
            
            isDragging: false,
            isAlive: true,

            onUpdate: (delta) => {
                ghost.anim.setPositionOverride(ghost.body.x, ghost.body.y);
                ghost.body.setAngle(0);

                if (!ghost.isAlive || !ghost.isDragging) return;
                var velocity = {x: this.input.activePointer.x - ghost.anim.GetPositionOverride().x, y: this.input.activePointer.y - ghost.anim.GetPositionOverride().y};
                ghost.body.setVelocity(velocity.x * this.moveSensitivity, velocity.y * this.moveSensitivity);
            },
        };

        ghost.anim.GetImage().on('pointerdown', function(pointer){
            this.canActivateEnemies = true;
            this.ghost.isDragging = true;
        }, this);

        this.input.on('pointerup', function(pointer){
            this.ghost.isDragging = false;
        }, this);

        this.ghost = ghost;
    }

    private spawnEnemies(){
        this.enemyConfig.forEach(config => {
            this.spawnedEnemiesCount++;
            this.spawnEnemy(config);}
        );

       this.enemies = this.shuffle(this.enemies);
    }

    private spawnEnemy(config){
        //Should be called from update -> takes the config and spawns enemy on correct time
        //Has movement speed and target location (lady)
            //Collides with player and lady
            //if lady -> kill her and lose
            //if ghost -> turn around

        var enemyLabel = "killer" + this.spawnedEnemiesCount;
        var enemy = this.matter.add.image(config.spawnPos.x, config.spawnPos.y,
                                            config.image, 
                                            null, 
                                            {chamfer: {radius: 13},
                                            label: enemyLabel,
                                            ignoreGravity: true,
                                            frictionAir: 0,
                                            friction: 0,
                                            })
                                    .setScale(config.scale,1)
                                    .setDepth(15);

        var Bodies = Phaser.Physics.Matter.Matter.Bodies;
        var rectA = Bodies.rectangle(config.spawnPos.x, config.spawnPos.y, config.colliderW, config.colliderH, {label: enemyLabel, 
                                                    chamfer: {radius: config.chamferRadius},
                                                    });
        var compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: [ rectA ]
        });
        enemy.label = enemyLabel;
        enemy.setExistingBody(compoundBody);
        enemy.setIgnoreGravity(true);
        enemy.setFrictionAir(1);
        enemy.setCollisionCategory(this.collisionKiller);
        enemy.setCollidesWith([this.collisionPlayer, this.collisionLady]);

        enemy.isActive = false;
        enemy.wasKilled = false;
        enemy.moveVector = new Phaser.Math.Vector2(-config.spawnPos.x + this.enemyTargetPos.x, -config.spawnPos.y + this.enemyTargetPos.y).normalize().scale(config.moveSpeed);

        enemy.onUpdate = (delta: number) => {
            enemy.setAngle(enemy.angle + config.rotationSpeed * delta / 1000);
            if (!enemy.isActive) return;
            enemy.setPosition(enemy.x + enemy.moveVector.x * delta / 1000, enemy.y + enemy.moveVector.y * delta / 1000);
        };

        enemy.activate = () => {
            enemy.isActive = true;
        };

        enemy.kill = () => {
            if (enemy.wasKilled) return;

            enemy.setScale(-enemy.scaleX, enemy.scaleY);
            enemy.moveVector.scale(-1);
            enemy.wasKilled = true;
            this.handleEnemyKilled();
        }

        enemy.deactivate = () => {
            enemy.isActive = false;
        }

        enemy.isLabelEqual = (label: string) => {
            return enemy.label === label;
        }

        this.enemies.push(enemy);        
    }

    private handleEnemyKilled(){
        this.killedEnemiesCount++;
        if (this.killedEnemiesCount >= this.enemyConfig.length){
            this.triggerWin();
        }
    }

    _update(time: number, delta: number){
        this.ghost.onUpdate(delta);

        this.enemies.forEach(enemy => {
            enemy.onUpdate(delta);
        });

        this.activateEnemies(delta);
    }

    private activateEnemies(delta: number){
        if (!this.canActivateEnemies) return;
        if (this.activatedEnemiesCount >= this.enemyConfig.length) return;

        this.enemyActivationTimer += delta;

        if (this.enemyActivationTimer > this.nextEnemySpawnTime){
            this.enemies[this.activatedEnemiesCount].activate();
            this.enemyActivationTimer = 0;
            this.activatedEnemiesCount++;
            this.nextEnemySpawnTime = this.getRandomInt(this.enemySpawning.spawnInterval.min, this.enemySpawning.spawnInterval.max);
        }
    }

    private shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    _timeout(){
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.loseGame(1000);
    }

    private triggerWin(){
        this.time.delayedCall(2000, () => {
            this.winAnimDelayed();
        }, null, this);

        this.winGame(3500);
    }

    private winAnimDelayed(){
        this.addAnimation(CONST.PROTECT.WIN_SCREEN, CONST.ANIMATIONS.WIN_IMAGE_POPUP)
            .setDepth(300)
            .setLoop(false)
            .start();
    }
}
