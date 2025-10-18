import { OMGLogger } from "../util/OMGLogger";

interface ChunkOptions{
    requiredFor: string[],
    imagesKey ?: any,
    audio ?: any,
    json ?: any,
    animations ?: any,
    physics ?: any,
    loadedCallback ?: any,
    tag ?: string[],
}

enum LoadType {
    JSON =1,
    IMAGE,
    AUDIO,
};

export default class ProgressiveLoadChunk {
    

    private loadScene: Phaser.Scene;
    private loaded: boolean; //true if all assets are loaded
    private loading: boolean; //true if assets are currently loading for this chunk
    private requiredFor: string[];
    private imagesKey: any;
    private animations: any;
    private physics: any;
    private audio: any;
    private json: any;
    private loadedCallback: any;
    private tag: string[];

    private remainingFiles: string[];

    constructor(loadScene: Phaser.Scene, options: ChunkOptions){
        this.loadScene = loadScene;
        this.requiredFor = (typeof options.requiredFor === 'undefined') ? [] : options.requiredFor; 
        this.imagesKey = (typeof options.imagesKey === 'undefined') ? false : options.imagesKey;
        this.animations = (typeof options.animations === 'undefined') ? false : options.animations;
        this.physics = (typeof options.physics === 'undefined') ? false : options.physics;
        this.audio = (typeof options.audio === 'undefined') ? false : options.audio;
        this.json = (typeof options.json === 'undefined') ? false : options.json;
        this.loadedCallback = (typeof options.loadedCallback === 'undefined') ? false : options.loadedCallback;

        this.tag = (typeof options.tag === 'undefined') ? [] : options.tag;

        this.loaded = false;
        this.loading = false;
        this.remainingFiles = [];
    }

    Load(){
        this.loading = true;

        this.loadFiles(this.imagesKey, LoadType.IMAGE);
        this.loadFiles(this.animations, LoadType.JSON);
        this.loadFiles(this.physics, LoadType.JSON);
        this.loadFiles(this.audio, LoadType.AUDIO);
        this.loadFiles(this.json, LoadType.JSON);

        this.checkIfLoaded();
    }
    
    isBlockingScene(sceneName: string){
        //If chunk is not loaded and chunk is required for scene -> chunk is blocking scene 
        return !this.loaded && this.requiredFor.indexOf(sceneName) !== -1;
    }

    handleFileComplete(key: string){
        //If completed file is part of this chunk -> remove it from list of remaining files
        var fileIndex = this.remainingFiles.indexOf(key);

        if (fileIndex === -1) return;

        this.remainingFiles.splice(fileIndex, 1);

        this.checkIfLoaded();
    }

    private checkIfLoaded(){
        this.loaded = this.remainingFiles.length == 0; 
        if (this.loaded){
            this.loading = false;
            // console.log(this.requiredFor[0] + " CHUNK LOADED");

            if (this.loadedCallback){
                this.loadedCallback();
            }
        }
    }

    private loadFiles(files: any, loadType: number){
        if (!files) return;

        for (let f in files){
            if (this.isAlreadyLoaded(files[f], loadType)){
                 OMGLogger.Debug("Skipping file load " + files[f] + " - already loaded. You should check why a double load was attempted.");
                continue;
            }

            switch(loadType){
                case LoadType.JSON:
                    this.loadScene.load.json(files[f], files[f]);
                    break;
                case LoadType.AUDIO:
                    this.loadScene.load.audio(files[f], files[f]);
                    break;
                case LoadType.IMAGE:
                    this.loadScene.load.image(files[f], files[f]);
                    break;
            }
            this.remainingFiles.push(files[f]);
        }
    }

    public hasTag(tag: string){
        return this.tag.some(t => t === tag);
    }

    public isLoaded(){
        return this.loaded;
    }

    public isLoading(){
        return this.loading;
    }

    private isAlreadyLoaded(key: string, loadType : LoadType){
        
        var data = this.GetCacheDataForKey(key, loadType);
        return !(data === undefined || data === "__MISSING");
    }

    private GetCacheDataForKey(key: string, loadType: LoadType){
        switch(loadType){
            case LoadType.JSON:
                return this.loadScene.cache.json.get(key);
            case LoadType.AUDIO:
                return this.loadScene.cache.audio.get(key);
            case LoadType.IMAGE:
                return this.loadScene.textures.get(key).key;
        }
    }
}