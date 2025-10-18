var uptap; !
function(n) 
{
	
	function getQueryVariable(variable)
	{
		
		var url='';
		try { 
			url = window.top.location.href ; 
		} catch(M) { 
			if (window.parent) { 
			  try { 
				url = window.parent.location.href;
			  } catch(L) { 
				url = "";
			  } 
			} 
		}
		try{
			if (url === "") { 
				url = document.location.href;
			}
			var query = url.substring(url.indexOf('?')+1);
			var vars = query.split("&");
			for (var i=0;i<vars.length;i++) {
			   var pair = vars[i].split("=");
			   if(pair[0] == variable){return pair[1];}
			}
		}catch(e){}
	   return "";
	}
	/************************************** Vconsole ***************************************/
	initVconsole = function()
	{
		window.vConsole = new window.VConsole({
		  onReady: function() {
			console.log('vConsole is ready.');
		  },
		  onClearLog: function() {
			console.log('on clearLog');
		  }
		});
	}
	var debug = getQueryVariable("debug");
	if(debug == 1)
	{
		var script1 = document.createElement('script');
		script1.type = 'text/javascript';
		script1.src = '//cdn.iwantalipstick.com/api/vconsole.min.js';
		document.head.appendChild(script1);
		if(script1.readyState)
		{
			if( script1.readyState == 'loaded' || script1.readyState == 'compvare' )
			{
				script1.onreadystatechange = null;
				initVconsole();
			}
		}
		else
		{
			script1.onload = function()
			{
				initVconsole();
			}
		}
	}
	/************************************** Vconsole ***************************************/

    var d = null,
    i = null,
    t = null,
    a = null,
    w = null,
	z = null,
    ouligei = !1;
    function e() 
	{
        if (!ouligei) {
            function n(n) 
			{
                var o = n.data;
                if (o) 
				{
                    var e = o.cmd;
                   // "Login_out" === e ? d && d(o.data) : "ShowVideoAdv_out" === e ? i && i(o.data) : "ShowTitleAdv_out" === e ? t && t(o.data) : "ShowExcitationVideoAdv_out" === e ? a && a(o.data) : "ShowScreenVideo_out" === e && w && w(o.data)
					switch (e) 
					{
						case "Login_out":
							d && d(o.data)
							break;
						case "ShowVideoAdv_out":
							i && i(o.data)
							break;
						case "ShowTitleAdv_out":
							t && t(o.data)
							break;
						case "ShowExcitationVideoAdv_out":
							a && a(o.data)
							break;
						case "ShowScreenVideo_out"://插屏
							w && w(o.data)
							break;
						case "UpdataScore_out":
							z && z(o.data)
							break;
					}
				
                }
            }
            void 0 !== window.addEventListener ? window.addEventListener("message", n, !1) : void 0 !== window.attachEvent && window.attachEvent("message", n),
            ouligei = !0
        }
    }
	e()
    n.Register = e,
    n.Login = function(n) {
        d = n,
        window.parent.postMessage({
            cmd: "Login"
        },
        "*")
    },
    n.HideLoading = function() {
        window.parent.postMessage({
            cmd: "HideLoading"
        },
        "*")
    },
    n.Share = function() {
        window.parent.postMessage({
            cmd: "Share"
        },
        "*")
    },
    n.ShowVideoAdv = function(n) {
        i = n,
        window.parent.postMessage({
            cmd: "ShowVideoAdv"
        },
        "*")
    },
    n.ShowBannerAdv = function(n) {
        var o = {
            cmd: "ShowBannerAdv",
            bannerAdvSize: n
        };
        window.parent.postMessage(o, "*")
    },
    n.HideBannerAdv = function() {
        window.parent.postMessage({
            cmd: "HideBannerAdv"
        },
        "*")
    },
    n.ShowTitleAdv = function(n) {
        t = n,
        window.parent.postMessage({
            cmd: "ShowTitleAdv"
        },
        "*")
    },
    n.ShowExcitationVideoAdv = function(n) {
		//this.vibrateShort();
        a = n;
		window.parent.postMessage({cmd: "ShowExcitationVideoAdv"},"*")  
    },
    n.ShowScreenVideo = function(n, o) {
		//this.vibrateLong();
        w = o;
        var e = {
            cmd: "ShowScreenVideo",
            nodeName: n
        };
		window.parent.postMessage(e, "*")
    },
    n.UpdataScore = function(n, o) {
        z = o;
        var e = {
            cmd: "UpdataScore",
            score: n
        };
        window.parent.postMessage(e, "*")
    },
	
	n.GameEvent = function(n, p1,p2) {
        //z = o;
        var e = {
            cmd: "GameEvent",
            eventName: n,
			eventNum:0,
			param1:p1,
			param2:p2
        };
        window.parent.postMessage(e, "*")
    },
	//长震动
	n.VibrateShort = function(){
		var e = {
            cmd: "Vibrate",
			type:"short",
            times: 30
        }
		window.parent.postMessage(e, "*")
	},
	//短震动
	n.VibrateLong = function(){
		var e = {
            cmd: "Vibrate",
			type:"long",
            nodeName: 400
        }
		window.parent.postMessage(e, "*")
	},
	//长震动
	n.vibrateShort = function(){
		navigator.vibrate && navigator.vibrate(30);
	},
	//短震动
	n.vibrateLong = function(){
		navigator.vibrate && navigator.vibrate(400);
	},
	n.StartPreLoading = function(){
		var e = {
            cmd: "StartPreLoading",
            appid: ""
        };
		window.parent.postMessage(e, "*")
	},
	n.SetLoadingProgress = function(pro){
		var e = {
            cmd: "SetLoadingProgress",
            pro: pro
        };
		window.parent.postMessage(e, "*")
	},
	n.LoadingComplete = function(){
		var e = {
            cmd: "LoadingComplete",
            appid: ""
        };
		window.parent.postMessage(e, "*")
	},
	n.UpdataProgress = function(pro){
		var e = {
            cmd: "UpdataProgress",
			pro:Math.floor(pro)
        };
		window.parent.postMessage(e, "*")
		console.log("p:" + e.pro);
	}
	
} (uptap = uptap || {});

try{
	if(parent.location.host == "www.tondae.net")
	{
		window.addEventListener("orientationchange", function() {
		if(window.orientation === 90){
		   console.log('这是竖屏')
		}
		if(window.orientation === 0){
		   console.log('这是横屏')
		}
			parent.location.replace(parent.location.href);
		}, false);
	}
}catch(e){}