import { OMGLogger } from "../util/OMGLogger";
import { Config } from "../Config";
// var gameanalytics = require('gameanalytics');

export const AnalyticsEvent = {
    AdblockEnabled: "Ads:Adblock:Enabled",
    AdblockDisabled: "Ads:Adblock:Disabled",
    LocalStorageEnabled: "General:LocalStorage:Enabled",
    LocalStorageDisabled: "General:LocalStorage:Disabled",

    ConfigsLoadOnTime: "Configs:Load:OnTime",
    ConfigsLoadDelayed: "Configs:Load:Delayed",
    ConfigsLoadTimeout: "Configs:Load:Timeout",

    AdsRewardedCompleted: "Ads:Rewarded:Completed",
    AdsRewardedFailed: "Ads:Rewarded:Failed",

    LoadLoadingTime: "Load:Loading:Time",
}

export class AnalyticsPlugin extends Phaser.Plugins.BasePlugin{
    
    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    initialize() {
        if (this.analyticsDisabled()){
            OMGLogger.Debug("Analytics are disabled.");
            return;
        }

        OMGLogger.Debug("Initializing analytics");
        // gameanalytics.GameAnalytics.configureBuild(Config.GameVersion);

        const gK = "0e2c1ed3ff77fc8d1a7dcd778f6801ca";
        const sK = "20de031cbd535c2c8d5a6161ed9eb231f28533a0";

        // gameanalytics.GameAnalytics.initialize(gK, sK);
        // gameanalytics.GameAnalytics.setEnabledVerboseLog(true);
    }

    public setAdblockStatus(adblockEnabled: boolean) {
        this.addDesignEvent(adblockEnabled ? AnalyticsEvent.AdblockEnabled : AnalyticsEvent.AdblockDisabled);
    }

    public setLocalStorageSupported(localStorageSupported: boolean) {
        this.addDesignEvent(localStorageSupported ? AnalyticsEvent.LocalStorageEnabled : AnalyticsEvent.LocalStorageDisabled);
    }

    public addRewardedAdFinishedEvent(completedSuccessfully: boolean){
        this.addDesignEvent(completedSuccessfully ? AnalyticsEvent.AdsRewardedCompleted : AnalyticsEvent.AdsRewardedFailed);
    }

    public addGameStartEvent(sceneName: string){
        //this.addProgressionEvent(gameanalytics.EGAProgressionStatus.Start, sceneName);
    }

    public addGameWinEvent(sceneName: string){
        //this.addProgressionEvent(gameanalytics.EGAProgressionStatus.Complete, sceneName);
    }

    public addGameLoseEvent(sceneName: string){
        //this.addProgressionEvent(gameanalytics.EGAProgressionStatus.Fail, sceneName);
    }

    public addFinalScoreEvent(sceneName: string, score: number){
        this.addDesignEventWithValue(sceneName + ":FinalScore", Math.round(score));
    }

    private addProgressionEvent(event: any, sceneName: string){
        if (this.analyticsDisabled()) return;

        OMGLogger.Debug("Adding gameanalytics progression event: " + event + ", scene name: " + sceneName);
        // gameanalytics.GameAnalytics.addProgressionEvent(event, sceneName);
    }

    public addDesignEvent(designEvent: string) { 
        if (this.analyticsDisabled()) return;

        OMGLogger.Debug("Adding gameanalytics design event: " + designEvent);
        // gameanalytics.GameAnalytics.addDesignEvent(designEvent);
    }

    public addDesignEventWithValue(designEvent: string, eventValue: any) { 
        if (this.analyticsDisabled()) return;

        OMGLogger.Debug("Adding gameanalytics design event: " + designEvent + " with value: " + eventValue);
        // gameanalytics.GameAnalytics.addDesignEvent(designEvent, eventValue);
    }

    private analyticsDisabled() {
        return !Config.AnalyticsEnabled;
    }
}