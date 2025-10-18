import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class SortScene extends MinigameScene {
    //Images
    private ghost !: Phaser.GameObjects.Image;

    //values
    private itemConfig = [
        //Yellow candy
        {image: CONST.SORT.CANDY_1, 
            startX: 525, 
            startY: 68, 
            startAngle: 0,
            isTrash: false,
            trash: {x: 538, y: 246, scale: 0.83, angle: -93, depth: 10},
            pumpkin: {x: 212, y: 222, scale: 1.0, angle: 28, depth: 10}
        },

        //purple candy
        {image: CONST.SORT.CANDY_2, 
            startX: 99, 
            startY: 107, 
            startAngle: 0,
            isTrash: false,
            trash: {x: 669, y: 207, scale: 0.91, angle: 29, depth: 10},
            pumpkin: {x: 181, y: 293, scale: 0.85, angle: -118, depth: 10}
        },

        //Chocolate
        {image: CONST.SORT.CANDY_3, 
            startX: 750, 
            startY: 71,
            startAngle: -44.2,
            isTrash: false,
            trash: {x: 591, y: 289, scale: 1, angle: -110, depth: 10},
            pumpkin: {x: 338, y: 269, scale: 1, angle: -103, depth: 10}
        },

        //Lollipop
        {image: CONST.SORT.CANDY_4, 
            startX: 796, 
            startY: 241, 
            startAngle: 1,
            isTrash: false,
            trash: {x: 658, y: 255, scale: 1, angle: -153, depth: 10},
            pumpkin: {x: 257.5, y: 266.6, scale: 1, angle: -164, depth: 10}
        },

        //nom
        {image: CONST.SORT.CANDY_5, 
            startX: 438, 
            startY: 161, 
            startAngle: 0,
            isTrash: false,
            trash: {x: 582, y: 200, scale: 0.91, angle: -12, depth: 10},
            pumpkin: {x: 286, y: 215, scale: 0.92, angle: 7, depth: 10}
        },

        {image: CONST.SORT.RAZOR, 
            startX: 59, 
            startY: 238, 
            startAngle: 0,
            isTrash: true,
            trash: {x: 560, y: 216, scale: 1, angle: -44, depth: 10},
            pumpkin: {x: 224, y: 294, scale: 0.76, angle: 174, depth: 10}
        },

        {image: CONST.SORT.MEAT, 
            startX: 84, 
            startY: 350, 
            startAngle: 16,
            isTrash: true,
            trash: {x: 580, y: 273, scale: 0.76, angle: -43, depth: 10},
            pumpkin: {x: 202, y: 250, scale: 0.81, angle: 9, depth: 10}
        },

        {image: CONST.SORT.TOOTHBRUSH, 
            startX: 327, 
            startY: 73, 
            startAngle: -26,
            isTrash: true,
            trash: {x: 706, y: 269, scale: 1, angle: 46, depth: 10},
            pumpkin: {x: 258, y: 246, scale: 1, angle: -5, depth: 10}
        },

        {image: CONST.SORT.BROCCOLI, 
            startX: 780, 
            startY: 341, 
            startAngle: 0,
            isTrash: true,
            trash: {x: 660, y: 263, scale: 1, angle: 47, depth: 10},
            pumpkin: {x: 321, y: 265, scale: 1, angle: -87, depth: 10}
        },
    ];

    private basketPosition = {x: 260, y: 250};
    private trashPosition = {x: 615, y: 253};
    private maxCupDistance = 110;

    private dragDepth = 101;
    private idleDepth = 50;

    //logic vars
    private items = [];
    private itemDepth = 10;
    private sortedItemsCount = 0;


    constructor(){
        super ({
            sceneName: CONST.SCENES.SORT,
            duration: 14000,
            showCountdown: true,
            startScreenColor: 0xFF9090,
            startText: "SORT!",
            startTextColor: 0x323232,
            endScreen: CONST.SORT.END,
            nextScene: CONST.SCENES.GHOSTBUSTERS,
            endButtons: {
                normalNoSkip: {x: 688, y: 293, scale: 1.25},
                normalWithSkip: {x: 688, y: 293, scale: 1.25},
                skip: {x: 688, y: 395, scale: 1.25}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.items = [];
        this.itemDepth = 10;
        this.sortedItemsCount = 0;
    }

    _preload(){
    }

    _create(){
        this.addBackgroundImage(CONST.SORT.BACKGROUND);
        this.add.image(426.5, 431, CONST.SORT.SORT_TEXT).setDepth(1);

        this.spawnGhost();
        this.addBins();
        this.spawnItems();
    }

    private spawnGhost() {
        this.ghost = this.add.image(731, 485, CONST.SORT.GHOST).setDepth(200).setScale(0.93);
    }

    private addBins(){
        this.add.image(this.basketPosition.x, this.basketPosition.y, CONST.SORT.PUMPKIN_BACK).setDepth(1);
        this.add.image(this.basketPosition.x, this.basketPosition.y + 50, CONST.SORT.PUMPKIN_FRONT).setDepth(100);

        this.add.image(this.trashPosition.x, this.trashPosition.y, CONST.SORT.TRASH_BACK).setDepth(1);
        this.add.image(this.trashPosition.x, this.trashPosition.y, CONST.SORT.TRASH_FRONT).setDepth(100);
    }

    private spawnItems(){
        this.itemConfig.forEach(config => {

            var item = this.add.image(config.startX, config.startY, config.image)
                                            .setDepth(50)
                                            .setAngle(config.startAngle)
                                            .setInteractive(this.input.makePixelPerfect());

            this.input.setDraggable(item);

            this.items.push({key: config.image,
                                    image: item, 
                                    isTrash: config.isTrash,
                                    config: config,
                                    sortedCorrectly: false,
                                    putInCup: (item, depth, isBasket) => {
                                        //Disable draggable
                                        this.input.disable(item.image);

                                        //Override tint for razor
                                        if (!isBasket && item.key === CONST.SORT.RAZOR){
                                            item.image.setTint(0xCACACA);
                                        }

                                        //Animate
                                        var targetTransform = isBasket ? item.config.pumpkin : item.config.trash;
                                        this.tweens.add({
                                            targets: item.image,
                                            x: targetTransform.x,
                                            y: targetTransform.y,
                                            scaleX: targetTransform.scale,
                                            scaleY: targetTransform.scale,
                                            angle: targetTransform.angle,

                                            ease: 'Cubic',
                                            duration: 200,
                                            repeat: 0,
                                            yoyo: false,
                                            onComplete: () => {item.image.setDepth(targetTransform.depth)},
                                        });
                                    }
                                });
        });

        this.input.on('dragstart', function (pointer, gameObject) {
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            gameObject.setDepth(this.dragDepth);

            //this.children.bringToTop(gameObject);
            this.sound.play(CONST.AUDIO.GRAB, {detune: this.getDetune()});
        }, this);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', function(pointer, gameObject, dropped){
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            gameObject.setDepth(this.idleDepth);
            this.PutInCup(gameObject);
            this.sound.play(CONST.AUDIO.GRAB, {detune: this.getDetune()});
        }, this);
    }

    private PutInCup(gameObject: Phaser.GameObjects.Image){
        var isInBasket = this.isItemInCup(true, gameObject);
        var isInTrash = this.isItemInCup(false, gameObject);

        if (!(isInBasket || isInTrash)) return;

        this.items.forEach((item) => {
            if (item.key === gameObject.texture.key){
                this.itemDepth++;
                this.sortedItemsCount++;

                item.sortedCorrectly = item.isTrash === isInTrash;
                item.putInCup(item, this.itemDepth, isInBasket);
                this.CheckForWin();
                return;
            }
        })
    }

    private isItemInCup(basket: boolean, gameObject: Phaser.GameObjects.Image) : boolean{
        var distanceToCup = Phaser.Math.Distance.Between(gameObject.x, 
                                                         gameObject.y, 
                                                         basket ? this.basketPosition.x : this.trashPosition.x, 
                                                         basket ? this.basketPosition.y : this.trashPosition.y);
        return distanceToCup <= this.maxCupDistance;
    }

    private CheckForWin(){
        var solved = true;
        for(let item of this.items){
            if (!item.sortedCorrectly){
                solved = false;
                break;
            }
        }

        if (solved){
            this.triggerWin();
        } else if (this.sortedItemsCount === this.items.length){
            //All sorted but not correct solution -> trigger loss
            this.triggerLose(500);
        }
    }

    _update(time: number, delta: number){
        this.ghost.x = Phaser.Math.Interpolation.SmoothStep(0.1, this.ghost.x, this.input.activePointer.x);
    }

    _timeout(){
        this.triggerLose(0);
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(delay: number){
        this.loseGame(delay);
    }

    private triggerWin(){
        var winGhost = this.add.image(238, 685, CONST.SORT.WIN_GHOST).setDepth(502);

        this.time.delayedCall(400, () => {
            this.add.image(0, 0, CONST.SORT.WIN_BACKGROUND).setOrigin(0, 0).setDepth(500)}, null, this);

        this.tweens.add({
            targets: winGhost,
            x: 230.8,
            y: 244.8,

            ease: 'Sine.easeOut',
            duration: 1700,
            delay: 500,
            repeat: 0,
            yoyo: false,
        });

        this.winGame(3000);
    }
}
