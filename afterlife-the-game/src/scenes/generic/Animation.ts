export class UnityAnimation {
    private animTimer = 0;
    private isAnimating = false;
    private loop = false;
    private playbackSpeed = 1;

    private xOffset = 0;
    private yOffset = 0;
    private angleOffset = 0;
    private scaleMultiplierX = 1;
    private scaleMultiplierY = 1;

    private xOverride = 0;
    private yOverride = 0;

    private finishCallback = () => {};

    private animFPS : number;

    private animationJson: any;
    private image: Phaser.GameObjects.Image;
    private duration: number;

    constructor(image: Phaser.GameObjects.Image, animationJson: any, animFPS: number = 60){
        this.image = image;
        this.animationJson = animationJson;
        this.animFPS = animFPS;

        this.resetAnimTimer();
        this.isAnimating = false;

        this.duration = 1000 * animationJson.frames.length / animFPS;
    }

    private resetAnimTimer(){
        this.animTimer = this.playbackSpeed < 0 ? this.duration : 0;
    }

    public setLoop(loop: boolean) : UnityAnimation {
        this.loop = loop;
        return this;
    }

    public setPlaybackSpeed(speed: number) : UnityAnimation {
        this.playbackSpeed = speed;
        this.resetAnimTimer();
        return this;
    }

    public setOffset(x: number, y: number) : UnityAnimation {
        this.xOffset = x;
        this.yOffset = y;
        return this;
    }

    public setAngleOffset(angle: number) : UnityAnimation {
        this.angleOffset = angle;
        return this;
    }

    public setScaleMultiplier(scaleMultiplierX: number, scaleMultiplierY: number = 0) : UnityAnimation {
        this.scaleMultiplierX = scaleMultiplierX;
        this.scaleMultiplierY = scaleMultiplierY === 0 ? scaleMultiplierX : scaleMultiplierY;

        return this;
    }

    public setDepth(depth: number) : UnityAnimation {
        this.image.setDepth(depth);
        return this;
    }

    public setScrollFactor(x: number, y: number) : UnityAnimation {
        this.image.setScrollFactor(x, y);
        return this;
    }

    public setDraggable(input: Phaser.Input.InputPlugin) : UnityAnimation {
        this.image.setInteractive({useHandCursor: true});
        input.setDraggable(this.image);

        return this;
    }

    public setPositionOverride(x: number, y: number, overrideY = true) : UnityAnimation {
        this.xOverride = x;
        if (overrideY){
            this.yOverride = y;
        }
        return this;
    }

    public setAnimFinishCallback(callback: () => void) : UnityAnimation{
        this.finishCallback = callback;
        return this;
    }

    public setImageOrigin(x: number, y: number) : UnityAnimation {
        this.image.setOrigin(x, y);
        return this;
    }

    public setImageInteractive() : UnityAnimation{
        this.image.setInteractive();
        return this;
    }

    public GetPositionOverride(){
        return {x: this.xOverride, y: this.yOverride};
    }

    public GetOffset(){
        return {x: this.xOffset, y: this.yOffset};
    }

    public GetImage(){
        return this.image;
    }

    public update(delta: number){
        if (this.isAnimating){
            this.positionImageOnAnimation(this.animTimer);
            this.updateTimer(delta);
        }
    }

    private updateTimer(delta: number){
        this.animTimer += delta * this.playbackSpeed;
        if (this.isAnimationFinished()){
            if (this.loop){
                this.resetAnimTimer();
            } else {
                this.isAnimating = false;
                this.finishCallback();
            }
        }
    }

    private isAnimationFinished() : boolean {
        return this.playbackSpeed > 0 && this.animTimer >= this.duration
            || this.playbackSpeed < 0 && this.animTimer <= 0;
    }

    public start() : UnityAnimation{
        this.isAnimating = true;
        return this;
    }

    public pause() : UnityAnimation{
        this.isAnimating = false;
        return this;
    }

    public stop() : UnityAnimation{
        this.resetAnimTimer();
        this.isAnimating = false;
        return this;
    }

    public setAnimation(animationJson: any) : UnityAnimation {
        this.animationJson = animationJson;
        this.resetAnimTimer();

        this.duration = 1000 * animationJson.frames.length / this.animFPS;
        return this;
    }

    public setImagePosition(animationTime: number) : UnityAnimation {
        this.positionImageOnAnimation(animationTime);
        return this;
    }

    public IsAnimating() : boolean {
        return this.isAnimating;
    }

    private positionImageOnAnimation(timer: number){
        //Get frame
        var frameIndex = Math.floor(timer * (this.animFPS / 1000));
        if (frameIndex >= this.animationJson.frames.length){
            frameIndex = this.animationJson.frames.length - 1;
        }

        var frame = this.animationJson.frames[frameIndex];

        //position image to frame
        this.image.setPosition(frame.x + this.xOffset + this.xOverride, frame.y + this.yOffset + this.yOverride)
            .setScale(parseFloat(frame.scaleX) * this.scaleMultiplierX, 
                      parseFloat(frame.scaleY) * this.scaleMultiplierY)
            .setAngle(parseFloat(frame.angle) + this.angleOffset);
    }
}