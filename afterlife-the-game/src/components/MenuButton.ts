import { CONST } from "../CONST";

export default class MenuButton extends Phaser.GameObjects.Container {
    private buttonTween!: Phaser.Tweens.Tween;
    private bgImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number,  y: number, bgTexture: string, buttonText: string, onClick: () => void, fontSize = 40) {
        super(scene, x, y);

       //create bg, create text
       this.bgImage = this.scene.add.image(0, 0, bgTexture);
       let text = this.scene.add.bitmapText(0, 0, CONST.FONT.ATLAS, buttonText, fontSize).setOrigin(0.5, 0.35);
        this.add([this.bgImage, text]);

        scene.add.existing(this);

        this.setDepth(3);

        this.bgImage.on("pointerup", () => {
            onClick();
        });

        this.bgImage.on("pointerover", () => {
            this.animateButton(true);
        });

        this.bgImage.on("pointerout", () => {
            this.animateButton(false);
        });

        this.overrideInteractive(true);
    }

    animateButton(animIn: boolean){
        if (this.buttonTween){
            this.buttonTween.stop();
        }

        this.buttonTween = this.scene.tweens.add({
            targets: this,
            scaleX: animIn ? 1.05 : 1,
            scaleY: animIn ? 1.05 : 1,
            ease: "Quad.easeInOut",
            duration: 75,
            repeat: 0,
            yoyo: false,
        })
    }

    overrideInteractive(interactive: boolean){
        if (interactive){
            this.bgImage.setInteractive({useHandCursor: true, pixelPerfect: true});
        } else {
            this.bgImage.disableInteractive();
        }
    }

    
}