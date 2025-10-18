import { storageFactory } from "storage-factory";
import { OMGLogger } from "../util/OMGLogger";

const local = storageFactory(() => localStorage);

export class StoragePlugin extends Phaser.Plugins.BasePlugin{
    
    private initialized : boolean;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);

        this.initialized = false;
    }

    initialize(){
        this.initialized = true;
    }

    getItem(key: string, defaultValue: any = ""){
        var item = local.getItem(key);
        return item ? item : defaultValue;
    }

    setItem(key: string, value: string){
        OMGLogger.Debug("Saving key: " + key + " value: " + value);
        local.setItem(key, value);
    }

    removeItem(key: string){
        local.removeItem(key);
    }

    isLocalStorageSupported(){
        try {
            const testKey = "isLocalStorageSupported";
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
}