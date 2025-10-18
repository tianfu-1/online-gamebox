import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class CreditsScene extends MinigameScene {
    //Images

    //values

    //logic vars
    private background;
    private isHell = false;

    constructor(){
        super ({
            sceneName: CONST.SCENES.CREDITS,
            duration: 5000,
            showCountdown: true,
            startScreenColor: 0x55BAEC,
            startText: "WELCOME\nTO HEAVEN!",
            startTextYOrigin: 0.35,
            timeToStart: 1500,
            startTextColor: 0xFFFFFF,
            nextScene: CONST.SCENES.MENU,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 386, scale: 1.30},
                normalWithSkip: {x: 283, y: 386, scale: 1.30},
                skip: {x: 570, y: 386, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.isHell = this.registry.get(CONST.REGISTRY.HELL_COMPLETED);
        if (this.isHell){
            this.startText = "WELCOME\nTO HELL!";
            this.startScreenColor = 0xFF0000;
            this.startTextColor = 0x000000;
        }

        this.registry.set(CONST.REGISTRY.GAME_COMPLETED, true);
    }

    _preload(){
    }

    _create(){
        this.add.image(0, 0, this.isHell ? CONST.CREDITS.HELL : CONST.CREDITS.HEAVEN).setOrigin(0,0).setDepth(10);

        if (!this.isHell){
            this.add.image(85, 252, CONST.CREDITS.HEAVEN).setDepth(2);
        }
    }

    _update(time: number, delta: number){
    }

    _timeout(){
        this.winGame();
    }

    _afterLoss(){
    }

    _afterWin(){
    }
}
