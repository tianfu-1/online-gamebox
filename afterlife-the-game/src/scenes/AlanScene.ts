import { CONST } from "../CONST";
import { OMGLogger } from "../util/OMGLogger";
import { MinigameScene } from "./generic/MinigameScene";

export class AlanScene extends MinigameScene {
    //Images

    //values
    private objectConfig = [
        {x: 251, y: 329, angle: 0, scale: 1, image: CONST.ALAN.MUG, isPaper: false},
        {x: 390, y: 404, angle: 0, scale: 1, image: CONST.ALAN.PENCIL, isPaper: false},
        {x: 389, y: 378,  angle: 0, scale: 1,  image: CONST.ALAN.PEN, isPaper: false},
        {x: 360, y: 435, angle: 0, scale: 1, image: CONST.ALAN.RUBBER, isPaper: false},
        {x: 239, y: 413, angle: 0, scale: 1, image: CONST.ALAN.NAPIS, isPaper: false},
        {x: 39, y: 206, angle: 315, scale: 1, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 205, y: 177, angle: 0, scale: 1, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 146, y: 173, angle: 64, scale: 1.18, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 100, y: 195, angle: 291, scale: 1.23, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 194, y: 220, angle: 310, scale: 1.383, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 151, y: 237, angle: 295, scale: 0.80, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 94, y: 322, angle: 295, scale: 0.71, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 45, y: 257, angle: 180, scale: 1.22, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 124, y: 283, angle: 84, scale: 1.34, image:CONST.ALAN.LEAF, isPaper: false},
        {x: 36, y: 329, angle: 117, scale: 1, image: CONST.ALAN.LEAF, isPaper: false},
        {x: 630, y: 430, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_7, isPaper: true},
        {x: 630, y: 425, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_6, isPaper: true},
        {x: 630, y: 420, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_5, isPaper: true},
        {x: 630, y: 415, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_4, isPaper: true},
        {x: 630, y: 410, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_2, isPaper: true},
        {x: 630, y: 405, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_3, isPaper: true},
        {x: 630, y: 400, angle: 0, scale: 0.7, image: CONST.ALAN.PAPER_1, isPaper: true},
    ];

    //logic vars
    private alan;
    private objects = [];
    private papers = [];
    private wallCategory;
    private flyingObjectCount = 0;
    private currentPaper = 0;

    constructor(){
        super ({
            sceneName: CONST.SCENES.ALAN,
            duration: 20000,
            showCountdown: true,
            startScreenColor: 0xFFE936,
            startText: "REVENGE!",
            startTextColor: 0x323232,
            endScreen: CONST.ALAN.END,
            nextScene: CONST.SCENES.JUMPSCARE,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 386, scale: 1.30},
                normalWithSkip: {x: 283, y: 386, scale: 1.30},
                skip: {x: 570, y: 386, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.alan = null;
        this.objects = [];
        this.papers = [];
        this.flyingObjectCount = 0;
        this.currentPaper = 0;
    }

    _preload(){
    }

    _create(){
        this.initPhysics();
        this.createStaticImages();
        this.createAlan();
        this.createDraggableObjects();
        this.updatePapers();
    }

    private initPhysics(){
        this.matter.world.setBounds(0, 0, this.game.renderer.width, this.game.renderer.height);

        this.wallCategory =  2;//this.matter.world.nextCategory();
        this.matter.add.rectangle(-30, 240, 60, 480, {label: 'walll', isStatic: true, collisionFilter: {category: this.wallCategory}});
        this.matter.add.rectangle(883, 240, 60, 480, {label: 'walll', isStatic: true, collisionFilter: {category: this.wallCategory}});
        this.matter.add.rectangle(426.5, -30, 853, 60, {label: 'walll', isStatic: true, collisionFilter: {category: this.wallCategory}});
        this.matter.add.rectangle(426.5, 510, 853, 60, {label: 'walll', isStatic: true, collisionFilter: {category: this.wallCategory}});
    }

    private createStaticImages(){
        this.addBackgroundImage(CONST.ALAN.BACKGROUND);
        this.add.image(392, 227, CONST.ALAN.CLOUDS).setDepth(1);
        this.add.image(425, 413, CONST.ALAN.TABLE).setDepth(10);
        this.add.image(429, 237, CONST.ALAN.WINDOWS).setDepth(2);
        this.add.image(94, 330, CONST.ALAN.PLANT).setDepth(11);
        this.add.image(427, 54, CONST.PROTECT.DRAG_TEXT).setDepth(1).setScale(0.73).setTint(0x48467C).setAlpha(0.88);
    }

    private createAlan(){
        var alan = this.add.image(426, 260, CONST.ALAN.ALAN)
                        .setDepth(5);
        alan.sadMouth = this.add.image(424, 265, CONST.ALAN.ALAN_SADMOUTH).setVisible(false).setDepth(6);
        alan.sadderMouth = this.add.image(427, 252, CONST.ALAN.ALAN_SADDERMOUTH).setVisible(false).setDepth(6);

        alan.onUpdate = () => {
            alan.sadMouth.setPosition(alan.x - 2, alan.y + 5);
            alan.sadderMouth.setPosition(alan.x + 1, alan.y -8);
        }

        alan.scare1 = () => {
            alan.currentTween = this.tweens.add({
                targets: alan,
                y: '+=22.4',
                ease: 'Linear',
                duration: 500,
                repeat: 0,
                yoyo: false,
            }); 
            alan.sadMouth.setVisible(true);
			alan.sadderMouth.setVisible(false);
        };

        alan.scare2 = () => {
            alan.currentTween.stop();
            alan.currentTween = this.tweens.add({
                targets: alan,
                y: '+=62.4',
                ease: 'Linear',
                duration: 500,
                repeat: 0,
                yoyo: false,
            }); 

            alan.sadMouth.setVisible(false);
			alan.sadderMouth.setVisible(true);
        };

        alan.scare3 = () => {
            alan.currentTween.stop();
            alan.currentTween = this.tweens.add({
                targets: alan,
                y: '+=124',
                ease: 'Linear',
                duration: 500,
                repeat: 0,
                yoyo: false,
            }); 
        };

        alan.startShaking = () => {
            this.tweens.add({
                targets: alan,
                x: '+=3',
                ease: 'Linear',
                duration: 100,
                repeat: -1,
                yoyo: true,
            }); 
        }

        this.alan = alan;
    }

    private createDraggableObjects(){      
        this.dragCategory = 4;
        this.objectConfig.forEach((config) => {
            var canDrag = this.matter.world.nextGroup(false);

            var obj = this.matter.add.image(config.x, config.y, 
                                           config.image, 
                                           null, 
                                           { chamfer: {radius: 0 }, 
                                           ignoreGravity: true,
                                           frictionAir: 0,
                                           friction: 0})
                                       .setDepth(12)
                                       .setScale(config.scale)
                                       .setAngle(-config.angle)
                                       .setBounce(1.0)
                                       .setCollisionGroup(canDrag)
                                       .setCollidesWith([this.wallCategory, this.dragCategory]);
   
            obj.isFlying = false;
            obj.isPaper = config.isPaper;

            obj.setMovable = (movable: boolean) => {
                obj.setCollidesWith(movable ? [this.wallCategory, this.dragCategory]: [this.wallCategory]);
            }

            obj.onUpdate = () => {
                if (!obj.isFlying && (Math.abs(obj.body.velocity.x) > 0 || Math.abs(obj.body.velocity.y) > 0)){
                    obj.isFlying = true;
                    obj.setDepth(13);
                    this.handleObjectStartedFlying();
                    if (obj.isPaper){
                        this.currentPaper++;
                        this.updatePapers();
                    }
                    this.sound.play(CONST.AUDIO.GRAB, {detune: this.getDetune(), volume: 0.7});
                }
            };
        
            if (config.isPaper){
                this.papers.unshift(obj); //Add to the beggining of array -> so we can activate them in correct order
            }

           this.objects.push(obj);
       });

       this.matter.add.mouseSpring({ length: 0,
        stiffness: 0.003,
        angularStiffness: 0,
        collisionFilter: {category: this.dragCategory, mask: 0xFFFFFFFF } }); //We need this mask to make the mousespring interact with items...

    }

    private handleObjectStartedFlying(){
        this.flyingObjectCount++;
        if (this.flyingObjectCount == 4){
            this.alan.startShaking();
            this.alan.scare1();
        } else if (this.flyingObjectCount == 8){
            this.alan.scare2();
        } else if (this.flyingObjectCount >= 12){
            this.alan.scare3();
            this.triggerWin();
        }
    }

    private updatePapers(){
        for (var i = 0; i < this.papers.length; i++){
            if (i == this.currentPaper){
                this.papers[i].setMovable(true);
            } else if (i > this.currentPaper){
                this.papers[i].setMovable(false);
            }
        }
    }

    _update(time: number, delta: number){
        this.objects.forEach(obj => obj.onUpdate());
        this.alan.onUpdate();
    }

    _timeout(){
        this.triggerLose();
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.loseGame(1000);
    }

    private triggerWin(){
        this.winGame(1000);
    }
}
