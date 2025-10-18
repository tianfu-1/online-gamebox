import { StoragePlugin } from "./StoragePlugin";

const audioEnabledKey = "audioEnabled";

export class AudioPlugin extends Phaser.Plugins.BasePlugin{

    private audioEnabled: boolean;

    private isCommercialBreak: boolean;
    private initialized : boolean;

    private storagePlugin : StoragePlugin;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);

        this.storagePlugin = <StoragePlugin> pluginManager.get("StoragePlugin");
        this.audioEnabled = JSON.parse(this.storagePlugin.getItem(audioEnabledKey, "true"));

        this.isCommercialBreak = false;
        this.pluginManager.game.sound.mute = !this.audioEnabled;
        
        this.initialized = false;
    }

    initialize(){
        this.initialized = true;
    }

    public toggleAudioEnabled(){
        this.audioEnabled = !this.audioEnabled;
        this.storagePlugin.setItem(audioEnabledKey, this.audioEnabled.toString());

        this.updateAudioMute();

        return this.isAudioEnabled();
    }

    public isAudioEnabled(){
        return this.audioEnabled;
    }

    public beforeCommercialBreak(){
        this.isCommercialBreak = true;
        this.updateAudioMute();
    }

    public afterCommercialBreak(){
        this.isCommercialBreak = false;
        this.updateAudioMute();
    }

    private updateAudioMute(){
        this.pluginManager.game.sound.mute = !this.audioEnabled || this.isCommercialBreak;

    }
}