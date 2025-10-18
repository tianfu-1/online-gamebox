function addJavaScript(src, type) {
    return new Promise(resolve => {
        let script = document.createElement('script')
        script.src = src

        if (type)
            script.type = type

        script.addEventListener('load', function() {
            resolve()
        })

        document.head.appendChild(script)
    })
}

function Timer(seconds) {
    let self = this
    self.seconds = seconds
    self.isCompleted = false
    self._timer = setInterval(() => {
        self.seconds -= 1

        if (self.seconds <= 0) {
            self.seconds = 0
            self.isCompleted = true
            clearInterval(self._timer)
        }
    }, 1000)
}

function isMobileDevice() {
	return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

var isMobile = {
            Android: function () {
                return navigator.userAgent.match(/Android/i) ? true : false;
            },
            BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i) ? true : false;
            },
            iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
            },
            Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i) ? true : false;
            },
            Windows: function () {
                return navigator.userAgent.match(/IEMobile/i) ? true : false;
            },
			Kindle: function () {
                return navigator.userAgent.match(/Silk/i) ? true : false;
            },
            any: function () {
                return (isMobile.Kindle() || isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };