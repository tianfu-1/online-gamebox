import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class JumpscareScene extends MinigameScene {
    //Images
    private button !: Phaser.GameObjects.Image;
    private buttonPressed !: Phaser.GameObjects.Image;
    private clickText !: Phaser.GameObjects.Image;
    private fastText !: Phaser.GameObjects.Image;

    //values
    private barClickMovement = 21.33;
    private actualLevelTime = 8000;

    //logic vars
    private bar;
    private jack;
    private gameStarted = false;
    private barYSpeed = 133.33;

    constructor(){
        super ({
            sceneName: CONST.SCENES.JUMPSCARE,
            duration: 16000,
            showCountdown: true,
            startScreenColor: 0xFF4DE7,
            startText: "PLAY!",
            startTextColor: 0x323232,
            nextScene: CONST.SCENES.COMEDIAN,
            endButtons: {
                normalNoSkip: {x: 426.5, y: 421, scale: 1.0},
                normalWithSkip: {x: 314.5, y: 421, scale: 1.0},
                skip: {x: 538.5, y: 421, scale: 1.0}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.bar = null;
        this.jack = null;
        this.gameStarted = false;
        this.barYSpeed = 133.33;
    }

    _preload(){
    }

    _create(){
        this.calculateBarYSpeed();

        this.createBackground();
        this.createJack();
        this.createText();
        this.createButton();
        this.createBar();            
    }

    private calculateBarYSpeed(){
        var attempts = this.registry.get(CONST.REGISTRY.JUMPSCARE_ATTEMPTS);
        if (!attempts){
            attempts = 1;
        }
        this.registry.set(CONST.REGISTRY.JUMPSCARE_ATTEMPTS, attempts + 1);

        //Slow down bar based on attempts
        this.barYSpeed -= 35.3 * Math.log(attempts);
    }

    private createBackground(){
        this.addBackgroundImage(CONST.JUMPSCARE.BACKGROUND);
        this.add.image(184, 111, CONST.JUMPSCARE.WALLPAPER).setDepth(1);
        this.add.image(581, 306, CONST.JUMPSCARE.TABLE).setDepth(2);
        this.add.image(347, 248, CONST.JUMPSCARE.CHAIR).setDepth(3);
    }

    private createJack(){
       var jack =  {
           body: this.add.image(367, 207, CONST.JUMPSCARE.JACK).setDepth(4),
           hands: {first: [this.add.image(386, 213, CONST.JUMPSCARE.ARM_1).setDepth(5),
                            this.add.image(383, 188, CONST.JUMPSCARE.ARM_2).setDepth(3)],

                  second: [this.add.image(386, 195, CONST.JUMPSCARE.ARM_1).setDepth(5).setAngle(-27),
                            this.add.image(383, 210, CONST.JUMPSCARE.ARM_2).setDepth(3).setAngle(22)]},

           firstHandsVisible: true,

           normalFace: this.add.image(356, 141, CONST.JUMPSCARE.NORMAL_EYES).setDepth(6),
           scaredFace: this.add.image(356, 143.5, CONST.JUMPSCARE.SCARED_EYES).setDepth(6).setVisible(false),

           playTV: this.add.image(468, 0, CONST.JUMPSCARE.TV_PLAY).setOrigin(0).setDepth(6),
           scareTV: this.add.image(468, 0, CONST.JUMPSCARE.TV_SCARE).setOrigin(0).setDepth(6).setVisible(false),

           onButtonPress: () => {
            jack.firstHandsVisible = !jack.firstHandsVisible;

            jack.hands.first.forEach((hand) => { hand.setVisible(jack.firstHandsVisible)});
            jack.hands.second.forEach((hand) => { hand.setVisible(!jack.firstHandsVisible)});
           },

            animateScared: () => {
                jack.normalFace.setVisible(false);
                jack.scaredFace.setVisible(true);

                jack.playTV.setVisible(false);
                jack.scareTV.setVisible(true);

                jack.hands.first.forEach((hand) => { hand.setVisible(false)});
                jack.hands.second.forEach((hand) => { hand.setVisible(false)});

                this.addAnimation(CONST.JUMPSCARE.ARM_1, CONST.ANIMATIONS.SCARYARM_FRONT).setImageOrigin(0.02733, 0.1334).setDepth(5).setLoop(true).start();
                this.addAnimation(CONST.JUMPSCARE.ARM_2, CONST.ANIMATIONS.SCARYARM_BACK).setImageOrigin(0.0205, 0.8977).setDepth(3).setLoop(true).start();
            }

        };

        jack.onButtonPress();
        this.jack = jack;
    }

    private createText(){
        this.clickText = this.add.image(155, 452, CONST.JUMPSCARE.CLICK_TEXT).setDepth(2);
        this.fastText = this.add.image(157, 457, CONST.JUMPSCARE.FAST_TEXT).setDepth(2).setVisible(false);;
    }

    private createButton(){
        this.button = this.add.image(157, 336, CONST.JUMPSCARE.BUTTON)
                                .setInteractive(this.input.makePixelPerfect())
                                .setDepth(5)
                                .setAlpha(1);
        this.buttonPressed = this.add.image(157, 344, CONST.JUMPSCARE.BUTTON_PRESSED)
                                .setDepth(5)
                                .setAlpha(0);

        this.button.on('pointerdown', function (pointer, gameObject) {
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            this.customStartGame();
            this.button.setAlpha(0);
            this.buttonPressed.setAlpha(1);
            this.jack.onButtonPress();
            this.bar.onButtonPress();
            this.sound.play(CONST.AUDIO.CLICK, {detune: this.getDetune()});

        }, this);

        this.input.on('pointerup', function(pointer, gameObject, dropped){
            if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;
            this.button.setAlpha(1);
            this.buttonPressed.setAlpha(0);
            this.sound.play(CONST.AUDIO.CLICK, {detune: this.getDetune()});

        }, this);
    }

    private createBar(){
        var bar = {
                    background: this.add.image(40, 327, CONST.JUMPSCARE.BAR).setDepth(6),
                    clicker: this.add.image(41, 439, CONST.JUMPSCARE.BAR_LINE).setDepth(8),
                    limits: {bottom: 438, top: 212},

                    onUpdate: (delta: number) => {
                        if (this.isCurrentState(CONST.GAMESTATE.WIN)) return;

                        bar.clicker.y += this.barYSpeed * delta / 1000;
                        if (bar.clicker.y > bar.limits.bottom){
                            bar.clicker.y = bar.limits.bottom;
                        }
                    },

                    onButtonPress: () => {
                        bar.clicker.y -= this.barClickMovement;
                        if (bar.clicker.y < bar.limits.top){
                            bar.clicker.y = bar.limits.top;
                            this.triggerWin();
                        }
                    }
                  }; 

        this.bar = bar;
    }

    _update(time: number, delta: number){
        this.bar.onUpdate(delta);
    }

    onGameStarted = () => {
        this.gameplayTimer.timeScale = 0;
    }

    private customStartGame() {
        if (this.gameStarted) return;
        this.gameStarted = true;
        this.gameplayTimer.timeScale = 1;

        //Trigger timeout sooner
        this.time.delayedCall(this.actualLevelTime, () => {
            this._timeout();
        }, null, this);

        //Trigger switch text
        this.time.delayedCall(this.actualLevelTime - 5000, () => {
            this.switchText();
        }, null, this);
    }

    private switchText(){
        this.clickText.setVisible(false);
        this.fastText.setVisible(true);
    }

    _timeout(){
        this.triggerLose();
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return; 
        this.sound.play(CONST.AUDIO.SCARE2, {volume: 0.5});
        var scareImage = this.add.image(0, 0, CONST.JUMPSCARE.SCARE_SCREEN).setOrigin(0).setDepth(200);
        this.cameras.main.shake(1000, 0.03);
        this.loseGame(1000);
    }

    private triggerWin(){
        this.sound.play(CONST.AUDIO.SCARE1, {volume: 0.35});
        this.winGame(2000);
        this.jack.animateScared();
    }
}