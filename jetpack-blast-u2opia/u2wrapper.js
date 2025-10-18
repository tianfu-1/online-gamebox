
    var highScore = 0;
    function gameLoad(isLoaded, percent){
        var url = new URL(window.location.href);
        if (url.searchParams.get('debug')) {
            alert("gameLoaded: "+isLoaded)
        }
        console.log(percent+"% loaded...");
        if(isLoaded){
            var score=0,highScore=0;
                var obj = { "score":score,"highScore":highScore,"state":'loaded'};
                window.parent.postMessage(obj, '*');
                console.log('Game Loaded');
            console.log('game is loaded..');
        } else {
            console.log('game loading..');
        }
    }
    function gameStart(){
        var url = new URL(window.location.href);
        if (url.searchParams.get('debug')) {
            alert("gameStarted");
        }
        try{
            openFullscreen();
        }
        catch(e){}
        var score=0,highScore=0;
            var obj = { "score":score,"highScore":highScore,"state":'playing'};
            window.parent.postMessage(obj, '*');
            console.log('Game Started');
        console.log('game start..');
    }
    function gameOver(score){
        var url = new URL(window.location.href);
        if (url.searchParams.get('debug')) {
            alert("gameOver score: "+score);
        }
        var obj = { "score":score,"highScore":highScore,"state":'over'};
            window.parent.postMessage(obj, '*');
            console.log('Game Over');
        console.log('game over..');
        console.log('Current Score: '+score);
    }
    
    function openFullscreen() {
    var elem = document.getElementById("ajaxbar");
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitEnterFullscreen) { /* Chrome, Safari & Opera */
        elem.webkitEnterFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
    }
    