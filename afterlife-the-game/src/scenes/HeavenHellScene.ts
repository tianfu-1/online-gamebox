import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class HeavenHellScene extends MinigameScene {
    //Images
    private startGhost !: Phaser.GameObjects.Image;
    private hellGhost;
    private heavenGhost;
    private clicker !: Phaser.GameObjects.Image;
    private swing !: Phaser.GameObjects.Image;

    //values

    //clicker values:
    private clickableWidth = 100;
    private clickerSwingTime = 750; //in ms

    private swingStartX = 162;
    private swingEndX = 691;

    private physicsShapes;
    
    private cameraFollowConfig = {lerp: 0.8, offsetX: 0, offsetY: 75};

    private startButtonConfig = [
        {x: 274, y: 32.8,
            image: CONST.HEAVENHELL.SIGN_HELL,
            onClick: () => {this.startHellMinigame()},
            firstYMove: 24.5,
            secondYMove: -264.5
        },
        {x: 618.72, y: 316,
            image: CONST.HEAVENHELL.SIGN_HEAVEN,
            onClick: () => {this.startHeavenMinigame()},
            firstYMove: -24.5,
            secondYMove: 264.5
        },
    ];

    private hellGhostConfig = {
        scaleX: -1,
        image: CONST.HEAVENHELL.GHOST_SIDE,
        moveSpeed: 107,

        winPos: {x: -1895, y: -81},
        losePos: {x: -1640, y: 306}
    };

    private hellDuckConfig = [
        {startX: -206, startY: 404,
         endX: -400, endY: 461, 
         tweenTime: 2000,
         scaleX: -1,
         scaleY: 1,
         image: CONST.HEAVENHELL.NORMAL_DUCK,
         shape: "suck-a-duck"},

         {startX: -568, startY: 390,
            endX: -575, endY: 254, 
            tweenTime: 2000,
            scaleX: 1,
            scaleY: 1,
            image: CONST.HEAVENHELL.EVIL_DUCK,
            shape: "duck-devil"},

        {startX: -874, startY: 464,
            endX: -881, endY: 329, 
            tweenTime: 2000,
            scaleX: 1,
            scaleY: 1,
            image: CONST.HEAVENHELL.EVIL_DUCK,
            shape: "duck-devil"},

        {startX: -1222, startY: 265,
            endX: -1057, endY: 186, 
            tweenTime: 2000,
            scaleX: 1,
            scaleY: 1,
            image: CONST.HEAVENHELL.NORMAL_DUCK,
            shape: "suck-a-duck"},

        {startX: -1275, startY: 109,
            endX: -987, endY: -77, 
            tweenTime: 2000,
            scaleX: 1,
            scaleY: 1,
            image: CONST.HEAVENHELL.EVIL_DUCK,
            shape: "duck-devil"},

        {startX: -1298, startY: -61,
            endX: -1508, endY: -257, 
            tweenTime: 2000,
            scaleX: -1,
            scaleY: 1,
            image: CONST.HEAVENHELL.NORMAL_DUCK,
            shape: "suck-a-duck"},

        {startX: -1340, startY: 558,
            endX: -1219, endY: 355, 
            tweenTime: 2000,
            scaleX: 1,
            scaleY: 1,
            image: CONST.HEAVENHELL.EVIL_DUCK,
            shape: "duck-devil"},

    ];

    private heavenSteps = [
        {x: 612, y: 191},
        {x: 665, y: 140},
        {x: 715, y: 90},
        {x: 768, y: 38},
        {x: 819, y: -14},
        {x: 870, y: -66},
        {x: 921, y: -117},
        {x: 970, y: -168},
        {x: 1021, y: -221},
        {x: 1074, y: -271},
        {x: 1128, y: -322},
        {x: 1179, y: -375},
        {x: 1233, y: -427},
        {x: 1282, y: -477},
        {x: 1331, y: -527},
        {x: 1386, y: -584},
        {x: 1434, y: -634},
        {x: 1487, y: -684},
        {x: 1541, y: -736},
        {x: 1589, y: -788},
        {x: 1661, y: -839},
    ];

    private heavenClouds = [
       {scrollFactor: 2,
         depth: 10,
        clouds: [
            {x: 920, y: -209, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1271, y: -505, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 729, y: 102, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1064, y: -458, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1704, y: -1192, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1912, y: -1239, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1561, y: -943, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1370, y: -633, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1237, y: -30, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1429, y: -340, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1557, y: -1279, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1764, y: -1326, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1413, y: -1029, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1222, y: -719, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1090, y: -116, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1281, y: -427, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1632, y: -723, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1425, y: -676, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1780, y: -637, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1572, y: -590, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 2080, y: -652, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 2287, y: -699, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1936, y: -402, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1745, y: -92, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1877, y: -694, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 2069, y: -1005, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 2419, y: -1301, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 2212, y: -1254, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 2227, y: -565, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 2435, y: -612, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 2084, y: -316, image: CONST.HEAVENHELL.CLOUD_5},
        ]},
        {scrollFactor: 1.5,
            depth: 9,
           clouds: [
            {x: 1748, y: -1125, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1955, y: -1172, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1604, y: -875, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1413, y: -565, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1545, y: -1167, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1736, y: -1478, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 2087, y: -1774, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1880, y: -1727, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 866, y: -346, image: CONST.HEAVENHELL.CLOUD_4},
            {x: 1126, y: -348, image: CONST.HEAVENHELL.CLOUD_3},
            {x: 866, y: -561, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1074, y: -608, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 723, y: -311, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 532, y: -1, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 399, y: 602, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 591, y: 291, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 942, y: -5, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 734, y: 42, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 2054, y: -546, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 2262, y: -593, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1911, y: -296, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1719, y: 14, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1852, y: -588, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 2043, y: -899, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 2394, y: -1195, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 2186, y: -1148, image: CONST.HEAVENHELL.CLOUD_1},
           ]},
        {scrollFactor: 1.1,
        depth: 8,
        clouds: [
            {x: 1170, y: -195, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1378, y: -242, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1027, y: 55, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 835, y: 365, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 968, y: -237, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1159, y: -548, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1510, y: -844, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1302, y: -797, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 760, y: 5, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 775, y: -123, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1434, y: -1237, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1642, y: -1284, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1291, y: -987, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1099, y: -677, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 967, y: -74, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1159, y: -384, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1509, y: -681, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1302, y: -634, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1497, y: 1, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1704, y: -46, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1354, y: 251, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1162, y: 561, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1294, y: -42, image: CONST.HEAVENHELL.CLOUD_2},
            {x: 1486, y: -352, image: CONST.HEAVENHELL.CLOUD_5},
            {x: 1837, y: -649, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 1629, y: -602, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 1498, y: -162, image: CONST.HEAVENHELL.CLOUD_1},
            {x: 970, y: 513, image: CONST.HEAVENHELL.CLOUD_7},
            {x: 955, y: 641, image: CONST.HEAVENHELL.CLOUD_1},
            
        ]},
    ];
    //logic vars
    private hellGhostCollisionCategory;
    private startSigns = [];
    private isPlaying = false;
    private isHell = false;

    private hellFollowRect;
    private hellDucks = [];

    private clickerMovingRight !: boolean;
    private swingTimer !: number;

    constructor(){
        super ({
            sceneName: CONST.SCENES.HEAVENHELL,
            duration: 20000,
            showCountdown: false,
            startScreenColor: 0x521590,
            startText: "CHOOSE!",
            startTextColor: 0xFFFFFF,
            endScreen: CONST.HEAVENHELL.END,
            nextScene: CONST.SCENES.CREDITS,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 386, scale: 1.30},
                normalWithSkip: {x: 283, y: 386, scale: 1.30},
                skip: {x: 570, y: 386, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.startSigns = [];

        this.isPlaying = false;
        this.isHell = false;

        this.hellGhost = null;
        this.hellFollowRect = null;
        this.hellDucks = [];

        this.clickerMovingRight = true;
        this.swingTimer = 0;
    }

    _preload(){
    }

    _create(){
        this.initPhysics();
        this.createStaticCombined();
        this.createButtons();
        this.createGhost();
        this.createHellLevel();

        this.initHeavenImages();

        //this.cameras.main.setZoom(0.1);
    }

    private initPhysics(){
        this.physicsShapes = this.cache.json.get(CONST.PHYSICS.HEAVENHELL_SHAPES);

        this.hellGhostCollisionCategory = 2;//this.matter.world.nextCategory();

        this.matter.world.on('collisionstart', function (event, bodyA, bodyB) {
            if (bodyA.gameObject.body.label === "ghost-side" && bodyB.gameObject.body.label === "suck-a-duck"
                || bodyA.gameObject.body.label === "ghost-side" && bodyB.gameObject.body.label === "duck-devil"
                ||bodyB.gameObject.body.label === "ghost-side" && bodyA.gameObject.body.label === "suck-a-duck"
                || bodyB.gameObject.body.label === "ghost-side" && bodyA.gameObject.body.label === "duck-devil"){
                    this.hellGhost.die();
            }
        }, this);
    }

    private createStaticCombined(){
        this.add.image(1542, -209, CONST.HEAVENHELL.HEAVEN_BACKGROUND).setScale(2.336, 122.7).setDepth(0);
        this.add.image(426.5, 240, CONST.HEAVENHELL.START_CLOUD).setDepth(15);

        for (var i = 0; i < 4; i++){
            this.add.image(-1519.4, 1581, CONST.HEAVENHELL.HELL_BACKGROUND).setScale(6.89, 29380);
        }
    }

    private createButtons(){
        this.startButtonConfig.forEach(config => {
            var button = this.add.image(config.x, config.y, config.image)
                                    .setInteractive(this.input.makePixelPerfect())
                                    .setDepth(200);
            
            button.config = config;
            button.hoverStart = null;
            button.hoverEnd = null;
            button.isInteractable = true;

            button.on("pointerover", function() {
                if (!button.isInteractable) return;
                if (button.hoverEnd != null) button.hoverEnd.stop();
                button.hoverStart = this.tweens.add({
                    targets: button,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    ease: 'Sine.easeOut',
                    duration: 83,
                    repeat: 0,
                    yoyo: false,
                }); 
            }, this);

            button.on("pointerout", function() {
                if (!button.isInteractable) return;
                if (button.hoverStart != null) button.hoverStart.stop();
                button.hoverEnd = this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY:1,
                    ease: 'Sine.easeOut',
                    duration: 83,
                    repeat: 0,
                    yoyo: false,
                });
            }, this);

            button.on("pointerup", function() {
                button.config.onClick();

                this.startSigns.forEach(sign => {
                    sign.slideOut();
                });
            }, this);

            button.slideOut = () => {
                if (!button.isInteractable) return;
                if (button.hoverStart != null) button.hoverStart.stop();
                if (button.hoverEnd != null) button.hoverEnd.stop();

                this.tweens.timeline({
                    targets: button,
                    ease: 'Cubic.easeInOut',
                    duration: 500,
                    loop: 0,
                
                    tweens: [
                        {
                            targets: button,
                            y: button.y + button.config.firstYMove,
                            duration: 166,
                            repeat: 0,
                            yoyo: false,
                        },
                        {
                            targets: button,
                            y: button.y + button.config.secondYMove,
                            alpha: 0,
                            duration: 583,
                            repeat: 0,
                            yoyo: false,
                        },
                    ]
                });
            }

            this.startSigns.push(button);
        });
    }

    private createGhost() {
        this.startGhost = this.add.image(435.4, 233.4, CONST.HEAVENHELL.START_GHOST).setOrigin(0.518, 0.9131).setDepth(20);

        this.cameras.main.startFollow(this.startGhost, undefined, this.cameraFollowConfig.lerp, this.cameraFollowConfig.lerp, this.cameraFollowConfig.offsetX, this.cameraFollowConfig.offsetY);
    }

    private startHellMinigame(){
        this.startGhost.setVisible(false);
        this.initHellGhost();
        this.initHellFollowRect();
        this.initHellDucks();

        this.isPlaying = true;
        this.isHell = true;
    }

    private initHellGhost(){
        var ghost = this.matter.add.image(422.5, 234.6, CONST.HEAVENHELL.GHOST_SIDE, undefined, {shape: this.physicsShapes["ghost-side"]})
                                    .setScale(this.hellGhostConfig.scaleX, 1)
                                    .setDepth(20)
                                    .setStatic(false)
                                    .setIgnoreGravity(true);

        ghost.setCollisionCategory(this.hellGhostCollisionCategory);
        ghost.isActive = false;

        ghost.onUpdate = (delta: number) => {
            ghost.setDepth(this.getHellSortingOrder(ghost.y));
            if (!ghost.isActive) {
                ghost.setVelocity(0, 0);
                return;
            }

           ghost.setAngle(0);

           var moveVector = this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
           moveVector = new Phaser.Math.Vector2(moveVector.x - ghost.x, moveVector.y - ghost.y).scale(1.5/60);

           ghost.setVelocity(moveVector.x, moveVector.y);

           ghost.checkForWin();
        };

        ghost.checkForWin = () => {
            if (ghost.x < this.hellGhostConfig.winPos.x && ghost.y < this.hellGhostConfig.winPos.y){
                ghost.isActive = false;
                this.tweens.add({
                    targets: ghost,
                    scaleX: -2,
                    scaleY: 2,
                    alpha: 0,
                    tint: "0xFF0000",
                    ease: 'Linear',
                    duration: 1000,
                    repeat: 0,
                    yoyo: false,
                    onComplete: () => {},
                });

                this.triggerWin(true);
            } else if (ghost.x < this.hellGhostConfig.losePos.x && ghost.y > this.hellGhostConfig.losePos.y){
                ghost.die();
            }
        };

        ghost.die = () => {
            if (!ghost.isActive) return;

            ghost.setCollidesWith([]);
            this.triggerLose(true);
            ghost.isActive = false;

            this.tweens.timeline({
                targets: ghost,
                ease: 'Cubic.easeInOut',
                duration: 1000,
                loop: 0,
            
                tweens: [
                    {
                        targets: ghost,
                        scaleX: -1.2,
                        scaleY: 1.2,
                        angle: 47,
                        duration: 250,
                    },
                    {
                        targets: ghost,
                        scaleX: 0.1,
                        scaleY: 0.1,
                        angle: -250,
                        alpha: 0.3,
                        duration: 1200,
                    },
                ]
            });
        }

        this.tweens.add({
            targets: ghost,
            x: 212.8,
            y: 281.6,
            ease: 'Sine.easeInOut',
            duration: 400,
            repeat: 0,
            yoyo: false,
            onComplete: () => {ghost.isActive = true},
        });

        this.cameras.main.startFollow(ghost, undefined, this.cameraFollowConfig.lerp, this.cameraFollowConfig.lerp, this.cameraFollowConfig.offsetX, this.cameraFollowConfig.offsetY);

        this.hellGhost = ghost;
    }

    private initHellFollowRect(){
        //var rect = this.matter.add.rectangle(500, 240, 60, 480, {label: 'walll', isStatic: false, ignoreGravity: true});
        var rect = this.matter.add.image(800, 240, CONST.FLY.WHITE_SQUARE, undefined, {isStatic: true}).setScale(0.5, 30).setAlpha(0);


        rect.onUpdate = () => {
            if (!this.hellGhost.isActive) return;
            var newX = this.hellGhost.x + 150;
            if (newX < rect.x){
                rect.x = newX;
            }

            rect.y = this.hellGhost.y;
        }

        this.hellFollowRect = rect;
    }

    private initHellDucks(){
        this.hellDuckConfig.forEach((config) => {
            var duck = this.matter.add.image(config.startX, config.startY, config.image, undefined, {shape: this.physicsShapes[config.shape]})
                    .setCollidesWith([this.hellGhostCollisionCategory])
                    .setScale(config.scaleX, config.scaleY)
                    .setDepth(20)
                    .setStatic(false)
                    .setIgnoreGravity(true);
                        
            this.hellDucks.push(duck);

            this.tweens.add({
                targets: duck,
                    x: config.endX,
                    y: config.endY,
                    ease: 'Sine.easeInOut',
                    duration: config.tweenTime,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: () => {
                        duck.setDepth(this.getHellSortingOrder(duck.y));
                    },
                    progress: Math.random(),
            });

        });
    }

    private getHellSortingOrder(y: number) : number{
        var minY = -300;
        var maxY = 700;
        var minD = 100;
        var maxD = 250;
        return (y - minY)*(maxD - minD)/(maxY - minY) + minD;
    }

    private createHellLevel(){
        this.matter.add.image(-760, 66, CONST.HEAVENHELL.ROAD, undefined, {shape: this.physicsShapes.road}).setDepth(50).setCollidesWith([this.hellGhostCollisionCategory]); 
        this.add.image(-672.8, 551, CONST.HEAVENHELL.ROAD_FIRE).setDepth(300);
    }

    private startHeavenMinigame(){
        this.isPlaying = true;
        this.isHell = false;
        this.initHeavenClicker();
        this.startGhost.setVisible(false);
        this.initHeavenGhost();
    }

    private initHeavenImages(){
        this.add.image(706.92, 139.7, CONST.HEAVENHELL.STAIRS_START).setAngle(-45).setDepth(50);
        this.add.image(1097.7, -259.73, CONST.HEAVENHELL.STAIRS_MID).setAngle(-45).setDepth(51);
        this.add.image(1602.57, -854.4, CONST.HEAVENHELL.STAIRS_END).setDepth(52);

        this.heavenClouds.forEach(cloudConfig => {
            for (let cloud of cloudConfig.clouds){
                this.add.image(cloud.x, cloud.y, cloud.image).setScale(1.2).setDepth(cloudConfig.depth).setScrollFactor(cloudConfig.scrollFactor, cloudConfig.scrollFactor);
            }
        });
    }

    private initHeavenClicker(){
        this.swing = this.add.image(426, 413, CONST.HEAVENHELL.SWING).setDepth(900).setScrollFactor(0);
        this.clicker = this.add.image(426, 413, CONST.HEAVENHELL.CLICKER).setDepth(900).setScrollFactor(0);

        this.input.on("pointerdown", () => {
            this.handleHeavenClick();
        })
    }

    private handleHeavenClick(){
        if (this.isPlaying && !this.isHell){
                this.heavenGhost.moveToStep(this.isClickerWithinLimits())
        }
    }

    private initHeavenGhost(){
        var ghost = this.add.image(458, 238, CONST.HEAVENHELL.GHOST_SIDE)
        .setOrigin(0.784, 0.9933)
        .setDepth(100);

        ghost.currentStep = 0;
        ghost.currentTween = null;
        ghost.isActive = true;

        ghost.moveToStep = (up: boolean) => {
            if (ghost.currentTween != null) ghost.currentTween.stop();

            ghost.currentStep += up ? 1 : -1;
            if (ghost.currentStep < 0 ) {
                ghost.currentStep = 0;
            }

            if (ghost.currentStep >= this.heavenSteps.length){
                ghost.animateWin();
                ghost.isActive = false;
                return;
            }
            if (up){
                ghost.currentTween = this.tweens.timeline({
                    targets: ghost,
                    ease: 'Linear',
                    duration: 500,
                    loop: 0,
                
                    tweens: [
                        {
                            targets: ghost,
                            x: this.heavenSteps[ghost.currentStep].x - 25,
                            y: this.heavenSteps[ghost.currentStep].y - 15,
                            ease: 'Linear',
                            duration: 250,
                        },
                        {
                            targets: ghost,
                            x: this.heavenSteps[ghost.currentStep].x,
                            y: this.heavenSteps[ghost.currentStep].y,
                            ease: 'Linear',
                            duration: 250,
                        },
                    ]
                });
            } else {
                ghost.currentTween = this.tweens.add({
                    targets: ghost,
                    x: this.heavenSteps[ghost.currentStep].x,
                    y: this.heavenSteps[ghost.currentStep].y,
                    ease: 'Linear',
                    duration: 500,
                });
            }
        };

        ghost.animateWin = () => {
            if (ghost.currentTween != null) ghost.currentTween.stop();

            ghost.currentTween = this.tweens.add({
                targets: ghost,
                x: "+=284",
                y: "-=28",
                scaleX: 1.4,
                scaleY: 1.4,
                alpha: 0,
                ease: 'Sine.easeIn',
                duration: 1000,
            });

            this.triggerWin(false);
        };


        ghost.moveToStep(0);
        this.cameras.main.startFollow(ghost, undefined, 0.02, 0.02, this.cameraFollowConfig.offsetX, this.cameraFollowConfig.offsetY);
        this.heavenGhost = ghost;
    }

    private isClickerWithinLimits() : boolean{
        return Phaser.Math.Difference(this.clicker.x, this.swing.x) < this.clickableWidth;
    }

    _update(time: number, delta: number){
        if (this.isPlaying){
            if (this.isHell){
                this.hellGhost.onUpdate(delta);
                this.hellFollowRect.onUpdate();
            } else {
                this.moveClicker(delta);
            }
        }
    }

    private moveClicker(delta: number){
        if (this.clickerMovingRight){
            this.swingTimer += delta / this.clickerSwingTime;

            if (this.swingTimer >= 1){
                this.clickerMovingRight = !this.clickerMovingRight;
                this.swingTimer = 1;
            }
        } else {
            this.swingTimer -= delta / this.clickerSwingTime;

            if (this.swingTimer <= 0){
                this.clickerMovingRight = !this.clickerMovingRight;
                this.swingTimer = 0;
            }
        }
        this.clicker.x = Phaser.Math.Interpolation.SmoothStep(this.swingTimer, this.swingStartX, this.swingEndX);
    }  

    _timeout(){
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(isHell: boolean){
        this.loseGame(1000);
    }

    private triggerWin(isHell: boolean){
        this.registry.set(CONST.REGISTRY.HELL_COMPLETED, isHell);
        //trigger win after 1 second and load next scene
        this.winGame(1500);
    }
}
