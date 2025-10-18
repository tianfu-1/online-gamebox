import { CONST } from "../CONST";
import ProgressiveLoadChunk from "../components/ProgressiveLoadChunk";

export class ProgressiveLoadScene extends Phaser.Scene{

    private loadQueue: ProgressiveLoadChunk[] = [];
    private loadedChunks: ProgressiveLoadChunk[] = [];
    private currChunk ?: ProgressiveLoadChunk;

    constructor(){
        super({
            key: CONST.SCENES.PROGRESSIVE_LOAD,
        })
    }

    //Load 
    init(){
        this.registry.set(CONST.SCENES.PROGRESSIVE_LOAD, this);
        
        this.loadQueue = [
            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.FLY],
                audio: [CONST.AUDIO.WIN, CONST.AUDIO.LOSE],
            }),

            new ProgressiveLoadChunk(this, { 
                requiredFor: [CONST.SCENES.FLY],
                imagesKey: CONST.FLY,
                animations: [CONST.ANIMATIONS.FLY_WIN],
                physics: [CONST.PHYSICS.FLY_SHAPES],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.PROTECT],
                imagesKey: CONST.PROTECT,
                animations: [CONST.ANIMATIONS.GRANNYDIE_BODY, 
                    CONST.ANIMATIONS.GRANNYDIE_HAND1, 
                    CONST.ANIMATIONS.GRANNYDIE_HAND2,
                    CONST.ANIMATIONS.GRANNY_HAND1, 
                    CONST.ANIMATIONS.GRANNY_HAND2],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.PROTECT, CONST.SCENES.GHOSTBUSTERS],
                animations: [CONST.ANIMATIONS.GHOST_IDLE],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.PROTECT, CONST.SCENES.PARTY],
                animations: [CONST.ANIMATIONS.WIN_IMAGE_POPUP],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.SOUNDTRACK],
                audio: [CONST.AUDIO.SOUNDTRACK],
                loadedCallback: () => {
                    this.registry.get(CONST.SCENES.SOUNDTRACK).switchMusic();
                }
            }),     

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.ALAN],
                imagesKey: CONST.ALAN,
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.DRESSUP, CONST.SCENES.SORT, CONST.SCENES.ALAN],
                audio: [CONST.AUDIO.GRAB],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.JUMPSCARE],
                imagesKey: CONST.JUMPSCARE,
                audio: [CONST.AUDIO.SCARE1, CONST.AUDIO.SCARE2, CONST.AUDIO.CLICK],
                animations: [CONST.ANIMATIONS.SCARYARM_BACK, CONST.ANIMATIONS.SCARYARM_FRONT],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.COMEDIAN],
                imagesKey: CONST.COMEDIAN,
                animations: [CONST.ANIMATIONS.COMEDIAN_HAND_1, CONST.ANIMATIONS.COMEDIAN_HAND_2],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.PARTY],
                imagesKey: CONST.PARTY,
                audio: [CONST.AUDIO.PARTY_MUSIC],
                animations: [CONST.ANIMATIONS.BLUE_LIGHT,
                    CONST.ANIMATIONS.GREEN_LIGHT,
                    CONST.ANIMATIONS.PINK_LIGHT,
                    CONST.ANIMATIONS.NOTE_DEATH,
                ],
                json: CONST.JSONPARTY,
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.DRESSUP],
                imagesKey: CONST.DRESSUP,
                audio: [CONST.AUDIO.BOUNCE],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.COLLECT],
                imagesKey: CONST.COLLECT,
                audio: [CONST.AUDIO.WINK],
                animations: [CONST.ANIMATIONS.CANDY_DIE,
                    CONST.ANIMATIONS.CANDY_IDLE,
                ],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.SORT],
                imagesKey: CONST.SORT,
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.GHOSTBUSTERS],
                imagesKey: CONST.GHOSTBUSTERS,
                animations: [CONST.ANIMATIONS.GHOST_DIE],
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.HEAVENHELL],
                imagesKey: CONST.HEAVENHELL,
                physics: [CONST.PHYSICS.HEAVENHELL_SHAPES]
            }),

            new ProgressiveLoadChunk(this, {
                requiredFor: [CONST.SCENES.CREDITS],
                imagesKey: CONST.CREDITS,
            }),
        ];
    }

    preload(){
        this.load.on('filecomplete', (key: string, file: any) =>{
            //console.log("File complete: " + key);
            if (!this.currChunk) return;
            this.currChunk.handleFileComplete(key);
        }, this);
    }

    update(){
        this.loadNextChunkNew();
    }

    private loadNextChunkNew(){
        //return if all chunks are loaded
        if (this.loadQueue.length == 0 && !this.currChunk) return;

        //Start loading next chunk if nothing is loading at the moment
        if (!this.currChunk){
            //console.log("loading next chunk");
            this.currChunk = this.loadQueue.shift();
            return;
        }

        //Start loading current chunk if no chunk is loading already
        if (!this.currChunk.isLoaded() && !this.currChunk.isLoading()){
            this.currChunk.Load();
            this.load.start();
        }

        //Add current chunk to loaded chunks after it is loaded
        if (this.currChunk.isLoaded()){
            this.loadedChunks.push(this.currChunk);
            this.currChunk = undefined;
        }
    }

    public prioritizeChunksWithTag(tag: string){
        // console.log("Prioritizing chunks with tag: " + tag);

        var tagChunks = this.loadQueue.filter(chunk => chunk.hasTag(tag));
        var otherChunks = this.loadQueue.filter(chunk => !chunk.hasTag(tag));

        this.loadQueue = [...tagChunks, ...otherChunks];
    }

    isSceneLoaded(sceneName: string){
        if (this.currChunk && this.currChunk.isBlockingScene(sceneName)){
            return false;
        }

        for(let chunk of this.loadQueue){
            if (chunk.isBlockingScene(sceneName)){
                return false;
            }
        }
        return true;
    }
}