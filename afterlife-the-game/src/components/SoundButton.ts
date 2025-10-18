import { CONST } from "../CONST";
import { AudioPlugin } from "../plugins/AudioPlugin";

export default class SoundButton extends Phaser.GameObjects.Image {
    private audioPlugin: AudioPlugin;

    constructor(scene: Phaser.Scene, x: number,  y: number, audioPlugin: AudioPlugin) {
        super(scene, x, y, CONST.BUTTONS.SOUND_ON);

        this.audioPlugin = audioPlugin;
        this.setInteractive({useHandCursor: true});
        this.on("pointerup", this.handleClick);  
        this.updateTexture();
        this.setScale(0.7);

        this.scene.add.existing(this);
    }

    private handleClick(){
        if (this.scene.rewardedBreakRequested) return;
        this.audioPlugin.toggleAudioEnabled();
        this.updateTexture();
    }

    private updateTexture(){
        this.setTexture(this.audioPlugin.isAudioEnabled() ? CONST.BUTTONS.SOUND_ON : CONST.BUTTONS.SOUND_OFF);
    }
}