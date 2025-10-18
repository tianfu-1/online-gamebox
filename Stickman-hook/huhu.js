window.HUHU_success = null;
window.HUHU_failure = null;
window.HUHU_BEFOR_AD = null;
window.HUHU_AFTER_AD = null;
window.HUHU_CLOSE_INTERSTITIAL = null;
var _preMuted = false;
var _messageOrgin = window.location.origin||"bjchenchuanggame.com";
window.CY_SDK = {
    delayShowFloatTimer:-1,
    levelBegin : (level)=>{
        window.HUHU_gaSend('level_begin',level)
    },
    levelEnd : (success)=>{
        window.HUHU_gaSend('level_end',success?"Pass":"Fail")
    },
    levelReward : (flag)=>{
        window.HUHU_gaSend('level_reward',flag?1:0)
    },
    levelNext :(clickStr)=>{
        window.HUHU_gaSend('level_next',clickStr)
    },
    rewardClick :(clickStr)=>{
        window.HUHU_gaSend('reward_click',clickStr)
    },
    gameLoadingCompleted:()=>{
        try {
            window.parent.postMessage("gameLoadingCompleted", _messageOrgin);
        } catch (e) {
        }
    },
    showFloat:(param = {top:"",left:"",bottom:"",right:"",delay:0})=>{
        let delay = param.delay || 0;
        clearTimeout(window.CY_SDK.delayShowFloatTimer);
        if (delay > 0)
        {
            window.CY_SDK.delayShowFloatTimer = setTimeout(()=>{
                window.HUHU_showFloat(param);
            },delay)
        }
        else {
            window.HUHU_showFloat(param);
        }
    },
    hideFloat :()=>{
        clearTimeout(window.CY_SDK.delayShowFloatTimer);
        window.HUHU_hideFloat();
    }
}
window.HUHU_showInterstitialAd = (beforeAd, afterAd, closeInterstitial) => {
    console.log("HUHU_showInterstitialAd:");
    if (typeof (beforeAd) == "function") {
        HUHU_BEFOR_AD = beforeAd;
    }
    if (typeof (afterAd) == "function") {
        HUHU_AFTER_AD = afterAd;
    }
    if (typeof (closeInterstitial) == "function") {
        HUHU_CLOSE_INTERSTITIAL = closeInterstitial;
    }
    try {
        setTimeout(()=>{
            window.parent.postMessage("showInterstitial", _messageOrgin);
        },50)
    } catch (e) {
    }
};
window.HUHU_showFloat = (param = {top:"",left:"",bottom:"",right:""}) =>{
    try {
        if (param.top == null)
        {
            param.top = "";
        }
        if (param.left == null)
        {
            param.left = "";
        }
        if (param.bottom == null)
        {
            param.bottom = "";
        }
        if (param.right == null)
        {
            param.right = "";
        }
        let params = param.top +"_" + param.left + "_" + param.bottom + "_" + param.right;
        window.parent.postMessage("showFloat|" + params, _messageOrgin);
    } catch (e) {
    }
}
window.HUHU_hideFloat= () =>{
    try {
        window.parent.postMessage("hideFloat", _messageOrgin);
    } catch (e) {
    }
}
window.HUHU_gaSend = (actionName,param) =>{
    try {
        let params = "";
        if (actionName)
        {
            params = actionName
        }
        if (param)
        {
            params = params + "_" + param;
        }
        window.parent.postMessage("gaSend|" + params, _messageOrgin);
    } catch (e) {
    }
}
window.HUHU_showRewardedVideoAd = (success, failure) => {
    console.log("HUHU_showRewardedVideoAd:");
    if (typeof (success) == "function") {
        HUHU_success = success;
    }
    if (typeof (failure) == "function") {
        HUHU_failure = failure;
    }
    try {
        window.parent.postMessage("showReward", _messageOrgin);
    } catch (e) {
    }
};
window.HUHU_prompt = function(msg, duration) {
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
window.onmessage = function (e) {
    e = e || event;
    let tempData = e.data + "";
    console.log("onmessage","play",tempData);
    if (tempData == "closeInterstitial") {
        try
        {
            window.focus();
            if (typeof (window.HUHU_CLOSE_INTERSTITIAL) == "function") {
                window.HUHU_CLOSE_INTERSTITIAL();
                window.HUHU_CLOSE_INTERSTITIAL = null;
            }
        } catch (e) {

        }
    } else if (tempData == "beforeShowAd") {
        try
        {
            if (typeof (window.HUHU_BEFOR_AD) == "function") {
                window.HUHU_BEFOR_AD();
                window.HUHU_BEFOR_AD = null;
            }
            huhu_pause_game();
            window.blur();
        } catch (e) {

        }
    } else if (tempData == "afterShowAd") {
        try
        {
            window.focus();
            huhu_resume_game();
            if (typeof (window.HUHU_AFTER_AD) == "function") {
                window.HUHU_AFTER_AD();
                window.HUHU_AFTER_AD = null;
            }
        } catch (e) {

        }
    } else if (tempData == "close") {
        if (typeof (window.HUHU_success) == "function") {
            window.HUHU_success();
            window.HUHU_success = null;
            window.HUHU_failure = null;
        }
    } else if (tempData == "fail") {
        if (typeof (window.HUHU_failure) == "function") {
            window.HUHU_failure();
            window.HUHU_success = null;
            window.HUHU_failure = null;
        }
    }
}
function huhu_pause_game() {
    if (typeof (window.Laya) == "undefined")
    {
        if (typeof (window.GD_OPTIONS) != "undefined" && typeof (window.GD_OPTIONS.onEvent) != "undefined")
        {
            window.GD_OPTIONS.onEvent({name:"SDK_GAME_PAUSE"});
        }
        return;
    }
    _preMuted = Laya.SoundManager.muted;
    Laya.SoundManager.muted = true;
    Laya.stage.renderingEnabled=false;
    Laya.timer.pause();
    Laya.timer.scale=0;
}

function huhu_resume_game() {
    if (typeof (window.Laya) == "undefined")
    {
        if (typeof (window.GD_OPTIONS) != "undefined" && typeof (window.GD_OPTIONS.onEvent) != "undefined")
        {
            window.GD_OPTIONS.onEvent({name:"SDK_GAME_START"});
        }
        return;
    }
	Laya.SoundManager.muted = _preMuted;
    Laya.stage.renderingEnabled = true;
    Laya.timer.resume();
    Laya.timer.scale=1;
}