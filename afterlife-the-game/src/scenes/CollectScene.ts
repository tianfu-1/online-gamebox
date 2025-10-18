import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class CollectScene extends MinigameScene {
    //Images

    //values
    private worldColliders = [
        //Top left
        {x: 66.5, y: 74.5, width: 75, height: 85},
        {x: 132, y: 34.5, width: 44, height: 27},
        {x: 252, y: 46, width: 154, height: 50},
        {x: 387.5, y: 68.5, width: 85, height: 123},
        {x: 295.5, y: 142, width: 311, height: 16},
        {x: 444, y: 69, width: 16, height: 132},
        {x: 502.5, y: 57.5, width: 57, height: 45},
        {x: 136.5, y: 100.5, width: 61, height: -17},
        {x: 158.5, y: 120, width: 29, height: -22},

        //Bottom left
        {x: 127, y: 415, width: 116, height: 102},
        {x: 94, y: 344.5, width: 40, height: 25},
        {x: 268, y: 296, width: 88, height: 120},
        {x: 232.5, y: 433, width: 77, height: 66},
        {x: 356, y: 348.5, width: 46, height: 259},
        {x: 214.5, y: 381.5, width: 59, height: 21},

        //right
        {x: 729, y: 242.5, width: 176, height: 197},
        {x: 450.5, y: 174.5, width: 29, height: 37},

        //lake
        {x: 497, y: 368.5, width: 42, height: 65},
        {x: 540.5, y: 363, width: 39, height: 40},
        {x: 587, y: 353.5, width: 50, height: 43},
    ];

    private costumes = [
        {costumeSet: 0, image: CONST.COLLECT.PLAYER_0},
        {costumeSet: 1, image: CONST.COLLECT.PLAYER_1},
        {costumeSet: 2, image: CONST.COLLECT.PLAYER_2},
        {costumeSet: 3, image: CONST.COLLECT.PLAYER_3},
    ];

    private candies = [
        {image: CONST.COLLECT.CANDY_5, spawnPosition: new Phaser.Math.Vector2(746, 418), scaleOverride: 0.30, angleOverride: 33},
        {image: CONST.COLLECT.CANDY_4, spawnPosition: new Phaser.Math.Vector2(76, 153), scaleOverride: 0.457, angleOverride: 0},
        {image: CONST.COLLECT.CANDY_2, spawnPosition: new Phaser.Math.Vector2(743, 73), scaleOverride: 0.69, angleOverride: -44},
        {image: CONST.COLLECT.CANDY_1, spawnPosition: new Phaser.Math.Vector2(136, 295), scaleOverride: 0.597, angleOverride: 33},
        {image: CONST.COLLECT.CANDY_3, spawnPosition: new Phaser.Math.Vector2(580, 253), scaleOverride: 0.34, angleOverride: 0},
    ];

    private playerSpawnPosition = {x: 51, y: 183};
    private moveForce = 0.03;
    private candyCollectDistance = 75;

    //logic vars
    private player;
    private currentCandy = -1;
    private candyObject;

    //Debug utility for logging physics rectangles
    //private rectInfo = {}; 

    constructor(){
        super ({
            sceneName: CONST.SCENES.COLLECT,
            duration: 36000,
            showCountdown: true,
            startScreenColor: 0x52E736,
            startText: "COLLECT!",
            startTextColor: 0x323232,
            endScreen: CONST.COLLECT.END,
            nextScene: CONST.SCENES.SORT,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 386, scale: 1.30},
                normalWithSkip: {x: 283, y: 386, scale: 1.30},
                skip: {x: 570, y: 386, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.player = null;
        this.currentCandy = -1;
        this.candyObject = null;
    }

    _preload(){
    }

    _create(){
        this.addBackgroundImage(CONST.COLLECT.BACKGROUND);

        this.initPhysics();
        this.spawnPlayer();

        this.spawnNextCandy();
    }

    private initPhysics(){
        //Add world bounds and table
        this.matter.world.setBounds(0, 0, this.game.renderer.width, this.game.renderer.height);

        this.worldColliders.forEach((worldCol) => {
            this.matter.add.rectangle(worldCol.x, worldCol.y, worldCol.width, worldCol.height, {isStatic: true});
        })
    }

    private spawnPlayer(){
        var player = this.matter.add.image(this.playerSpawnPosition.x, 
                                           this.playerSpawnPosition.y, 
                                           this.costumes[0].image, //HACK pt.1 : init all players with the same texture to force identical hitbox for all costumes
                                           null,
                                           {chamfer: {radius: 55},
                                            ignoreGravity: true,
                                            frictionAir: 0,
                                            friction: 0,
                                            })
                        .setDepth(10)
                        .setScale(0.375);
        
        player.setTexture(this.getCostumeImageKey()); //HACK pt.2: apply correct texture now that hitbox is initialized
        player.isTouching = false;

        player.update = (delta: number) => {
            var pointer = this.input.activePointer.position;
            var moveVector = new Phaser.Math.Vector2(pointer.x - player.x, pointer.y - player.y);

            player.rotateToPointer(moveVector);
            player.move(delta, moveVector);
        }

        player.rotateToPointer = (moveVector: Phaser.Math.Vector2) => {
            player.setRotation(moveVector.angle() + + Math.PI/2);
        }

        player.move = (delta: number, moveVector: Phaser.Math.Vector2) => {
            if (!player.isTouching) return;
            player.applyForce(moveVector.normalize().scale(delta/1000 * this.moveForce));
        }

        this.player = player;

        this.input.on('pointerdown', function(pointer){
            this.player.isTouching = true;

            //Debug utility for logging physics rectangles
            //this.rectInfo.startX = pointer.x;
            //this.rectInfo.startY = pointer.y;

         }, this);

         this.input.on('pointerup', function(pointer){
            this.player.isTouching = false;

            //Debug utility for logging physics rectangles
            // var center = {x: this.rectInfo.startX + (pointer.x - this.rectInfo.startX)/2, 
            //                 y: this.rectInfo.startY + (pointer.y - this.rectInfo.startY)/2,
            //                 width: (pointer.x - this.rectInfo.startX),
            //                 height: (pointer.y - this.rectInfo.startY)};
            // console.log("{x: " + center.x + ", y: " + center.y + ", width: " + center.width + ", height: " + center.height + "},");

         }, this);
    }

    private getCostumeImageKey() : string {
        var costumeSet = this.storagePlugin.getItem(CONST.STORAGE_KEYS.DRESSUP_COSTUME);
        if (!costumeSet){
            costumeSet = 0;
        }
        return this.costumes.find(c => c.costumeSet == costumeSet).image;
    }

    private spawnNextCandy(){
        this.currentCandy++;
        if (this.currentCandy >= this.candies.length){
           this.triggerWin();
           return;
        }

        var candyConfig = this.candies[this.currentCandy];

        var candy = this.addAnimation(candyConfig.image, CONST.ANIMATIONS.CANDY_DIE, 60)
                        .setOffset(-76, -153)
                        .setPositionOverride(candyConfig.spawnPosition.x, candyConfig.spawnPosition.y)
                        .setScaleMultiplier(candyConfig.scaleOverride)
                        .setAngleOffset(candyConfig.angleOverride)
                        .setDepth(90)
                        .setLoop(false)
                        .setPlaybackSpeed(-1)
                        .setAnimFinishCallback(() => {
                            //Set up idle animation after start animation is done
                            candy.setAnimation(this.cache.json.get(CONST.ANIMATIONS.CANDY_IDLE))
                                .setLoop(true)
                                .setPlaybackSpeed(1)
                                .start();
                        })
                        .start();

        candy.isActive = true;

        candy.onUpdate = (delta: number) => {
            if (!candy.isActive) return;

            candy.checkDistanceToPlayer();
        };

        candy.checkDistanceToPlayer = () => {
            var distance =  Phaser.Math.Distance.Between(candy.image.x, candy.image.y, this.player.x, this.player.y);
            //Deactivate candy and spawn new candy
            if (distance <= this.candyCollectDistance){
                candy.isActive = false;
                candy.setAnimation(this.cache.json.get(CONST.ANIMATIONS.CANDY_DIE))
                        .setPlaybackSpeed(1)
                        .setLoop(false)
                        .setAnimFinishCallback(() => {candy.image.setVisible(false)});

                this.spawnNextCandy();

                this.sound.play(CONST.AUDIO.WINK, {detune: this.getDetune(), volume: 10.0});

            }
        }

        this.candyObject = candy;
    }

    _update(time: number, delta: number){
        this.player.update(delta);

        this.candyObject.onUpdate(delta);
    }

    _timeout(){
        this.triggerLose();
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.loseGame();
    }

    private triggerWin(){
        //trigger win after 1 second and load next scene
        this.winGame(1500);
    }
}
