import { CONST } from "../CONST";
import { MinigameScene } from "./generic/MinigameScene";

export class ComedianScene extends MinigameScene {
    //Images

    //values
    private winGhosts = [
        {x: 497, y: 446, depth: 501, image: CONST.COMEDIAN.GHOST_1},
        {x: 388, y: 431, depth: 501, image: CONST.COMEDIAN.GHOST_2},
        {x: 272, y: 430, depth: 501, image: CONST.COMEDIAN.GHOST_3},
        {x: 609, y: 447, depth: 501, image: CONST.COMEDIAN.GHOST_4},
        {x: 727, y: 458, depth: 501, image: CONST.COMEDIAN.GHOST_5},
        {x: 812, y: 462, depth: 501, image: CONST.COMEDIAN.GHOST_6},
        {x: 160, y: 433, depth: 501, image: CONST.COMEDIAN.GHOST_7},
        {x: 45, y: 457, depth: 501, image: CONST.COMEDIAN.GHOST_8}
    ];

    private ghostMoveDistance = 16;

    private jokeConfigs = [
        {question: {x: 617, y: 57, image: CONST.COMEDIAN.JOKE_1_QUESTION},
        answers: [
            {x: 529, y: 152, scale: 0.81, angle: 0, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_1_ANSWER_1},
            {x: 726, y: 161, scale: 1, angle: 16, depth: 100, correctAnswer: true, image: CONST.COMEDIAN.JOKE_1_ANSWER_2},
            {x: 714, y: 255, scale: 0.92, angle: -2.8, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_1_ANSWER_3}
        ]},

        {question: {x: 617, y: 72, image: CONST.COMEDIAN.JOKE_2_QUESTION},
        answers: [
            {x: 511, y: 166, scale: 0.76, angle: 10, depth: 100, correctAnswer: true, image: CONST.COMEDIAN.JOKE_2_ANSWER_1},
            {x: 730, y: 186, scale: 0.83, angle: 5, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_2_ANSWER_2},
            {x: 717, y: 288, scale: 0.67, angle: -10, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_2_ANSWER_3}
        ]},

        {question: {x: 617, y: 80, image: CONST.COMEDIAN.JOKE_3_QUESTION},
        answers: [
            {x: 496, y: 174, scale: 0.66, angle: -18, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_3_ANSWER_2},
            {x: 710, y: 203, scale: 0.81, angle: 3.3, depth: 100, correctAnswer: true, image: CONST.COMEDIAN.JOKE_3_ANSWER_1},
            {x: 718, y: 273, scale: 0.67, angle: 9, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_3_ANSWER_3}
        ]},

        {question: {x: 621, y: 63, image: CONST.COMEDIAN.JOKE_4_QUESTION},
        answers: [
            {x: 515, y: 157, scale: 0.87, angle: -6.5, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_4_ANSWER_2},
            {x: 743, y: 160, scale: 0.8, angle: 13.3, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_4_ANSWER_3},
            {x: 727, y: 258, scale: 0.76, angle: -10, depth: 100, correctAnswer: true, image: CONST.COMEDIAN.JOKE_4_ANSWER_1}
        ]},

        {question: {x: 630, y: 73, image: CONST.COMEDIAN.JOKE_5_QUESTION},
        answers: [
            {x: 527, y: 167, scale: 0.91, angle: -1.5, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_5_ANSWER_2},
            {x: 730, y: 200, scale: 0.87, angle: 26, depth: 100, correctAnswer: true, image: CONST.COMEDIAN.JOKE_5_ANSWER_1},
            {x: 727, y: 279, scale: 0.9, angle: 4.5, depth: 100, correctAnswer: false, image: CONST.COMEDIAN.JOKE_5_ANSWER_3}
        ]},
    ];

    private jokeSpawnDelay = 500;

    //logic vars
    private activeJoke;
    private currentJokeIndex = 0;

    constructor(){
        super ({
            sceneName: CONST.SCENES.COMEDIAN,
            duration: 1000,
            showCountdown: false,
            startScreenColor: 0xFF5668,
            startText: "MAKE THEM\nLAUGH!",
            startTextYOrigin: 0.35,
            startTextColor: 0x323232,
            endScreen: CONST.COMEDIAN.END,
            nextScene: CONST.SCENES.PARTY,
            endButtons: {
                normalNoSkip: {x: 650, y: 282, scale: 1.30},
                normalWithSkip: {x: 650, y: 282, scale: 1.30},
                skip: {x: 650, y: 384, scale: 1.30}
            }
          })
    }
    _init(){
        //Reset all class variables that change during scene here (including arrays that initialize in create!)
        this.activeJoke = null;
        this.currentJokeIndex = 0;
    }

    _preload(){
    }

    _create(){
        this.createBackground();
        this.initJokes();
    }

    private createBackground(){
        this.addBackgroundImage(CONST.COMEDIAN.BACKGROUND);
        this.add.image(226, 177, CONST.COMEDIAN.MIC).setDepth(10);
        var ghost = this.add.image(180, 125, CONST.FLY.GHOST).setDepth(5).setAngle(-6).setScale(0.7);
        this.tweens.add({
            targets: ghost,
            y: '-=4',
            ease: 'Quad.easeInOut',
            duration: 375,
            repeat: -1,
            yoyo: true,
        }); 
    }

    private initJokes(){
        this.currentJokeIndex = 0;
        this.spawnJoke(this.currentJokeIndex);
    }

    private spawnJoke(jokeIndex: number){
        var jokeConfig = this.jokeConfigs[jokeIndex];

        var joke = this.add.image(jokeConfig.question.x, jokeConfig.question.y, jokeConfig.question.image).setDepth(100);
        joke.answers = [];

        jokeConfig.answers.forEach((answerConfig) => {
            var answer = this.add.image(answerConfig.x, answerConfig.y, answerConfig.image)
                        .setScale(answerConfig.scale)
                        .setAngle(answerConfig.angle)
                        .setDepth(answerConfig.depth)
                        .setInteractive(this.input.makePixelPerfect());
            
            answer.isCorrect = answerConfig.correctAnswer;
            answer.hoverStart = null;
            answer.hoverEnd = null;
            answer.isInteractable = true;
            
            answer.on("pointerover", function() {
                if (!answer.isInteractable) return;
                if (answer.hoverEnd != null) answer.hoverEnd.stop();
                answer.hoverStart = this.tweens.add({
                    targets: answer,
                    scaleX: answerConfig.scale * 1.2,
                    scaleY: answerConfig.scale * 1.2,
                    ease: 'Sine.easeOut',
                    duration: 83,
                    repeat: 0,
                    yoyo: false,
                }); 
            }, this);

            answer.on("pointerout", function() {
                if (!answer.isInteractable) return;
                if (answer.hoverStart != null) answer.hoverStart.stop();
                answer.hoverEnd = this.tweens.add({
                    targets: answer,
                    scaleX: answerConfig.scale,
                    scaleY: answerConfig.scale,
                    ease: 'Sine.easeOut',
                    duration: 83,
                    repeat: 0,
                    yoyo: false,
                });
            }, this);

            answer.on("pointerup", function() {
                if (!answer.isInteractable) return;
                if (answer.hoverStart != null) answer.hoverStart.stop();
                if (answer.hoverEnd != null) answer.hoverEnd.stop();

                this.tweens.timeline({
                    targets: answer,
                    ease: 'Cubic.easeInOut',
                    duration: 500,
                    loop: 0,
                
                    tweens: [
                        {
                            targets: answer,
                            scaleX: answerConfig.scale * 1.4,
                            scaleY: answerConfig.scale * 1.4,
                            //ease: 'Cubic.easeInOut', 
                            duration: 150,
                            repeat: 0,
                            yoyo: false,
                        },
                        {
                            targets: answer,
                            scaleX: 0,
                            scaleY: 0,
                            //ease: 'Cubic.easeInOut', 
                            duration: 350,
                            repeat: 0,
                            yoyo: false,
                        },
                    ]
                });

                this.handleAnswerSelected(answer.isCorrect);
            }, this);

            joke.answers.push(answer);
        }, this);

        joke.endAnimation = () => {
            this.tweens.add({
                targets: joke,
                scaleX: 0,
                scaleY: 0,
                ease: 'Cubic.easeInOut',
                duration: 500,
                repeat: 0,
                yoyo: false,
            }); 

            for (var i = 0; i < joke.answers.length; i++){
                joke.answers[i].isInteractable = false;

                if (joke.answers[i].isCorrect) continue;

                this.tweens.add({
                    targets: joke.answers[i],
                    scaleX: 0,
                    scaleY: 0,
                    ease: 'Cubic.easeInOut',
                    duration: 500,
                    repeat: 0,
                    yoyo: false,
                }); 
            }
        };

        this.activeJoke = joke;
    }

    private handleAnswerSelected(correctAnswer: boolean){
        if (correctAnswer){
            this.activeJoke.endAnimation();

            if (this.currentJokeIndex < this.jokeConfigs.length - 1){
                this.currentJokeIndex++;
                this.time.delayedCall(this.jokeSpawnDelay, () => {
                    this.spawnJoke(this.currentJokeIndex);
                }, null, this);
            this.playWinAudio();
            
            } else {
                this.time.delayedCall(this.jokeSpawnDelay, () => {
                    this.triggerWin();
                }, null, this);
            }
        } else {
           this.triggerLose();
        }
    }

    _update(time: number, delta: number){
    }

    _timeout(){
    }

    _afterLoss(){
    }

    _afterWin(){
    }

    private triggerLose(){
        this.add.image(0, 0, CONST.COMEDIAN.LOSEIMAGE).setDepth(500).setOrigin(0);
        this.loseGame(2000);
    }

    private triggerWin(){
        this.showWin();
        this.winGame(2500);
    }

    private showWin(){
        this.add.image(0, 0, CONST.COMEDIAN.WIN_BACKGROUND).setDepth(500).setOrigin(0);
        
        this.addAnimation(CONST.COMEDIAN.HANDS_1, CONST.ANIMATIONS.COMEDIAN_HAND_1, 30)
                .setDepth(510)
                .setLoop(true)
                .setImageOrigin(0.898, 0.592)
                .start();

        this.addAnimation(CONST.COMEDIAN.HANDS_2, CONST.ANIMATIONS.COMEDIAN_HAND_2, 30)
                .setDepth(510)
                .setLoop(true)
                .setImageOrigin(0.033, 0.753)
                .start();

        this.winGhosts.forEach(ghost => {
            var image = this.add.image(ghost.x, ghost.y, ghost.image).setDepth(ghost.depth);
            var moveDistance = this.getRandomInt(-this.ghostMoveDistance, this.ghostMoveDistance);
            image.x -= moveDistance;
            this.tweens.add({
                targets: image,
                    x: image.x + 2 * moveDistance,
                    ease: 'Linear',
                    duration: this.getRandomInt(100, 200),
                    repeat: -1,
                    yoyo: true,
                    progress: Math.random(),
            });
        });

    }
}
