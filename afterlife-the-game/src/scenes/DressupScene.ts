import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class DressupScene extends MinigameScene {
    //Images

    //values
    private clothesConfigs = [
        {imageName: CONST.DRESSUP.BOY_1, startPos: {x: 482, y: 56}, dressedPos: {x: 295, y: 177}, type: 0, costumeSet: 0, scale: 1.02, depth: 21},
        {imageName: CONST.DRESSUP.BOY_2, startPos: {x: 519, y: 165}, dressedPos: {x: 295, y: 258}, type: 1, costumeSet: 0, scale: 1.02, depth: 21},
        {imageName: CONST.DRESSUP.BOY_3, startPos: {x: 726, y: 174}, dressedPos: {x: 282, y: 312}, type: 2, costumeSet: 0, scale: 1.02, depth: 21},

        {imageName: CONST.DRESSUP.DPOOL_1, startPos: {x: 586, y: 66}, dressedPos: {x: 297.5, y: 184.5}, type: 0, costumeSet: 2, scale: 1.02, depth: 22},
        {imageName: CONST.DRESSUP.DPOOL_2, startPos: {x: 516, y: 218}, dressedPos: {x: 296, y: 257.5}, type: 1, costumeSet: 2, scale: 1.02, depth: 22},
        {imageName: CONST.DRESSUP.DPOOL_3, startPos: {x: 725, y: 216}, dressedPos: {x: 283, y: 313}, type: 2, costumeSet: 2, scale: 1.02, depth: 22},

        {imageName: CONST.DRESSUP.DINO_1, startPos: {x: 671, y: 54}, dressedPos: {x: 282.5, y: 169.5}, type: 0, costumeSet: 1, scale: 1.02, depth: 23},
        {imageName: CONST.DRESSUP.DINO_2, startPos: {x: 506, y: 267}, dressedPos: {x: 281, y: 259}, type: 1, costumeSet: 1, scale: 1.02, depth: 23},
        {imageName: CONST.DRESSUP.DINO_3, startPos: {x: 720, y: 265}, dressedPos: {x: 279, y: 313}, type: 2, costumeSet: 1, scale: 1.02, depth: 23},
      
        {imageName: CONST.DRESSUP.WITCH_1, startPos: {x: 755, y: 62}, dressedPos: {x: 294, y: 119}, type: 0, costumeSet: 3, scale: 1.02, depth: 24},
        {imageName: CONST.DRESSUP.WITCH_2, startPos: {x: 519, y: 317}, dressedPos: {x: 295, y: 258}, type: 1, costumeSet: 3, scale: 1.02, depth: 24},
        {imageName: CONST.DRESSUP.WITCH_3, startPos: {x: 722, y: 313}, dressedPos: {x: 282, y: 311}, type: 2, costumeSet: 3, scale: 1.02, depth: 24},

    ];

    private dressedPositions = [
        {type: 0, x: 300, y: 187},
        {type: 1, x: 299, y: 262},
        {type: 2, x: 295, y: 320},
    ];
    private maxDropDistance = 80;

    //logic vars
    private clothes = [];
    private dressedClothes !: void[];

    constructor(){
        super ({
            sceneName: CONST.SCENES.DRESSUP,
            duration: 20000,
            showCountdown: false,
            startScreenColor: 0x4B97FF,
            startText: "DRESS\nUP!",
            startTextColor: 0x323232,
            startTextYOrigin: 0.35,
            endScreen: CONST.DRESSUP.END,
            nextScene: CONST.SCENES.COLLECT,
            endButtons: {
                skipEnabled: false,
                rotation: -10,

                normalNoSkip: {x: 565, y: 327, scale: 1.30},
                normalWithSkip: {x: 283, y: 386, scale: 1.30},
                skip: {x: 570, y: 386, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.clothes = [];
        this.dressedClothes = Array.apply(null, Array(3)).map(function () {});
    }

    _preload(){
    }

    _create(){
        this.addBackgroundImage(CONST.DRESSUP.BACKGROUND);
        this.add.image(283, 234, CONST.DRESSUP.GHOST).setDepth(1);
        this.createFinishButton();
        this.createClothes();
    }

    private createFinishButton(){
        let finishButton = this.add.image(625, 431, CONST.DRESSUP.FABULOUS_BUTTON)
                                .setDepth(50)
                                .setInteractive({ useHandCursor: true });

        finishButton.on("pointerup", ()=>{
            this.checkForWin();
        });
    }

    private checkForWin(){
        var selectedSet = -1;
        var win = true;
        for (var i = 0; i < this.dressedClothes.length; i++){
            if (this.dressedClothes[i] == null) {
                win = false;
                break;
            } 
            if (selectedSet === -1){
                selectedSet = this.dressedClothes[i].config.costumeSet;
            }
            
            if (this.dressedClothes[i].config.costumeSet !== selectedSet){
                win = false;
                break;
            }
        }
        
        if (win){
            this.triggerWin(selectedSet);
        } else {
            this.triggerLose();
        }
    }

    private createClothes(){
        this.clothesConfigs.forEach((clothesConfig) => {
            //Spawn clothes at startPos
            let cloth = this.add.image(clothesConfig.startPos.x, clothesConfig.startPos.y, clothesConfig.imageName)
                                .setInteractive({ useHandCursor: true})
                                .setScale(clothesConfig.scale, clothesConfig.scale)
                                .setDepth(clothesConfig.depth);

            cloth.config = clothesConfig;
            cloth.isDressed = false;

            cloth.setDressed = (dressed: boolean) => {
                cloth.isDressed = dressed;
                if (cloth.isDressed){
                    //Move to dressed position
                    this.smoothMoveObject(cloth, cloth.config.dressedPos.x, cloth.config.dressedPos.y, 200);
                    //cloth.x = cloth.config.dressedPos.x;
                    //cloth.y = cloth.config.dressedPos.y;
                    cloth.setDepth(9+cloth.config.type);
                } else {
                    //Move to start position
                    this.smoothMoveObject(cloth, cloth.config.startPos.x, cloth.config.startPos.y, 400);

                    //cloth.x = cloth.config.startPos.x;
                    //cloth.y = cloth.config.startPos.y;
                    cloth.setDepth(cloth.config.depth);
                }
            }

            cloth.dress = () => {
                cloth.setDressed(true);
                
                if (this.dressedClothes[cloth.config.type]){
                    this.dressedClothes[cloth.config.type].setDressed(false);
                }

                this.dressedClothes[cloth.config.type] = cloth;
            }

            this.input.setDraggable(cloth);
        });

        this.input.on('dragstart', function (pointer, gameObject) {
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            if (gameObject.isDressed) return; 
            this.sound.play(CONST.AUDIO.GRAB, {detune: this.getDetune()});
        }, this);

        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            if (gameObject.isDressed) return; 

            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', function(pointer, gameObject, dropped){
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            if (gameObject.isDressed) return; 

            if (this.canDress(gameObject)){
                gameObject.dress();
                this.sound.play(CONST.AUDIO.BOUNCE, {detune: this.getDetune()});
            } else {
                gameObject.setDressed(false);
                this.sound.play(CONST.AUDIO.GRAB, {detune: this.getDetune()});

            }
        }, this);

    }

    private canDress(gameObject: Phaser.GameObjects.Image){
        for (let pos of this.dressedPositions){
            if (pos.type == gameObject.config.type){
                return Phaser.Math.Distance.Between(pos.x, pos.y, gameObject.x, gameObject.y) <= this.maxDropDistance; 
            }
        }
        return false;
    }

    _update(time: number, delta: number){
    }

    _timeout(){
        //Ignore timeout!
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.loseGame();
    }

    private triggerWin(selectedSet: number){
        this.storagePlugin.setItem(CONST.STORAGE_KEYS.DRESSUP_COSTUME, selectedSet);
        this.winGame();
    }
}
