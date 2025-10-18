resizePreload = () => {
    var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

var aspect = 853/480;
var tW, tH;
if (width/height < aspect){
    //portrait mode
    tW = width;
    tH = tW / aspect;
} else {
    //landscape mode
    tH = height;
    tW = tH * aspect;
}

var div = document.getElementById("preloadDiv");
div.style.height = tH + "px";
div.style.width = tW + "px";
}

resizePreload();

window.onresize = function(event) {
    resizePreload();
};