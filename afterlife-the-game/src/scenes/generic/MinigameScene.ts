import SoundButton from "../../components/SoundButton";
import { BuildLevel, Config } from "../../Config";
import { CONST } from "../../CONST";
import { OMGLogger } from "../../util/OMGLogger";
import { ProgressiveLoadScene } from "../ProgressiveLoadScene";
import { UnityAnimation } from "./Animation";

export abstract class MinigameScene extends Phaser.Scene {
    //Scene info
    protected sceneName : string;
    private duration : number; //in ms
    private timeToStart : number; //in ms

    private nextScene : string;
    private showCountdown : boolean;

    //State management
    private currentState !: string;
    private startTimer !: Phaser.Time.TimerEvent;
    protected gameplayTimer !: Phaser.Time.TimerEvent;
    private winGameTimer !: Phaser.Time.TimerEvent;

    private waitingToLoad : boolean;
    public rewardedBreakRequested : boolean = false;

    //UI info
    private startScreenColor : number;
    private startText : string;
    private startTextYOrigin : number;
    private startTextColor: number;
    private startTextSize: number;
    private failImage : string;
    private buttonPositions : object;

    protected startTextObject !: Phaser.GameObjects.BitmapText;

    //UI objects
    private startUI !: Phaser.GameObjects.Group;
    private gameplayUI !: Phaser.GameObjects.Group;
    private loseUI !: Phaser.GameObjects.Group;
    private loadUI !: Phaser.GameObjects.Group;
    private progressBar !: Phaser.GameObjects.Graphics;
    private progressBarBackground !: Phaser.GameObjects.Graphics;

    //Animations
    private animations !: UnityAnimation[];

    //Physics
    private targetFPS !: number;

    //global objects
    private progressiveLoadScene !: ProgressiveLoadScene;

    constructor(options: object){
        super({
            key: options.sceneName,
        });

        this.sceneName = options.sceneName;
        this.nextScene = options.nextScene;
        this.duration = options.duration;
        this.showCountdown = (typeof options.showCountdown === 'undefined') ? true : options.showCountdown;
        this.startScreenColor = options.startScreenColor;
        this.startText = options.startText;
        this.startTextYOrigin = (typeof options.startTextYOrigin === 'undefined') ? 0.25 : options.startTextYOrigin;
        this.startTextColor = options.startTextColor;
        this.startTextSize = (typeof options.startTextSize === 'undefined') ? 150 : options.startTextSize;
        this.failImage = !!options.endScreen ? options.endScreen : "";
        this.timeToStart = (typeof options.timeToStart === 'undefined') ? 1000 : options.timeToStart; //options.timeToStart;
        this.buttonPositions = options.endButtons;

        this.targetFPS = !!options.targetFPS ? options.targetFPS : 60;
    
        this.waitingToLoad = false;

    }

    //Scene implementation lifecycle functions
    abstract _init() : void;
    abstract _preload() : void;
    abstract _create() : void;
    abstract _update(time: number, delta: number) : void;
    abstract _timeout() : void; //triggered when minigame time has ended
    abstract _afterWin() : void; //triggered after win delay is over
    abstract _afterLoss() : void; //triggered after loss delay is over

    init(){
        this.animations = [];
        this.progressiveLoadScene = this.registry.get(CONST.SCENES.PROGRESSIVE_LOAD);
        this.rewardedBreakRequested = false;

        this._init();
    }

    preload(){
        this._preload();
    }

    create(){
        this.saveProgress();
        
        this.createStartUI();
        this.createGameplayUI();
        this.createLoseUI();
        this.createLoadUI(); 

        var loaded = this.areAllAssetsLoaded();
        if (loaded){
            this._create();
        } else {
            this.waitingToLoad = true;
        }

        if (Config.BuildLevel < BuildLevel.Prod){
            this.skipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        }

        this.changeGameState(CONST.GAMESTATE.START);


        this.audioPlugin.beforeCommercialBreak();
        PokiSDK.commercialBreak()
        .then(
            () => {
                OMGLogger.Debug('End of commercial break');
                this.audioPlugin.afterCommercialBreak();

                if (loaded){
                    this.createStartTimer();
                } else {
                    this.createWaitingUI();
                    this.waitingToLoad = true;
                }

                this.onCommercialEnded();
            }
        );
    }

    private saveProgress(){        
        this.storagePlugin.setItem(CONST.STORAGE_KEYS.PROGRESS, this.sceneName);
    }

    //For first minigame only
    private createWaitingUI(){        
        var spinner = this.add.image(this.game.renderer.width / 2, this.game.renderer.height - 50, CONST.BUTTONS.SPINNER)
            .setDepth(1002)
            .setTint(this.startTextColor)
            .setVisible(true);
        
        this.tweens.add({
            targets: spinner,
            angle: '+=360',
            duration: 1000,
            ease: 'Linear',
            repeat: -1
        })
    }

    private createStartUI(){
        var startBackground = this.add
                .graphics({fillStyle: {color: this.startScreenColor}})
                .fillRect(0, 0, this.game.renderer.width, this.game.renderer.height)
                .setDepth(1000)
                .setVisible(false);

       /* var startText = this.add
                .text(this.game.renderer.width / 2,
                        this.game.renderer.height/2,
                        this.startText,
                        { fontSize: "120px", color: this.startTextColor})
                .setOrigin(0.5)
                .setDepth(1001)
                .setVisible(false);
        */
       this.startTextObject = this.add.bitmapText(this.game.renderer.width / 2,
                                        this.game.renderer.height/2,
                                        CONST.FONT.ATLAS, this.startText, this.startTextSize)
                                        
                                .setOrigin(0.5, this.startTextYOrigin)
                                .setDepth(1001)
                                .setVisible(false)
                                .setTint(this.startTextColor)
                                .setCenterAlign();

        this.startUI = this.add.group([startBackground, this.startTextObject], {active: false});

        this.startUI.getChildren().forEach(child => {
            child.setScrollFactor(0);
        });
    }

    private createGameplayUI(){
        //Generate progressBar
        this.progressBar = this.add
            .graphics({
                fillStyle: {
                    color: 0x151515,
                    alpha: this.showCountdown ? 0.7 : 0
                }
            })
            .fillRect(
                0,
                0,
                this.game.renderer.width,
                14
            )
            .setDepth(100)
            .setVisible(false);

        this.progressBarBackground = this.add
            .graphics({
                fillStyle: {
                    color: 0x292929,
                    alpha: this.showCountdown ? 0.30 : 0
                }
            })
            .fillRect(
                0,
                0,
                this.game.renderer.width,
                14
            )
            .setDepth(99)
            .setVisible(false);

        this.gameplayUI = this.add.group([this.progressBar, this.progressBarBackground], {active: false});
        
        this.gameplayUI.getChildren().forEach(child => {
            child.setScrollFactor(0);
        });
    }

    private createLoseUI(){
        var elements = [];
        if (this.failImage != ""){
        let loseImage = this.add
                .image(0,0, this.failImage)
                .setOrigin(0, 0)
                .setDepth(1002)
                .setVisible(false);

        elements.push(loseImage);
        }

        let skipEnabled = (typeof this.buttonPositions.skipEnabled === 'undefined') ? true : this.buttonPositions.skipEnabled;
        let angle = (typeof this.buttonPositions.rotation === 'undefined') ? 0 : this.buttonPositions.rotation;
        if (!skipEnabled 
            || this.registry.get(CONST.REGISTRY.ADBLOCKENABLED)
            || this.registry.get(CONST.REGISTRY.SKIPUSED)){
            let normalNoSkipButton = this.addButton(this.buttonPositions.normalNoSkip.x,
                                        this.buttonPositions.normalNoSkip.y,
                                        CONST.BUTTONS.TRYAGAIN, 
                                        this.buttonPositions.normalNoSkip.scale, 
                                        () => { this.restartGame() });
            normalNoSkipButton.setAngle(angle);

            elements.push(normalNoSkipButton);
        } else {
            let normalWithSkipButton = this.addButton(this.buttonPositions.normalWithSkip.x,
                                        this.buttonPositions.normalWithSkip.y,
                                        CONST.BUTTONS.TRYAGAIN, 
                                        this.buttonPositions.normalWithSkip.scale, 
                                        () => { this.restartGame() });
            normalWithSkipButton.setAngle(angle);

            elements.push(normalWithSkipButton);

            let skipButton = this.addButton(this.buttonPositions.skip.x,
                                        this.buttonPositions.skip.y,
                                        CONST.BUTTONS.SKIP, 
                                        this.buttonPositions.skip.scale, 
                                        () => { this.skipLevel() });
            skipButton.setAngle(angle);

            elements.push(skipButton);
        }

        let soundButton = new SoundButton(this, this.game.renderer.width - 10, this.game.renderer.height - 10, this.audioPlugin).setOrigin(1, 1).setDepth(1003).setVisible(false);
        elements.push(soundButton);
    
        this.loseUI = this.add.group(elements, {active: false});
        this.loseUI.getChildren().forEach(child => {
            child.setScrollFactor(0);
        });
    }

    private createLoadUI(){
        var ns = this.scene.get(this.nextScene);
        var loadBackground = this.add
                .graphics({fillStyle: {color: ns.startScreenColor}})
                .fillRect(0, 0, this.game.renderer.width, this.game.renderer.height)
                .setDepth(1000)
                .setVisible(false);

       var loadText = this.add.bitmapText(this.game.renderer.width / 2,
                                        this.game.renderer.height/2,
                                        CONST.FONT.ATLAS, ns.startText, 150)
                                        
                                .setOrigin(0.5, ns.startTextYOrigin)
                                .setDepth(1001)
                                .setVisible(false)
                                .setTint(ns.startTextColor)
                                .setCenterAlign();

        var spinner = this.add.image(this.game.renderer.width / 2, this.game.renderer.height - 50, CONST.BUTTONS.SPINNER)
            .setDepth(1002)
            .setTint(ns.startTextColor)
            .setVisible(false);
        
        this.tweens.add({
            targets: spinner,
            angle: '+=360',
            duration: 1000,
            ease: 'Linear',
            repeat: -1
        });

        this.loadUI = this.add.group([loadBackground, loadText, spinner], {active: false});
        this.loadUI.getChildren().forEach(child => {
            child.setScrollFactor(0);
        });
    }

    private addButton(x : number, y: number, key: string, scale: number, onClick: Function){
        let button = this.add.image(x, y, key)
                                .setScale(scale, scale)
                                .setVisible(false)
                                .setDepth(1003)
                                .setInteractive({ useHandCursor: true });

        button.on('pointerup', onClick, this);

        return button;
    }

    private changeGameState(newState: string){
        var isNewStateValid : boolean = true;
        if (newState === this.currentState){
            isNewStateValid = false;
            OMGLogger.Debug("Cant switch to same state! Current state: " + this.currentState);
        }

        //Handle state enter and check if new state is valid
        switch(newState){
            case CONST.GAMESTATE.START: {
                this.setChildrenVisible(this.startUI, true);
                break;
            }
            case CONST.GAMESTATE.PLAYING: {
                PokiSDK.gameplayStart();
                this.setChildrenVisible(this.gameplayUI, true);
                break;
            }
            case CONST.GAMESTATE.LOSE: {
                //Handled by each scene separately
                 break;
            }
            case CONST.GAMESTATE.WIN: {
                //Handled by each scene separately
                break;
            }
            case CONST.GAMESTATE.LOADNEXTLEVEL: {
                this.setChildrenVisible(this.loadUI, true);
                break;
            }
            default: {
                OMGLogger.Debug("Can't switch to invalid state: " + newState)
                isNewStateValid = false;
                break;
            }
        }

        if (!isNewStateValid){
            return;
        }

        //Handle state exit
        switch(this.currentState){
            case CONST.GAMESTATE.START: {
                this.setChildrenVisible(this.startUI, false);
                break;
            }
            case CONST.GAMESTATE.PLAYING: {
                PokiSDK.gameplayStop();
                this.setChildrenVisible(this.gameplayUI, false); 
                break;
            }
            case CONST.GAMESTATE.LOSE: {
                this.setChildrenVisible(this.loseUI, false);

                break;
            }
            case CONST.GAMESTATE.WIN: {
                //Handled by each scene separately
                break;
            }
        }

        this.currentState = newState;
        OMGLogger.Debug("Minigame state changed to: " + this.currentState);
    }

    private showLoseUI(show: boolean){
        this.setChildrenVisible(this.loseUI, show);
    }

    private setChildrenVisible(group: Phaser.GameObjects.Group, visible: boolean){
        //@ts-ignore
        group.getChildren().forEach((child)=>{child.setVisible(visible)});
    }

    update(time: number, delta: number){
         if (Config.BuildLevel < BuildLevel.Prod){
            if (Phaser.Input.Keyboard.JustDown(this.skipKey)) {
                OMGLogger.Debug("Skip level pressed");
                this.clearTimers();
                this.winGame();
            }
        }
      
        //For first minigame only
        if (this.waitingToLoad){
            OMGLogger.Debug("Waiting to load...");
            if (this.areAllAssetsLoaded()){
                this.waitingToLoad = false;
                this.restartGame();
            }
            return;
        }

        if (this.isCurrentState(CONST.GAMESTATE.PLAYING)){
            this.updateGameplayTimer();
        }

        if (this.isCurrentState(CONST.GAMESTATE.LOADNEXTLEVEL)){
            if (this.areAllAssetsLoaded(this.nextScene)){
                this.loadNextScene();
            }
        }

        this._update(time, delta);
        
        this.updateAnimations(delta);
    }

    private updateGameplayTimer(){
        if (!this.gameplayTimer) return;

        //update progress bar
       this.progressBar.setX(-this.game.renderer.width * (this.gameplayTimer.getProgress())).setVisible(true);
    }

    private updateAnimations(delta: number){
        this.animations.forEach(anim => {
            anim.update(delta)
        })
    }

    private createStartTimer(){
        this.startTimer = this.time.addEvent({
            delay: this.timeToStart,
            callback: this.startGame,
            callbackScope: this
        })
    }

    private startGame(){
        this.changeGameState(CONST.GAMESTATE.PLAYING);
        this.clearTimers();
        this.gameplayTimer = this.time.addEvent({
            delay: this.duration,
            callback: this.triggerTimeout,
            callbackScope: this
        });

        this.onGameStarted();

        this.analyticsPlugin.addGameStartEvent(this.sceneName);
    }

    protected onGameStarted(){};
    protected onCommercialEnded(){};

    private triggerTimeout(){
        this.clearTimers();
        this._timeout();
    }

    private clearTimers(){
        if (this.startTimer){
            this.startTimer.paused = true;
            this.startTimer.remove();
        }

        if(this.gameplayTimer) {
            this.gameplayTimer.paused = true;
            this.gameplayTimer.remove();
        }

        if(this.winGameTimer) {
            this.winGameTimer.paused = true;
            this.winGameTimer.remove();
        }
    }

    //winGame, load next level after delay
    protected winGame(animationDelay: number = 0){
        if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;

        this.changeGameState(CONST.GAMESTATE.WIN);
        
        this.clearTimers();
        this.winGameTimer = this.time.addEvent({
            delay: animationDelay,
            callback: this.handleWinGame,
            callbackScope: this
        });

        this.analyticsPlugin.addGameWinEvent(this.sceneName);

        this.playWinAudio();
    }

    //Win animation ended
    private handleWinGame(){
        PokiSDK.happyTime(0.5);
        this._afterWin();
        this.loadNextScene();
    }

    private loadNextScene(){
        if (this.areAllAssetsLoaded(this.nextScene)){
            this.scene.stop(this.sceneName);
            this.scene.start(this.nextScene);
        } else {
            this.changeGameState(CONST.GAMESTATE.LOADNEXTLEVEL);
        }
    }

    protected loseGame(animationDelay: number = 0){
        if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;

        this.changeGameState(CONST.GAMESTATE.LOSE);

        this.clearTimers();
        this.winGameTimer = this.time.addEvent({
            delay: animationDelay,
            callback: this.handleLoseGame,
            callbackScope: this
        });

        this.analyticsPlugin.addGameLoseEvent(this.sceneName);

        this.playLoseAudio();
    }

    //Lose animation ended
    private handleLoseGame(){
        this.showLoseUI(true);
        this._afterLoss();
    }

    protected restartGame(){
        if (this.rewardedBreakRequested) return;

        this.scene.stop(this.sceneName);
        this.scene.start(this.sceneName);
    }

    private skipLevel(){
        if (this.rewardedBreakRequested) return;
        this.rewardedBreakRequested = true;

        OMGLogger.Debug('skip level pressed');
        this.audioPlugin.beforeCommercialBreak();
        PokiSDK.rewardedBreak().then(
            (adCompleted) => {
                this.audioPlugin.afterCommercialBreak();
                this.analyticsPlugin.addRewardedAdFinishedEvent(adCompleted);

                //skip level if ad completed!
                if (adCompleted){
                    this.loadNextScene();
                    //this.registry.set(CONST.REGISTRY.SKIPUSED, true);
                } else {
                    this.rewardedBreakRequested = false;
                }
            }
        );
    }

    protected addBackgroundImage(imageKey: string) : Phaser.GameObjects.Image {
        return this.add.image(0, 0, imageKey).setDepth(0).setOrigin(0,0);
    }

    protected isCurrentState(state: string){
        return this.currentState === state;
    }

    protected changeGameplayTimerDuration(change: number){
        if (!this.gameplayTimer) return;
        this.gameplayTimer.elapsed -= change;
    }

    protected addAnimation(imageKey: string, jsonKey: string, fps: number = 60): UnityAnimation {
        let image = this.add.image(0, 0, imageKey).setScale(0, 0);
        let json = this.cache.json.get(jsonKey);
        var animation = new UnityAnimation(image, json, fps);

        this.animations.push(animation);

        return animation;
    }

    protected getUnityY(phaserY : number) : number{
        return 4.5 - (phaserY * 9/480);
    }

    protected getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    protected getDetune(){
        return this.getRandomInt(-200, 200);
    }

    protected areAllAssetsLoaded(scene: string = this.sceneName){
        return this.progressiveLoadScene.isSceneLoaded(scene);
    }

    protected smoothMoveObject(gameObject : Phaser.GameObjects.GameObject, targetX : number, targetY : number, durationMs : number) {
        this.tweens.add({
            targets: gameObject,
            x: targetX,
            y: targetY,
            ease: 'Cubic',
            duration: durationMs,
            repeat: 0,
            yoyo: false
        });
    }

    protected fadeSoundtrack(targetVolume: number, timeToChange: number){
        this.scene.get(CONST.SCENES.SOUNDTRACK).FadeSoundtrack(targetVolume, timeToChange);
    }

    protected playWinAudio(){
        this.sound.play(CONST.AUDIO.WIN, {detune: this.getDetune(), volume: 1.0});
    }

    protected playLoseAudio(){
        this.sound.play(CONST.AUDIO.LOSE, {detune: this.getDetune(), volume: 0.4});
    }
}