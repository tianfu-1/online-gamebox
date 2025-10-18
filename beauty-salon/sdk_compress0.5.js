geshihua_url = function (s) {
	var hrefa = document.location.href.replace("index.html", "");
	if (s.indexOf(hrefa) != -1) {
		s = s.substr(hrefa.length);
	}
	if (s.indexOf("./") == 0) {
		s = s.substr(2);
	}
	if (s.indexOf("?") != -1) {
		s = s.substr(0, s.indexOf("?"))
	}
	return s;
}
var conNum = 0;
function next(zip) {
	if (conNum >= list.length) {
		try {
			if (typeof beginGame === "function") {
				beginGame()
			} else { }
		} catch (e) { }
		return
	}
	zip.file(list[conNum]).async("string").then(function (text) {
		addScript(text);
		conNum++;
		next(zip)
	})
}
function addScript(text) {
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.text = text;
	document.body.appendChild(script);
}


(function () {
	function myXMLHttpRequest() {
		this.url_t = "";
		this.type_t = null;
		this.uptap_event = document.createElement("div");
		this.uptap_event.setAttribute("id", "eventdiv" + + Math.random() + "_" + + Math.random());
		//document.body.appendChild(this.uptap_event);
	}
	myXMLHttpRequest.prototype.open = function (type, url, bool) {
		this.url_t = url;
		this.type_t = type;
	}
	myXMLHttpRequest.prototype.addEventListener = function (event, back) {
		return this.uptap_event.addEventListener(event, back);
	}
	myXMLHttpRequest.prototype.setRequestHeader = function (event, back) {
	}
	myXMLHttpRequest.prototype.send = function (t) {
		//console.log("------url--------->" + this.url_t)
		this.url_t = geshihua_url(this.url_t);
		var o = this.url_t.substr(this.url_t.lastIndexOf("."));
		if (/*".lm" == o || ".lani" == o ||*/ ".png" == o || ".jpg" == o) {
			try {
				window.zipData.files[this.url_t].async("uint8array").then((t) => {
					//	console.log("-------->" + this.url_t);
					var e, s;
					if (".png" === o) {
						e = new Blob([t], {
							type: "image/png"
						});
					}
					else if (".jpg" === o) {
						e = new Blob([t], {
							type: "image/jpg"
						});
					}
					(s = new FileReader).readAsDataURL(e);
					s.onload = (t) => {
						this._state = "loaded";
						this.state = "loaded";
						this.status = 200;
						this.readyState = 4;
						this.response = t.target.result;
						this.responseText = t.target.result;
						var ev = document.createEvent('HTMLEvents');
						ev.initEvent('load', false, true);
						this.uptap_event.dispatchEvent(ev);
						this.onload && this.onload(this.response);
						this.onreadystatechange && this.onreadystatechange();
						if (this.onprogress)
							this.onprogress(100);
					}
				});

			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}


		}
		else if (".ltcb" == o || ".mp3" == o || ".ogg" == o || ".wav" == o || ".bundle" === o || ".zip" === o || ".sk" === o || ".bin" === o || ".obj" === o || ".awd" === o || this.responseType == "arraybuffer") {
			try {
				window.zipData.files[this.url_t].async("arraybuffer").then((t) => {
					//console.log("-------->" + this.url_t);
					this._state = "loaded";
					this.state = "loaded";
					this.readyState = 4;
					this.status = 200;
					this.response = t
					this.responseText = t;
					var ev = document.createEvent('HTMLEvents');
					ev.initEvent('load', false, true);
					this.uptap_event.dispatchEvent(ev);
					if (this.onprogress)
						this.onprogress(100);
					this.onload && this.onload(this);
					this.onreadystatechange && this.onreadystatechange(this);
				});

			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}

		}
		else if (".lm" == o || ".lani" == o || ".wasm" === o) {
			try {
				window.zipData.files[this.url_t].async("arraybuffer").then((t) => {

					console.log("-------->" + this.url_t);
					this._state = "loaded";
					this.state = "loaded";
					this.readyState = 4;
					this.status = 200;
					this.response = t
					this.responseText = t;
					var ev = document.createEvent('HTMLEvents');
					ev.initEvent('load', false, true);
					this.uptap_event.dispatchEvent(ev);

					if (this.onprogress)
						this.onprogress(100);
					this.onload && this.onload(t);
					this.onreadystatechange && this.onreadystatechange();
				});
			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}

		}
		else {
			try {

				window.zipData.files[this.url_t].async("string").then((t) => {
					//console.log("-------->" + this.url_t);
					this._state = "loaded";
					this.state = "loaded";
					this.readyState = 4;
					this.status = 200;
					this.response = t
					this.responseText = t;
					var ev = document.createEvent('HTMLEvents');
					ev.initEvent('load', false, true);
					this.uptap_event.dispatchEvent(ev);
					this.onload && this.onload(t);
					if (this.onprogress)
						this.onprogress(100);
					this.onreadystatechange && this.onreadystatechange();
				});

			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}

		}
	}
	function myImage(t, image) {
		var o = t.substr(t.lastIndexOf("."));
		t = geshihua_url(t);
		if (".png" == o || ".jpg" == o) {
			try {
				window.zipData.files[t].async("uint8array").then((t) => {
					var e, s;
					if (".png" === o) {
						e = new Blob([t], {
							type: "image/png"
						});
					}
					else if (".jpg" === o) {
						e = new Blob([t], {
							type: "image/jpg"
						});
					}
					(s = new FileReader).readAsDataURL(e);
					s.onload = (t) => {
						image.src = t.target.result;

						//var ev = document.createEvent('HTMLEvents');
						//ev.initEvent('load', false, true);
						//image.dispatchEvent(ev);

					}
				});
			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}
		}
	}
	window.myImage = myImage;

	function myAudio(t, image) {
		var o = t.substr(t.lastIndexOf("."));
		t = geshihua_url(t);
		if (".mp3" == o || ".ogg" == o || ".wav" == o) {
			try {
				window.zipData.files[t].async("uint8array").then((t) => {
					var e, s;
					if (".mp3" === o) {
						e = new Blob([t], {
							type: "audio/mpeg"
						});
					}
					else if (".ogg" === o) {
						e = new Blob([t], {
							type: "application/ogg"
						});
					}
					else if (".wav" === o) {
						e = new Blob([t], {
							type: "audio/x-wav"
						});
					}
					(s = new FileReader).readAsDataURL(e);
					s.onload = (t) => {
						image.src = t.target.result;
					}
				});
			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}

		}
	}
	window.myAudio = myAudio;
	// 定义新的Image类
	class NewImage extends Image {
		constructor() {
		super();
		}
	
		// 重写src属性的设置方法
		set src(t) {
			var o = t.substr(t.lastIndexOf("."));
			t = geshihua_url(t);
			if (".png" == o || ".jpg" == o) {
				try {
					window.zipData.files[t].async("uint8array").then((t) => {
						var e, s;
						if (".png" === o) {
							e = new Blob([t], {
								type: "image/png"
							});
						}
						else if (".jpg" === o) {
							e = new Blob([t], {
								type: "image/jpg"
							});
						}
						(s = new FileReader).readAsDataURL(e);
						s.onload = (t) => {
							super.src = t.target.result;
	
						}
					});
				} catch (e) {
					console.log("zipData——》" + this.url_t)
					this.onerror && this.onerror(this.url_t);
				}
			}
		}
	}
	window.NewImage = NewImage;
	// 定义新的Image类
	class NewAudio extends Audio {
		constructor() {
		super();
		}
	
		// 重写src属性的设置方法
		set src(t) {
			var o = t.substr(t.lastIndexOf("."));
			t = geshihua_url(t);
			if (".mp3" == o || ".ogg" == o || ".wav" == o) {
				try {
					window.zipData.files[t].async("uint8array").then((t) => {
						var e, s;
						if (".mp3" === o) {
							e = new Blob([t], {
								type: "audio/mpeg"
							});
						}
						else if (".ogg" === o) {
							e = new Blob([t], {
								type: "application/ogg"
							});
						}
						else if (".wav" === o) {
							e = new Blob([t], {
								type: "audio/x-wav"
							});
						}
						(s = new FileReader).readAsDataURL(e);
						s.onload = (t) => {
							super.src = t.target.result;
						}
					});
				} catch (e) {
					console.log("zipData——》" + this.url_t)
					this.onerror && this.onerror(this.url_t);
				}

			}
		}
	}
	window.NewAudio = NewAudio;
	function rewriteScript() {
		// 保存原始的createElement方法
		var originalCreateElement = document.createElement;

		// 重写createElement方法
		document.createElement = function (tagName) {
			// 检查是否是script标签
			if (tagName.toLowerCase() === 'script') {
				// 创建一个新的script标签
				var script = originalCreateElement.call(document, 'script');
				Object.defineProperty(script, 'src', {
					set: function (value) {
						console.log('Setting src:', value);
						try {
							window.zipData.files[value].async("string").then((text) => {
								//addScript(text);
								//image.src = text;
								this.onload && this.onload(t);
								var ev = document.createEvent('HTMLEvents');
								ev.initEvent('load', false, true);
								script.dispatchEvent(ev);

								script.setAttribute('type', 'text/javascript');
								script.text = text;
								document.body.appendChild(script);
							})

						} catch (e) {
							console.log("zipData——》" + this.url_t)
							this.onerror && this.onerror(this.url_t);
						}
					},
					configurable: true
				});
				return script;
			}
			// 对于其他标签，保持原始的createElement方法
			return originalCreateElement.apply(document, arguments);
		};
	}

	function myScript(t, script) {
		this.uptap_event = document.createElement("div");
		this.uptap_event.setAttribute("id", "eventdiv" + + Math.random() + "_" + + Math.random());

		var o = t.substr(t.lastIndexOf("."));
		t = geshihua_url(t);
		if (".js" == o) {
			try {
				window.zipData.files[t].async("string").then((text) => {
					//addScript(text);
					//image.src = text;
					this.onload && this.onload(t);
					var ev = document.createEvent('HTMLEvents');
					ev.initEvent('load', false, true);
					script.dispatchEvent(ev);

					script.setAttribute('type', 'text/javascript');
					script.text = text;
					document.body.appendChild(script);

				})

			} catch (e) {
				console.log("zipData——》" + this.url_t)
				this.onerror && this.onerror(this.url_t);
			}

		}
	}
	myScript.prototype.addEventListener = function (event, back) {
		return this.uptap_event.addEventListener(event, back);
	}
	window.myScript = myScript;


	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType("text/plain; charset=x-user-defined");
	xhr.open('GET', zipfile, true);
	xhr.addEventListener("load", function () {
		JSZip.loadAsync(xhr.response).then(function (t) {
			window.zipData = t;
			next(window.zipData);
			rewriteScript();
			uptap && uptap.LoadingComplete && uptap.LoadingComplete();
		})
	});
	xhr.addEventListener(
		"progress",
		function (evt) {
			if (evt.lengthComputable) {
				let percentComplete = evt.loaded / evt.total;
				var percentage = percentComplete * 100;
				uptap && uptap.SetLoadingProgress && uptap.SetLoadingProgress(percentage);
			}
		},
		false
	);

	xhr.send(null);
	window.XMLHttpRequest = myXMLHttpRequest;
})();