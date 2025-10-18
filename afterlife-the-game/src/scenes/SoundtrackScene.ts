import { CONST } from "../CONST";
import { OMGLogger } from "../util/OMGLogger";

export class SoundtrackScene extends Phaser.Scene{
    public music !: Phaser.Sound.BaseSound;
    public creepySound !: Phaser.Sound.BaseSound;

    private startVolume !: number;
    private targetVolume !: number;
    private timer !: number;
    private timerEerie !: number;
    private timeToChangeVolume !: number;
    private isFading !: boolean;
    private isFadingEerie !: boolean;


    constructor(){
        super({
            key: CONST.SCENES.SOUNDTRACK,
        });
    }

    init(){
        this.startVolume = 1;
        this.targetVolume = 1;
        this.timer = 1000;
        this.timerEerie = 0;
        this.timeToChangeVolume = 1000;
        this.isFading = false;
        this.isFadingEerie = false;
    }

    preload(){
    }

    public FadeSoundtrack(targetVolume: number, timeToChange: number){
        this.startVolume = this.music.volume;
        this.targetVolume = targetVolume;
        this.timeToChangeVolume = timeToChange;
        this.timer = 0;
        this.isFading = true;
    }

    public FadeOutEerie(){
        this.isFadingEerie = true;
    }

    public play(){
        this.music.play();
        this.music.setSeek(87);
    }

    public pause(){
        this.music.pause();
    }

    create(){
        this.music = this.sound.add(CONST.AUDIO.SOUNDTRACK_SHORT, { loop: true, mute: false, volume: 0});
        this.music.setVolume(0);
        this.music.pause();

        this.creepySound = this.sound.add(CONST.AUDIO.EERIE, { loop: true, mute: false, volume: 1});
        this.creepySound.play();

        this.registry.set(CONST.SCENES.SOUNDTRACK, this);

    }


    update(time: number, delta: number){
        this.fadeVolume(delta);
        this.fadeEerie(delta);
    }

    private fadeVolume(delta: number){
        if (!this.isFading) return;

        this.timer += delta;
        if (this.timer > this.timeToChangeVolume){
            this.music.setVolume(this.targetVolume);
            this.isFading = false;
            return;
        }

        this.music.setVolume(Phaser.Math.Linear(this.startVolume, this.targetVolume, this.timer/this.timeToChangeVolume));
    }

    private fadeEerie(delta: number){
        if (!this.isFadingEerie) return;

        this.timer += delta;
        if (this.timer > 1000){
            this.creepySound.setVolume(0);
            this.creepySound.stop();
            this.isFadingEerie = false;
            return;
        }

        this.creepySound.setVolume(Phaser.Math.Linear(1, 0, this.timer/1000));
    }

    //Called when actual soundtrack is loaded
    public switchMusic(){
        OMGLogger.Debug("Music switched!");
        var newMusic = this.sound.add(CONST.AUDIO.SOUNDTRACK, { loop: true, mute: false, seek: this.music.seek});
        newMusic.play();
        if (this.music.isPaused){
            newMusic.pause();
        }
        newMusic.setSeek(this.music.seek);
        newMusic.setVolume(this.music.volume);
        this.music.stop();
        this.music = newMusic;
    }
}