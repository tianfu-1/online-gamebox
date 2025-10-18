;(function(){
	var PLIBS_VERSION = "1.4";
/*********************************************
			Event To Fire
*********************************************/
	if(typeof(window.eventToFire) == "undefined"){
		var eventToFire = {};

		eventToFire.events = {};
		eventToFire.registerEvent = function(eventName, callback, staticArgs){
			if(typeof(eventName) != 'string') return false;
			if(typeof(callback) != 'function' && typeof(callback) != 'string') return false;
			if(typeof(this.events[eventName]) == 'undefined')	this.events[eventName] = [];
			this.events[eventName].push({"func":callback, "staticArgs":staticArgs});
			return true;
		}
		eventToFire.fireEvent = function(eventName){
			if(typeof(eventName) != 'string') return false;
			if(typeof(this.events[eventName]) == 'undefined') return false;
			for(var i =0; i < this.events[eventName].length;i++){
				var func = this.events[eventName][i]["func"];
				if(typeof func === "string") if(typeof window[func] === "function") func = window[func]; else continue;
				var args = [].slice.call(arguments, 1);
				args.push(this.events[eventName][i]["staticArgs"]);
				func.apply(this,args);
			}
			return true;
		}
		eventToFire.getAllEvent = function(){
			return this.events;
		}

		window.eventToFire = eventToFire;

		//compatibility playzool/shell
		function registerEvent(eventName, callback, args){
			window.eventToFire.registerEvent(eventName, callback, args);
		}
		function fireEvent(eventName,args){
			window.eventToFire.fireEvent(eventName,args);
		}
	}

/*********************************************
			Array wait For Function
*********************************************/
	/*********************************************
				var
	*********************************************/
	var arrayWaitForFunction = function(){};
	arrayWaitForFunction.version = "1.0.0";
	arrayWaitForFunction.prototype.array = [];
	arrayWaitForFunction.prototype.id = 0;
	/*********************************************
				function
	*********************************************/
	arrayWaitForFunction.prototype.update = function(dt){
		for (var i = 0; i < this.array.length; i++) {
			this.array[i].time -= dt;
		};
		this.checkArrayEndOfTime();
	};

	arrayWaitForFunction.prototype.waitForFunction = function(timeToWait,callback,param){
		//NaN is the only things not equal to itself in javascript
		param = (Number(param) !== Number(param))?param:Number(param);
		this.array.push({
			time:timeToWait,
			callback:callback,
			param:param,
			id:this.id
		});
		return this.id++;
	};

	arrayWaitForFunction.prototype.checkArrayEndOfTime = function(){
		var toDestroy;
		for (var i = this.array.length - 1; i >= 0; i--) {
			if(this.array[i].time <= 0){
				toDestroy = this.array.splice(i,1)[0];
				break;
			}
		};

		if(typeof(toDestroy) != 'undefined'){
			c2_callFunction(toDestroy.callback,[toDestroy.param]);
			this.checkArrayEndOfTime();
		}
	};

	arrayWaitForFunction.prototype.clearArrayWait = function(){
		this.array = [];
	};

	arrayWaitForFunction.prototype.stopWaitById = function(id){
		for (var i = 0; i < this.array.length; i++) {
			if(this.array[i].id == id){
				this.array.splice(i,1);
				break;
			}
		};
	};

	arrayWaitForFunction.prototype.startWaitNowById = function(id){
		var toDestroy;
		for (var i = 0; i < this.array.length; i++) {
			if(this.array[i].id == id){
				toDestroy = this.array.splice(i,1)[0];
				break;
			}
		};
		if(typeof(toDestroy) != 'undefined'){
			c2_callFunction(toDestroy.callback,[toDestroy.param]);
		}
	};

/*********************************************
			Non Finite State Machine
*********************************************/
	/*********************************************
				var
	*********************************************/
	var nfsm = function(){};
	nfsm.version = "1.0.0";
	nfsm.prototype.currentState = "default";
	nfsm.prototype.nextState;
	/*********************************************
				function
	*********************************************/
	nfsm.prototype.setCurrentState = function(currentState){
		this.currentState = ""+currentState;
	};

	nfsm.prototype.setNext = function(nextState){
		this.nextState = ""+nextState;
	};

	nfsm.prototype.next = function(state){
		if(state == undefined || state == ""){
			if(this.nextState == undefined || this.nextState == ""){
				console.error("no next state","next State is required");
				return;
			}
			state = this.nextState;	
		}
		state = "" + state;
		var beforeExitActualState = c2_callFunction("beforeExit_"+this.currentState,[this.currentState,state,{current:this.currentState,nextState:state}]);
		var beforeEnterNextState = c2_callFunction("beforeEnter_"+state,[this.currentState,state,{current:this.currentState,nextState:state,beforeExitResult:beforeExitActualState}]);
		if(beforeExitActualState == 0 && beforeEnterNextState == 0){
			c2_callFunction("onExit_"+this.currentState,[this.currentState,state,{current:this.currentState,nextState:state}]);
			var previousState = this.currentState;
			this.currentState = state;
			c2_callFunction("onEnter_"+this.currentState,[this.currentState,previousState,{current:this.currentState,previous:previousState}]);
		}else{
			c2_callFunction("onFailExit_"+this.currentState,[this.currentState,state,beforeExitActualState,beforeEnterNextState,{current:this.currentState,nextState:state,beforeExitActualState:beforeExitActualState,beforeEnterNextState:beforeEnterNextState}]);
			c2_callFunction("onFailEnter_"+state,[this.currentState,state,beforeExitActualState,beforeEnterNextState,{current:this.currentState,nextState:state,beforeExitActualState:beforeExitActualState,beforeEnterNextState:beforeEnterNextState}]);
		}
	};

/*********************************************
			Shell Time Notifier
*********************************************/
	/*********************************************
				var
	*********************************************/
	var timeNotifier = function(){};
	timeNotifier.saveKey = "timeNotifier";
	timeNotifier.version = "1.0.0";
	timeNotifier.prototype.state = {
		ACTIVE			: "active",
		PENDING			: "pending",
		UNACTIVE		: "unactive"
	};
	timeNotifier.prototype.arrayNotif = {};
	/*********************************************
				function
	*********************************************/
	timeNotifier.prototype.init = function() {
		this.load();
		this.checkNotif();
	};

	timeNotifier.prototype.load = function() {
		this.arrayNotif = JSON.parse(c2_callFunction("readCustomData",[timeNotifier.saveKey,"{}"]));
	};

	timeNotifier.prototype.save = function() {
		var count = 0;
		for(var i in this.arrayNotif){count++;break;}
		if(count == 0){return;}
		c2_callFunction("writeCustomData",[timeNotifier.saveKey,JSON.stringify(this.arrayNotif),""]);
	};

	timeNotifier.prototype.set = function(eventName, eventTime, eventMessage,notifyDevice) {
		if(!this.arrayNotif[eventName]){this.arrayNotif[eventName] = {count:0,lastAck:-1};}
		this.arrayNotif[eventName].state		= this.state.ACTIVE;
		this.arrayNotif[eventName].name			= eventName;
		this.arrayNotif[eventName].time			= eventTime;
		this.arrayNotif[eventName].message		= eventMessage;
		this.arrayNotif[eventName].timeStart	= Date.now();
		this.arrayNotif[eventName].timeEnd		= Date.now() + eventTime*1000;
		this.save();

		if(notifyDevice){
			window.eventToFire.fireEvent("timeNotifier_onSetNotification",this.arrayNotif[eventName]);
		}
	};

	timeNotifier.prototype.ack = function(eventName) {
		if(!this.arrayNotif[eventName]){return;}
		if(this.arrayNotif[eventName].state != this.state.PENDING){return;}
		this.arrayNotif[eventName].count ++;
		this.arrayNotif[eventName].state = this.state.UNACTIVE;
		this.arrayNotif[eventName].lastAck = Date.now();
		this.save();
	};

	timeNotifier.prototype.cancel = function(eventName) {
		if(!this.arrayNotif[eventName]){return -1;}
		this.arrayNotif[eventName].state = this.state.UNACTIVE;
		this.save();
	};

	timeNotifier.prototype.get = function(eventName,key) {
		if(!this.arrayNotif[eventName]){return -1;}
		return this.arrayNotif[eventName][key];
	};

	timeNotifier.prototype.getAll = function(eventName) {
		if(!this.arrayNotif[eventName]){return false;}
		return JSON.stringify(this.arrayNotif[eventName]);
	};

	timeNotifier.prototype.exist = function(eventName) {
		if(!this.arrayNotif[eventName]){return false}
		return true;
	};

	timeNotifier.prototype.checkNotifByName = function(eventName) {
		if(!this.arrayNotif[eventName]){return;}
		if(this.arrayNotif[eventName].state == this.state.UNACTIVE){return;}
		if(Date.now() < this.arrayNotif[eventName].timeEnd){ return;}
		
		this.arrayNotif[eventName].state = this.state.PENDING;
		c2_callFunction("timeNotifier_onNotification",[eventName,this.arrayNotif[eventName].eventMessage,JSON.stringify(this.arrayNotif[eventName])]);
		window.eventToFire.fireEvent("timeNotifier_onNotification",this.arrayNotif[eventName]);
		window.eventToFire.fireEvent("timeNotifier_"+eventName,this.arrayNotif[eventName]);

		this.save();
	};

	timeNotifier.prototype.checkNotif = function() {
		for(var i in this.arrayNotif){
			this.checkNotifByName(i);
		}
	};

	timeNotifier.prototype.getSecondBySpecificTime = function(hours,minutes,seconds) {
		var d = new Date();
		d.setHours(hours,minutes,seconds)
		if(d.getTime() - Date.now() < 0){
			d.setHours(hours+24)
		}
		return d.getTime();
	};
	
	timeNotifier.prototype.toHHMMSS = function(seconds){
		var sec_num = parseInt(seconds, 10);
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    return hours+':'+minutes+':'+seconds;
	}

/*********************************************
			Achievements
*********************************************/
	/*********************************************
				var
	*********************************************/
	var achievement = function(){};
	achievement.saveKey = "achievement";
	achievement.version = "1.0.2";
	achievement.state = {
		HIDDEN			: "HIDDEN",
		REVEALED		: "REVEALED",
		UNLOCKED		: "UNLOCKED"
	};
	achievement.type = {
		STANDARD		: "STANDARD",
		INCREMENTAL		: "INCREMENTAL"
	};
	achievement.prototype.arrayAchievement = {};
	/*********************************************
				function
	*********************************************/
	achievement.prototype.init = function() {
		this.load();

		var funcCallC2 = function(obj,stepsIncremented){
			c2_callFunction("achievement_onNotification",[
				obj.achievement_code,
				stepsIncremented,
				obj.currentStep,
				obj.achievement_steps,
				JSON.stringify(obj)
			]);
		};

		window.eventToFire.registerEvent("c2:achievement_unlock", funcCallC2);
		window.eventToFire.registerEvent("c2:achievement_increment", funcCallC2);
	};

	achievement.prototype.load = function() {
		this.arrayAchievement = JSON.parse(c2_callFunction("readCustomData",[achievement.saveKey,"{}"]));
	};

	achievement.prototype.save = function() {
		var count = 0;
		for(var i in this.arrayAchievement){count++;break;}
		if(count == 0){return;}
		c2_callFunction("writeCustomData",[achievement.saveKey,JSON.stringify(this.arrayAchievement),""]);
	};

	achievement.prototype.show = function() {
		window.eventToFire.fireEvent("c2:achievement_show");
	};

	achievement.prototype.register = function(achievement_code,achievement_step,achievement_obj) {
		window.eventToFire.fireEvent("c2:achievement_register", this.arrayAchievement[achievement_code]);
		if(this.arrayAchievement[achievement_code]){return;}
		var achievement_obj = (achievement_obj || {});
		if(typeof(achievement_obj) == "string"){ achievement_obj = JSON.parse(achievement_obj);}
		this.arrayAchievement[achievement_code] = new achievementObj().create(
			achievement_code, 
			achievement_step, 
			(achievement_obj["achievement_state"] || achievement.state.REVEALED), 
			(achievement_obj["achievement_type"] || ((achievement_step ==1)?achievement.type.STANDARD:achievement.type.INCREMENTAL))
		);
		this.save();
	};

	achievement.prototype.unlock = function(achievement_code) {
		if(!this.arrayAchievement[achievement_code]){return;}
		var acObj = this.arrayAchievement[achievement_code];
		if(acObj.achievement_type != achievement.type.STANDARD){return;}
		if(acObj.currentStep >= acObj.achievement_steps){return;}
		acObj.currentStep = acObj.achievement_steps;
		acObj.seen = false;
		acObj.achievement_state = achievement.state.UNLOCKED;
		this.save();
		window.eventToFire.fireEvent("c2:achievement_unlock", acObj,1);
	};

	achievement.prototype.increment = function(achievement_code,stepsToIncrement) {
		if(!this.arrayAchievement[achievement_code]){return;}
		var acObj = this.arrayAchievement[achievement_code];
		if(acObj.achievement_type != achievement.type.INCREMENTAL){return;}
		if(acObj.currentStep >= acObj.achievement_steps){return;}
		acObj.currentStep += stepsToIncrement;

		acObj.currentStep = Math.min(acObj.currentStep , acObj.achievement_steps);
		if(acObj.currentStep == acObj.achievement_steps){
			acObj.seen = false;
			acObj.achievement_state = achievement.state.UNLOCKED;
		}
		this.save();
		window.eventToFire.fireEvent("c2:achievement_increment", acObj,stepsToIncrement);
	};

	achievement.prototype.get = function(achievement_code,key) {
		if(typeof(achievement_code) != "undefined" && typeof(key) != "undefined"){
			if(typeof(this.arrayAchievement[achievement_code]) == "undefined"){return -1;}
			if(typeof(this.arrayAchievement[achievement_code][key]) == "undefined"){return -1;}
			return this.arrayAchievement[achievement_code][key];
		}else if(typeof(achievement_code) != "undefined"){
			if(typeof(this.arrayAchievement[achievement_code]) == "undefined"){return -1;}
			return JSON.stringify(this.arrayAchievement[achievement_code]);
		}else{
			return JSON.stringify(this.arrayAchievement);
		}
	};

	achievement.prototype.getUnSeen = function() {
		var ret = {};
		for(var i in this.arrayAchievement){
			if(!this.arrayAchievement[i].seen){
				ret[i] = this.arrayAchievement[i];
			}
		}
		return JSON.stringify(ret);
	};

	achievement.prototype.getUnSeenCount = function() {
		var count = 0;
		for(var i in this.arrayAchievement){
			if(!this.arrayAchievement[i].seen){
				count++;
			}
		}
		return count;
	};

	achievement.prototype.markAsSeenSpecific = function(achievement_code) {
		if(!this.arrayAchievement[achievement_code]){return;}
		this.arrayAchievement[achievement_code].seen = true;
		this.save();
		window.eventToFire.fireEvent("c2:achievement_markAsSeen", this.arrayAchievement[achievement_code]);
	};

	achievement.prototype.markAsSeen = function(achievement_code) {
		for(var i in this.arrayAchievement){
			this.markAsSeenSpecific(i);
		}
	};

	achievement.prototype.reveal = function(achievement_code) {
		if(!this.arrayAchievement[achievement_code]){return;}
		this.arrayAchievement[achievement_code].achievement_state = achievement.state.REVEALED;
		window.eventToFire.fireEvent("c2:achievement_reveal", this.arrayAchievement[achievement_code]);
	};

	/*********************************************
				achievementObj
	*********************************************/
		/*********************************************
				var
		*********************************************/
		var achievementObj = function(){};
		/*********************************************
					function
		*********************************************/
		achievementObj.prototype.create = function(code, step, state, type) {
			this.currentStep = 0;
			this.seen = true;
			this.achievement_code = code;
			this.achievement_type = type; //achievement.type
			this.achievement_steps = step; 
			this.achievement_state = state; //achievement.state
			return this;
		};

/*********************************************
				Playtouch object
*********************************************/
	if(typeof(window.playtouch) != "object"){ window.playtouch = {};}
	playtouch.arrayWaitForFunction = new arrayWaitForFunction();
	playtouch.nfsm = new nfsm();
	playtouch.timeNotifier = new timeNotifier();
	playtouch.achievement = new achievement();
	playtouch.PLIBS_VERSION = PLIBS_VERSION;
})();
