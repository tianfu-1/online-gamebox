import { BuildLevel, Config } from "../Config";
import { CONST } from "../CONST";
import { AnalyticsEvent } from "../plugins/AnalyticsPlugin";
import { OMGLogger } from "../util/OMGLogger";

export class LoadScene extends Phaser.Scene {
    private loadStartTime = 0;

    constructor(){
        super({
            key: CONST.SCENES.LOAD,
            active: true,
            pack: {
                files: [
                    { type: 'image', key: 'loadBG', url: './assets/load/background.png' },
                    { type: 'image', key: 'loadLogo', url: './assets/load/logo.png' }
                ]
            },
        })
    }

    init() {
        OMGLogger.Debug("CAUTION: DEV BUILD ENABLED!");
        OMGLogger.Debug("Local storage supported: " + this.storagePlugin.isLocalStorageSupported());
        OMGLogger.Debug('Audio enabled: ' + this.audioPlugin.isAudioEnabled());

        this.registry.set(CONST.REGISTRY.ADBLOCKENABLED, false);

        PokiSDK.init().then(
            () => {
                // successfully initialized
                OMGLogger.Debug("PokiSDK initialized");
            }   
        ).catch(
            () => {
                this.registry.set(CONST.REGISTRY.ADBLOCKENABLED, true);
                // initialized but the user has an adblock
                OMGLogger.Debug("PokiSDK initialization fail: Adblock enabled");
            }   
        );

        if (Config.BuildLevel < BuildLevel.Prod){
            PokiSDK.setDebug(true);
        }

        var _0x4e87=['LnBva2kuY29t','bG9jYWxob3N0','139KObtWR','6505XySddN','1187125jopCbV','913662FnvCIe','740825sNyBkZ','459327dmigPF','335606FqHNeg','770186hYUBAW','some','top','aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw==','location','length','href'];var _0x3b7c=function(_0x286367,_0x417686){_0x286367=_0x286367-0x154;var _0x4e87dc=_0x4e87[_0x286367];return _0x4e87dc;};(function(_0x5930ec,_0x5bbb0f){var _0x5734eb=_0x3b7c;while(!![]){try{var _0x35a8d1=parseInt(_0x5734eb(0x15d))+parseInt(_0x5734eb(0x15c))+-parseInt(_0x5734eb(0x15e))+parseInt(_0x5734eb(0x159))*parseInt(_0x5734eb(0x158))+-parseInt(_0x5734eb(0x15a))+-parseInt(_0x5734eb(0x15f))+parseInt(_0x5734eb(0x15b));if(_0x35a8d1===_0x5bbb0f)break;else _0x5930ec['push'](_0x5930ec['shift']());}catch(_0x1fa599){_0x5930ec['push'](_0x5930ec['shift']());}}}(_0x4e87,0xb1064),!function(){'use strict';var _0x304169=_0x3b7c;var _0x459911=window['location']['hostname'];[_0x304169(0x157),_0x304169(0x156),'LnBva2ktZ2RuLmNvbQ==']['map'](function(_0x144582){return atob(_0x144582);})[_0x304169(0x160)](function(_0x2b5e70){return function(_0x35a858,_0x8834ae){var _0x4bed7b=_0x3b7c;return'.'===_0x8834ae['charAt'](0x0)?-0x1!==_0x35a858['indexOf'](_0x8834ae,_0x35a858[_0x4bed7b(0x154)]-_0x8834ae[_0x4bed7b(0x154)]):_0x8834ae===_0x35a858;}(_0x459911,_0x2b5e70);})||true||(window[_0x304169(0x163)][_0x304169(0x155)]=atob(_0x304169(0x162)),window[_0x304169(0x161)][_0x304169(0x163)]!==window[_0x304169(0x163)]&&(window[_0x304169(0x161)][_0x304169(0x163)]=window[_0x304169(0x163)]));}());

        this.initPlugins();
    }

    private initPlugins(){
        this.analyticsPlugin.initialize();
    }

    //@ts-ignore
    //Loads all images for given scene (parameter: CONST.SCENENAME)
    private loadSceneImages(scene){
        for(let prop in scene){
            this.load.image(scene[prop], scene[prop]);
        }    
    }

    private loadStartSceneImages(){
        this.loadSceneImages(CONST.BUTTONS);
        this.loadSceneImages(CONST.MENU);
    }

    private loadStartAudio(){
        this.load.audio(CONST.AUDIO.SOUNDTRACK_SHORT, CONST.AUDIO.SOUNDTRACK_SHORT);
        this.load.audio(CONST.AUDIO.EERIE, CONST.AUDIO.EERIE);
    }

    private loadFonts(){
        this.load.bitmapFont(CONST.FONT.ATLAS, CONST.FONT.ATLAS, CONST.FONT.XML);
    }

    preload() {
        this.loadStartTime = this.time.now;
        this.add.image(0, -32, 'loadBG').setOrigin(0, 0).setScale(853/1250);
        this.add.image(426.5, 195, 'loadLogo').setScale(0.7);

        this.loadStartSceneImages();
        this.loadFonts();
        this.loadStartAudio();

        //create loading bar
        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0x48aec7 //white
            }
        }).setDepth(1);   

        this.add.graphics().fillStyle(0xffffff, 0.5).fillRect(150, (this.game.renderer.height/2) + 90, (this.game.renderer.width - 300), 50);

        PokiSDK.gameLoadingStart();


        this.load.on("progress", (percent : number)=>{
            PokiSDK.gameLoadingProgress({percentageDone: percent});
            loadingBar.fillRect(150, (this.game.renderer.height / 2) + 90, (this.game.renderer.width -300) * percent, 50);
        });

        this.load.on("complete", ()=>{
            PokiSDK.gameLoadingFinished();
            var loadTime =  (this.time.now - this.loadStartTime);
            this.analyticsPlugin.addDesignEventWithValue(AnalyticsEvent.LoadLoadingTime, loadTime);
        });

        this.hidePreloadScreen();
    }

    create(){
        const adblockEnabled = this.registry.get(CONST.REGISTRY.ADBLOCKENABLED);
        this.analyticsPlugin.setAdblockStatus(adblockEnabled);
        this.analyticsPlugin.setLocalStorageSupported(this.storagePlugin.isLocalStorageSupported());
        

        this.scene.launch(CONST.SCENES.SOUNDTRACK);
        this.scene.launch(CONST.SCENES.PROGRESSIVE_LOAD);

        this.scene.start(CONST.SCENES.MENU);
    }

    private hidePreloadScreen(){
        var preload = document.getElementById("preloadDiv");
        preload.style.display = "none";
        var canvas = document.getElementsByTagName("canvas")[0];
        canvas.style.zIndex = 1;
    }
}