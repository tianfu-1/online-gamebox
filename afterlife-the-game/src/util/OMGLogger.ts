import { BuildLevel, Config } from "../CONFIG";

export class OMGLogger {

    static Debug(...args: any[]){
        this.Log(args);
    }
    
    static Log(args: any[], logLevel: BuildLevel = BuildLevel.Dev){
        if (Config.BuildLevel > logLevel) return;

        console.log(...args);
    }
}
