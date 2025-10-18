var _banner_height = (typeof(_bannerHeight) == "undefined" ?50:_bannerHeight) + 10;
var _footer_ad_html = '<ins class="adsbygoogle"' +
    ' style="display:inline-block;width:100%;height:' +
    (typeof(_bannerHeight) == "undefined" ?50:_bannerHeight) + 'px"' +
    ' data-ad-client="' + GadAFC + '"' +
    ' data-ad-slot="' + GadSlot + '"></ins>';
var game_frame = document.getElementById('game_frame');
game_frame.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
var gameframediv = document.getElementById('gameframediv');
gameframediv.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
var _isAdReady = false;
var _force_loadgame_done = false;
var _locationHref = window.location.href;
var _language = (navigator.browserLanguage || navigator.language).toLowerCase();
var _hasNetWork = window.navigator.onLine;
var _messageOrgin = window.location.origin||"bjchenchuanggame.com";
window.onmessage = function (e) {
    e = e || event;
    if (e.origin != _messageOrgin)
    {
        console.warn("过滤掉消息（来自：" + e.origin + "）");
        return;
    }
    let tempData = e.data + "";
    let argArr = tempData.split('|')
    let cmd = argArr[0]
    let param = argArr.length > 1 ? argArr[1]:"";
    console.log("parent onmessage",cmd,param);
    if (cmd == "showInterstitial") {
        if (!_hasNetWork)
        {
            document.getElementById("game_frame").contentWindow.postMessage("closeInterstitial", _messageOrgin);
            return;
        }
        try {
            AdBreakManager.getInstance().showInterstitial(
                {
                    beforeShowAd: () => {
                        document.getElementById("game_frame").contentWindow.postMessage("beforeShowAd", _messageOrgin);
                    }, afterShowAd: () => {
                        document.getElementById("game_frame").contentWindow.postMessage("afterShowAd", _messageOrgin);
                    },
                    closeInterstitial: () => {
                        document.getElementById("game_frame").contentWindow.postMessage("closeInterstitial", _messageOrgin);
                    },
                    typeName: param
                });
        } catch (error) {
            console.log(error);
        }
    } else if (cmd == "showReward") {
        if (!_hasNetWork)
        {
            document.getElementById("game_frame").contentWindow.postMessage("fail", _messageOrgin);
            promptMessage("No ads, Pls try again later");
            return;
        }
        if (!AdBreakManager.getInstance().canShowReward()) {
            document.getElementById("game_frame").contentWindow.postMessage("fail", _messageOrgin);
            promptMessage("No ads, Pls try again later");
            return;
        }
        AdBreakManager.getInstance().showReward({
            beforeShowAd: () => {
                document.getElementById("game_frame").contentWindow.postMessage("beforeShowAd", _messageOrgin);
            }, afterShowAd: () => {
                document.getElementById("game_frame").contentWindow.postMessage("afterShowAd", _messageOrgin);
            }, rewardComplete: () => {
                document.getElementById("game_frame").contentWindow.postMessage("close", _messageOrgin);
            }, rewardDismissed: () => {
                document.getElementById("game_frame").contentWindow.postMessage("fail", _messageOrgin);
            }
        });
    }
    else if (cmd == "gameLoadingCompleted")
    {
        console.log(666,'gameLoadingCompleted');
        window.h5sdk&&window.h5sdk.gameLoadingCompleted()
    }
    else if (cmd == "showPreroll")
    {
        console.log(666,'showLoadAd showPreroll');

    }
    else if (cmd == "onReady")
    {
        console.log(666,'startup onReady');
    }
    else if (cmd == "showFloat") {
        if (!_hasNetWork)
        {
            return;
        }
        try
        {
            let params = param.split('_');
            let left = null;
            let top = null;
            let right = null;
            let bottom = null;
            if (params.length >= 4) {
                if (params[0] != "") {
                    top = params[0];
                }
                if (params[1] != "") {
                    left = params[1];
                }
                if (params[2] != "") {
                    bottom = params[2];
                }
                if (params[3] != "") {
                    right = params[3];
                }
            }
            window.h5sdk.show(top, left, bottom, right);
        }
        catch (error) {
            console.log(error);
        }
    }
    else if (cmd == "hideFloat") {
        if (!_hasNetWork)
        {
            return;
        }
        window.h5sdk.hide();
    }
    else if (cmd == "gaSend") {
        if (!_hasNetWork)
        {
            return;
        }
        try
        {
            let params = param.split('_');
            if (params.length == 1)
            {
                __gaSend(params[0])
            }
            else if (params.length >= 2)
            {
                __gaSend(params[0],params[1])
            }
            if (param.indexOf("level_end") >= 0)
            {
                if (typeof(window.Aha_App) == 'undefined' && _language.indexOf('zh') <= -1)
                {
                    // cy_Home();
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    else if (cmd == "showMore")
    {

    }
}

function showRotateScreen() {
    let screenOrientation = ($(window).width() > $(window).height()) ? "horizontal" : "portrait";
    if (screenOrientation === "portrait") {
        document.getElementById("rotate").style.display = "block";
        __gaSend("turn_screen");
    } else {
        document.getElementById("rotate").style.display = "none";
        document.getElementById("game_frame").contentWindow.postMessage("afterShowAd", _messageOrgin);
        __gaSend("horizontal");
    }
}

function promptMessage(msg, duration) {
    if (!this.prompt_) {
        this.prompt_ = document.createElement('div');
        this.prompt_.style.cssText = "font-family:siyuan;max-width:80%;min-width:320px;padding:10px 10px 10px 10px;min-height:40px;color: rgb(255, 255, 255);line-height: 20px;text-align:center;border-radius: 4px;position: fixed;top: 40%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: rgba(0, 0, 0,.7);font-size: 16px;";
        document.body.appendChild(this.prompt_);
    }
    this.prompt_.innerHTML = msg;
    duration = isNaN(duration) ? 2000 : duration;
    this.prompt_.style.display = "inline";
    this.prompt_.style.opacity = '1';
    setTimeout(function () {
        var d = 0.5;
        this.prompt_.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        this.prompt_.style.opacity = '0';
        this.prompt_.style.display = "none";
    }.bind(this), duration);
}
$(document).ready(function () {
    document.title = gameTitle.replace(/_/, " ");
    $(window).trigger('resize');
    force_load_game();
});
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {} else {
        try {
            window.postMessage("showInterstitial|browse", _messageOrgin);
        } catch (e) {}
    }
})
function force_load_game() {
    if (_force_loadgame_done == false) {
        _load_game();
        _force_loadgame_done = true;
    }
}
function _load_game() {
    if (_force_loadgame_done) {
        return;
    }
    _force_loadgame_done = true;
    if (_hasNetWork)
    {
        AdBreakManager.getInstance().startup();
    }
    document.getElementById("game_frame").contentWindow.postMessage("afterShowAd", _messageOrgin);
    let game_frame = document.getElementById('game_frame');
    game_frame.src = 'play.html';
    _isAdReady = true;
    if (typeof _force_horizontal !== 'undefined' && _force_horizontal) {
        showRotateScreen();
    }
    // setTimeout(()=>{
    //     if (typeof(window.Aha_App) == 'undefined' && _language.indexOf('zh') <= -1)
    //     {
    //         // cy_Home();
    //     }
    // },20000);
}
function _getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function __gaSend(myActionName,param) {
    try
    {
        window.h5sdk.athenaSend(myActionName,param)
    }catch (e)
    {
        console.log(e);
    }
}
function _append_footer_ad() {
	console.log(6666,'_append_footer_ad');
    $("#afc_banner_foot").html(_footer_ad_html);
    $("#afc_banner_foot").append('<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>');
}
$(window).resize(function () {
    if (_isAdReady)
    {
        if (typeof _force_horizontal !== 'undefined' && _force_horizontal) {
            showRotateScreen();
        }
    }
    if (_is_show_banner) {
        $("#gameframediv").height($(window).height() - _banner_height);
    } else {
        $("#gameframediv").height($(window).height());
    }
});
class AdBreakManager {
    constructor() {
        this.showInterstitialCount = 0;
        this.INTERSTITIAL_INTERVAL = 45;
        this.rewardOptions = null;
        this.isReady = !1;
        this._hasShowLoad = false;
        if (typeof _interstitial_intervel !== 'undefined') {
            this.INTERSTITIAL_INTERVAL = _interstitial_intervel;
        }
        this.interstitialCooldown = 0;
        this.showAdFn = null;
        this.preloadRewardTimeout = -1;
        this._firstDelayLoadReward = true;
    }

    static getInstance() {
        if (!this._gInstance) {
            this._gInstance = new AdBreakManager();
        }
        return this._gInstance;
    }
    startup() {
        console.log(666,'startup',this.isReady);
        if (this.isReady)
        {
            return
        }
        this.isReady = true;
        console.log(666,'startup true');
        this.checkRewardInterval = setInterval(this.onUpdate.bind(this), 1e3);
        this.preLoadReward();
    }
    showLoadAd(callback) {
        console.log("requesting showLoadAd AD",this._hasShowLoad);
        if (this._hasShowLoad)
        {
            callback && callback();
            return;
        }
        this._hasShowLoad = true;
        console.log("requesting showLoadAd AD",6666);
        let _that = this;
        if (typeof (window.h5sdk.adBreak) !== 'undefined')
        {
            window.h5sdk.adBreak({
                type: 'preroll',
                name: 'new_page',
                adBreakDone: (placementInfo) => {
                    //开屏没展示则可以直接插屏间隔不重置
                    if (placementInfo.breakStatus =='viewed')
                    {
                        _that.interstitialCooldown = _that.INTERSTITIAL_INTERVAL;
                    }
                    console.log("window.h5sdk.adBreak adBreakDone ... breakStatus=" + placementInfo.breakStatus,_that.interstitialCooldown);
                    if (typeof (callback) == "function" && callback) {
                        callback();
                    }
                }
            });
        }
        else
        {
            console.log("requesting showLoadAd AD window.h5sdk == null");
            if(typeof (adBreak) == 'undefined')
            {
                console.log("adBreak undefined");
                if (typeof (callback) == "function" && callback) {
                    callback();
                }
                return;
            }
            adBreak({
                type: 'preroll',
                name: 'new_page',
                adBreakDone: (placementInfo) => {
                    //开屏没展示则可以直接插屏间隔不重置
                    if (placementInfo.breakStatus =='viewed')
                    {
                        _that.interstitialCooldown = _that.INTERSTITIAL_INTERVAL;
                    }
                    console.log("adBreak adBreakDone ... breakStatus=" + placementInfo.breakStatus,_that.interstitialCooldown);
                    if (typeof (callback) == "function" && callback) {
                        callback();
                    }
                }
            });
        }

    }
    onUpdate() {
        this.interstitialCooldown >= 0 && this.interstitialCooldown--;
    }
    showInterstitial(options) {
        if (this.interstitialCooldown > 0)
        {
            console.log("showInterstitial ，less than "+this.INTERSTITIAL_INTERVAL + "s, ignored :", this.interstitialCooldown);
            if (options && options.closeInterstitial){
                options.closeInterstitial();
            }
            return;
        }
        this.showInterstitialCount ++;
        this.interstitialCooldown = this.INTERSTITIAL_INTERVAL;
        let typename = "next";
        if (this.showInterstitialCount == 1)
        {
            typename = "start";
        }
        typename = typeof (options.typeName) != "undefined" ? (options.typeName == "" ? typename : options.typeName) : typename
        if (typeof ( window.h5sdk.adBreak) == 'undefined')
        {
            console.log("showInterstitial window.h5sdk.adBreak == null ");
            if (options && options.closeInterstitial){
                options.closeInterstitial();
            }
            return;
        }
		console.log("requesting Interstitial AD",typename);
        window.h5sdk.adBreak({
            type: typename,
            name: "game",
            beforeAd: () => {
                if (options && options.beforeShowAd) {
                    options.beforeShowAd();
                    options.beforeShowAd = null;
                }
                window.blur();
            },
            afterAd: () => {
                window.focus()
                if (options && options.afterShowAd) {
                    options.afterShowAd();
                    options.afterShowAd = null;
                }
            },
            adBreakDone: (placementInfo) => {
                console.log("showInterstitial done ", placementInfo);
                if (options && options.closeInterstitial)
                {
                    options.closeInterstitial();
                }
                // if (_is_show_banner) {
                //     _append_footer_ad();
                // }
            }
        });
    }

    canShowReward() {
        return true;
    }

    showReward(options) {
        this.rewardOptions = options;
        clearTimeout(this.preloadRewardTimeout);
        this.preloadRewardTimeout = -1;
        if (this.showAdFn != null)
        {
            this.showAdFn();
            console.log("showReward preLoadReward");
            return;
        }
        console.log("showReward true");
        if (typeof (window.h5sdk.adBreak) == "undefined")
        {
            if(typeof (adBreak) == 'undefined')
            {
                console.log("adBreak undefined");
                this.onRewardDismissed();
                return;
            }
            adBreak({
                type: "reward",
                name: "reward",
                beforeAd: this.onRewardBeforeBreak.bind(this),
                afterAd: this.onRewardAfterBreak.bind(this),
                beforeReward: this.onBeforeReward.bind(this),
                adDismissed: this.onRewardDismissed.bind(this),
                adViewed: this.onRewardComplete.bind(this),
                adBreakDone: (placementInfo) => {
                    console.log("showReward adBreakDone",placementInfo);
                    if (placementInfo && (placementInfo.breakStatus !='dismissed' && placementInfo.breakStatus !='viewed'))
                    {
                        promptMessage("No ads, Pls try again later");
                        this.onRewardDismissed();
                    }
                }
            });
        }
        else
        {

            window.h5sdk.adBreak({
                type: "reward",
                name: "reward",
                beforeAd: this.onRewardBeforeBreak.bind(this),
                afterAd: this.onRewardAfterBreak.bind(this),
                beforeReward: this.onBeforeReward.bind(this),
                adDismissed: this.onRewardDismissed.bind(this),
                adViewed: this.onRewardComplete.bind(this),
                adBreakDone: (placementInfo) => {
                    console.log("showReward adBreakDone",placementInfo);
                    if (placementInfo && (placementInfo.breakStatus !='dismissed' && placementInfo.breakStatus !='viewed'))
                    {
                        promptMessage("No ads, Pls try again later");
                        this.onRewardDismissed();
                    }
                }
            });
        }
        return true;
    }
    preLoadReward() {
        if (this.showAdFn != null)
        {
            console.log("preLoadReward exists");
            return;
        }
        let _that = this;
        if (typeof (window.h5sdk.adBreak) == "undefined")
        {
            if(typeof (adBreak) == 'undefined')
            {
                return;
            }
            adBreak({
                type: "reward",
                name: "reward",
                beforeAd: this.onRewardBeforeBreak.bind(this),
                afterAd: this.onRewardAfterBreak.bind(this),
                beforeReward:(showAdFn)=>{
                    console.log(666,"preLoadReward beforeReward success");
                    this.showAdFn = showAdFn;
                },
                adDismissed: this.onRewardDismissed.bind(this),
                adViewed: this.onRewardComplete.bind(this),
                adBreakDone: (placementInfo) => {
                    console.log("preLoadReward adBreakDone",placementInfo);
                    if (placementInfo.breakStatus =='notReady')
                    {
                        if (_that._firstDelayLoadReward)
                        {
                            _that._firstDelayLoadReward = false;
                            _that.preloadRewardTimeout = setTimeout(()=>{
                                _that.preLoadReward();
                            },3000)
                        }
                    }

                }
            });
        }
        else
        {

            window.h5sdk.adBreak({
                type: "reward",
                name: "reward",
                beforeAd: this.onRewardBeforeBreak.bind(this),
                afterAd: this.onRewardAfterBreak.bind(this),
                beforeReward:(showAdFn)=>{
                    console.log(666,"preLoadReward beforeReward success");
                    this.showAdFn = showAdFn;
                },
                adDismissed: this.onRewardDismissed.bind(this),
                adViewed: this.onRewardComplete.bind(this),
                adBreakDone: (placementInfo) => {
                    console.log("preLoadReward adBreakDone",placementInfo);
                    if (placementInfo.breakStatus =='notReady')
                    {
                        if (_that._firstDelayLoadReward)
                        {
                            _that._firstDelayLoadReward = false;
                            _that.preloadRewardTimeout = setTimeout(()=>{
                                _that.preLoadReward();
                            },3000)
                        }
                    }
                }
            });
        }
    }

    onBeforeReward(showAdFn) {
        console.log("load Reward AD Successful");
        showAdFn();
    }

    onRewardBeforeBreak() {
        if (this.rewardOptions)
        {
            this.rewardOptions.beforeShowAd && this.rewardOptions.beforeShowAd();
            this.rewardOptions.beforeShowAd = null;
        }
    }

    onRewardAfterBreak() {
        this.interstitialCooldown = this.interstitialCooldown + 2;
        if (this.rewardOptions)
        {
            this.rewardOptions.afterShowAd && this.rewardOptions.afterShowAd();
            this.rewardOptions.afterShowAd = null;
        }
        this.showAdFn = null;
        let _that = this;
        // this.preloadRewardTimeout = setTimeout(()=>{
        //     _that.preLoadReward();
        // },5000)
    }

    onRewardDismissed() {
        if (this.rewardOptions)
        {
            this.rewardOptions.rewardDismissed && this.rewardOptions.rewardDismissed();
            this.rewardOptions.rewardDismissed = null;
        }
    }

    onRewardComplete() {
        if (this.rewardOptions)
        {
            this.rewardOptions.rewardComplete && this.rewardOptions.rewardComplete();
            this.rewardOptions.rewardComplete = null;
        }
    }
}
window["AdBreakManager"] = AdBreakManager;