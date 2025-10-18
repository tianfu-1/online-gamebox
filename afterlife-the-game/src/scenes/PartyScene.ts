import { CONST } from "../CONST";
import { OMGLogger } from "../util/OMGLogger";
import { MinigameScene } from "./generic/MinigameScene";

export class PartyScene extends MinigameScene {
    //Images
    private music !: Phaser.Sound.BaseSound;

    //values
    private noteInfo = {
        pink: {color: "pink", spawnX: 712, spawnY: -141, targetX: 528, targetY: 391, moveSpeed: 240, deathY: 480, image: CONST.PARTY.DOT_PINK},
        blue: {color: "blue", spawnX: 797, spawnY: -141, targetX: 614, targetY: 391, moveSpeed: 240, deathY: 480, image: CONST.PARTY.DOT_BLUE},
        green: {color: "green", spawnX: 881, spawnY: -141, targetX: 698, targetY: 391, moveSpeed: 240, deathY: 480, image: CONST.PARTY.DOT_GREEN},
    }

    private buttonInfo = [
        {color: "pink", x: 510, y: 437, clickRadius: 44, clickYRange: 100, image: CONST.PARTY.END_PINK},
        {color: "blue", x: 598, y: 437, clickRadius: 44, clickYRange: 100, image: CONST.PARTY.END_BLUE},
        {color: "green", x: 686, y: 437, clickRadius: 44, clickYRange: 100, image: CONST.PARTY.END_GREEN},
        ];

    private ghostConfig = [
        {x: 118, y: 356, depth: 25, image: CONST.PARTY.GHOST_1_BODY},
        {x: 370, y: 382, depth: 25, image: CONST.PARTY.GHOST_2_BODY},
        {x: 256, y: 258, depth: 12, image: CONST.PARTY.GHOST_3_BODY},
        {x: 452, y: 183, depth: 25, image: CONST.PARTY.GHOST_4_BODY},
    ];

    private allowedMisses = 3;
    

    //logic vars
    private notesJson;
    private fftJson;
    private nextNoteSpawn;
    private currentNoteSpawn = 0;
    private currentFFTFrame = 0;
    private timer = 0;
    private timerOffset = 2.6;
    private allNotesSpawned = false;
    private skippedNotes = 0;

    private notes = [];
    private buttons = [];

    private endMusicTimer = 0;
    private isEndMusicFading = false;

    private scalableObjects = [];

    isMinigameReady = false;


    constructor(){
        super ({
            sceneName: CONST.SCENES.PARTY,
            duration: 21200,
            timeToStart: 1500,
            showCountdown: false,
            startScreenColor: 0xFF9900,
            startText: "PARTY!",
            startTextColor: 0x323232,
            endScreen: CONST.PARTY.END,
            nextScene: CONST.SCENES.DRESSUP,
            endButtons: {
                normalNoSkip: {x: 664, y: 300, scale: 1.20},
                normalWithSkip: {x: 664, y: 300, scale: 1.20},
                skip: {x: 398, y: 300, scale: 1.20}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.currentNoteSpawn = 0;
        this.currentFFTFrame = 0;
        this.endMusicTimer = 0;
        this.timer = this.timerOffset;
        this.nextNoteSpawn = null;
        this.allNotesSpawned = false;
        this.skippedNotes = 0;
        this.notes = [];
        this.buttons = [];
        this.isEndMusicFading = false;

        this.scalableObjects = [];

        this.isMinigameReady = false;

    }

    _preload(){
    }

    _create(){
    }

    createAfterCommercial(){
        this.getMusicInfo();
        this.createStaticImages();
        this.spawnButtons();
        this.createDynamicImages();
        this.spawnGhosts();
        this.createLights();
    }
    
    private getMusicInfo(){
        this.notesJson = this.cache.json.get(CONST.JSONPARTY.MUSIC);
        this.nextNoteSpawn = this.notesJson[0];

        this.fftJson = this.cache.json.get(CONST.JSONPARTY.FFT);

        if (this.music) this.music.stop();
        this.music = this.sound.add(CONST.AUDIO.PARTY_MUSIC);
        this.music.play();

        this.fadeSoundtrack(0, 100);
    }

    private createStaticImages(){
        this.addBackgroundImage(CONST.PARTY.BACKGROUND_BACK);
        this.add.image(0, 0, CONST.PARTY.BACKGROUND_FRONT).setOrigin(0).setDepth(10);

        this.add.image(620, 124, CONST.PARTY.LINE_PINK).setDepth(11);
        this.add.image(706, 126, CONST.PARTY.LINE_BLUE).setDepth(11);
        this.add.image(791, 124, CONST.PARTY.LINE_GREEN).setDepth(11);
        this.add.image(327, 325, CONST.PARTY.GRAVE).setDepth(20);
        this.add.image(318, 205, CONST.PARTY.MARTINI).setDepth(20);
    }

    private spawnButtons(){
        this.buttonInfo.forEach(buttonConfig => {
            var button = this.add.image(buttonConfig.x, buttonConfig.y, buttonConfig.image)
                                .setDepth(11)
                                .setInteractive(this.input.makePixelPerfect());
            
            button.config = buttonConfig;

            button.handleClicked = () => {
                var clickedNote = null;
                for (let note of this.notes){
                    if (note.isAlive && button.config.color === note.config.color){
                        if (Phaser.Math.Distance.Between(button.x, button.y, note.GetPositionOverride().x, note.GetPositionOverride().y) < button.config.clickYRange){
                            if (clickedNote === null || note.GetPositionOverride().y > clickedNote.GetPositionOverride().y){
                                clickedNote = note;
                            }
                        }
                    }
                }
                if (clickedNote !== null){
                    clickedNote.handleClicked();
                }
            }

            button.on("pointerover", function() {
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
                if (button.hoverStart != null) button.hoverStart.stop();
                button.hoverEnd = this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    ease: 'Sine.easeOut',
                    duration: 83,
                    repeat: 0,
                    yoyo: false,
                });
            }, this);

            this.buttons.push(button);
        });

        this.input.on('pointerdown', function(pointer){
            this.buttons.forEach(button => {
                if (Phaser.Math.Distance.Between(button.x, button.y, pointer.x, pointer.y) < button.config.clickRadius){
                    button.handleClicked();
                }
            });
        }, this);
            
    }

    private createDynamicImages(){
        this.scalableObjects.push(this.startTextObject);
        this.scalableObjects.push(this.add.image(159, 254, CONST.PARTY.LUNA).setDepth(1));
        this.scalableObjects.push(this.add.image(107, 97, CONST.PARTY.BATS).setDepth(12));
    }

    private spawnGhosts(){
        this.ghostConfig.forEach(config => {
            this.scalableObjects.push(this.add.image(config.x, config.y, config.image).setDepth(config.depth));
        });
    }

    private createLights(){
        this.addAnimation(CONST.PARTY.LIGHT_BLUE, CONST.ANIMATIONS.BLUE_LIGHT, 30).setImageOrigin(0.045, 0.912).setDepth(5).setLoop(true).start();
        this.addAnimation(CONST.PARTY.LIGHT_GREEN, CONST.ANIMATIONS.GREEN_LIGHT, 30).setImageOrigin(0.854, 0.917).setDepth(5).setLoop(true).start();
        this.addAnimation(CONST.PARTY.LIGHT_PINK, CONST.ANIMATIONS.PINK_LIGHT, 30).setImageOrigin(0.1267, 0.953).setDepth(5).setLoop(true).start();
    }

    _update(time: number, delta: number){
        if (!this.isMinigameReady) return;
        this.spawnMusic(delta);

        this.notes.forEach((note) => {note.onUpdate(delta)});

        this.fadeEndMusic(delta);

        this.updateFFTScales();
    }

    private spawnMusic(delta: number){
        if (this.allNotesSpawned) return;
        this.timer += delta/1000;
        if (this.timer > this.nextNoteSpawn.t){
            this.spawnNote(this.notesJson[this.currentNoteSpawn]);

            this.currentNoteSpawn++;
            this.nextNoteSpawn = this.notesJson[this.currentNoteSpawn];

            if (this.currentNoteSpawn >= this.notesJson.length) {
                this.allNotesSpawned = true;
                return;
            };
        }
    }

    private spawnNote(note){
        var noteConfig = note.c === "p" ? this.noteInfo.pink : note.c === "b" ? this.noteInfo.blue : this.noteInfo.green;

        var note = this.addAnimation(noteConfig.image, CONST.ANIMATIONS.NOTE_DEATH)
                    .setDepth(30)
                    .setOffset(-599,-177)
                    .setPositionOverride(noteConfig.spawnX, noteConfig.spawnY)
                    .setImagePosition(0)
                    .setAnimFinishCallback(() => {note.image.setVisible(false)})
                    .setLoop(false);
        
        note.config = noteConfig;
        note.moveVector = new Phaser.Math.Vector2(noteConfig.targetX - noteConfig.spawnX, noteConfig.targetY - noteConfig.spawnY).normalize();
        note.isAlive = true;

        note.onUpdate = (delta: number) => {
            note.setPositionOverride(note.GetPositionOverride().x + note.moveVector.x * note.config.moveSpeed * delta/1000, note.GetPositionOverride().y + note.moveVector.y * note.config.moveSpeed * delta/1000);

            note.checkPosition();

            if (!note.IsAnimating()){
                note.setImagePosition(note.isAlive ? 0 : 1000);
            }
        }

        note.checkPosition = () => {
            if (note.isAlive && note.GetPositionOverride().y > note.config.deathY){ 

                //Allow for some misses
                if (this.skippedNotes < this.allowedMisses) {
                    OMGLogger.Debug('Missed a note!');
                    this.skippedNotes++;
                    note.handleClicked();

                } else {
                    this.triggerLose();
                }
             }
        }

        note.handleClicked = () => {
            if (!note.isAlive) return;
            note.isAlive = false;
            note.start();
        }

        this.notes.push(note);
    }

    private fadeEndMusic(delta: number){
        if (!this.isEndMusicFading) return;

        this.endMusicTimer += delta;
        if (this.endMusicTimer > 1000){
            this.music.setVolume(0);
            this.music.stop();
            OMGLogger.Debug("Party music stopped!");
            this.isEndMusicFading = false;
            return;
        }

        this.music.setVolume(Phaser.Math.Linear(1, 0, this.endMusicTimer/1000));
    }

    private updateFFTScales(){
        let fftFrame = this.GetCurrentFFTFrame();
        if (fftFrame == this.currentFFTFrame) return;

        this.setFFTScales(fftFrame);
        this.currentFFTFrame = fftFrame;
    }

    private GetCurrentFFTFrame(){
        for (var i = this.currentFFTFrame; i < this.fftJson.length; i++){
            if (this.fftJson[i].t > this.music.seek){
                return i;
            }
        }
        return this.fftJson.length - 1;
    }

    private setFFTScales(frame: number){
        let scale = this.fftJson[frame].s;
        this.scalableObjects.forEach(scalableObject => {
            scalableObject.setScale(scale);
        });

        this.notes.forEach(note => {
            if (note.isAlive){
                note.setScaleMultiplier(scale);
            }
        })
    }

    _timeout(){
        this.triggerWin();
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        if (!this.isCurrentState(CONST.GAMESTATE.PLAYING)) return;

        OMGLogger.Debug("Lose Party minigame");
        this.fadeSoundtrack(1, 1000);
        this.isEndMusicFading = true;
        this.loseGame(0);
    }

    private triggerWin(){
        OMGLogger.Debug("Win Party minigame");
        this.isEndMusicFading = true;
        this.fadeSoundtrack(1, 1000);

        this.addAnimation(CONST.PARTY.WIN_SCREEN, CONST.ANIMATIONS.WIN_IMAGE_POPUP)
            .setDepth(300)
            .setLoop(false)
            .start();
        //trigger win after 1 second and load next scene
        this.winGame(1500);
    }

    onCommercialEnded = () => {
        this.isMinigameReady = true;
        this.createAfterCommercial();
    }
}