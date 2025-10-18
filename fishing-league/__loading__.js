pc.script.createLoadingScreen(function (app) {
    var showSplash = function () {
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        var splash = document.createElement('div');
        splash.id = 'application-splash';
        wrapper.appendChild(splash);
        splash.style.display = 'none';

        var container = document.createElement('div');
        container.id = 'progress-bar-container';
        splash.appendChild(container);

        var percentage = document.createElement('div');
        percentage.id = 'progress-percentage';
        container.appendChild(percentage);

        var bar = document.createElement('div');
        bar.id = 'progress-bar';
        container.appendChild(bar);

        wrapper.appendChild(container);
    };

    var hideSplash = function () {
        var splash = document.getElementById('application-splash-wrapper');
        splash.parentElement.removeChild(splash);
    };

    var setProgress = function (value) {
        var bar = document.getElementById('progress-bar');
        var percentage = document.getElementById('progress-percentage');
        if(bar && percentage) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
            percentage.innerText = Math.round(value * 100) + '%';
        }
    };

    var createCss = function () {
        var css = [
            'body {',
            '    background-color: #ffd800;',
            '}',
            '',
            '#application-splash-wrapper {',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    height: 100%;',
            '    width: 100%;',
            '    background: url("https://assets.venge.io/FL-Loading-v3.jpg") no-repeat center center;',
            '    background-size: cover;',
            '    overflow: hidden;',
            '}',
            '',
            '#application-splash {',
            '    position: absolute;',
            '    top: calc(50% - 180px);',
            '    width: 264px;',
            '    left: calc(50% - 132px);',
            '    z-index: 100;',
            '}',
            '',
            '#application-splash img {',
            '    width: 100%;',
            '}',
            '',
            '#progress-bar-container {',
            '    height: 30px;',
            '    width: 30vw;',
            '    position: fixed;',
            '    left: 50%;',
            '    bottom: 10%;',
            '    transform: translate(-50%, 0%);',
            '    background-color: rgba(0, 0, 0);',
            '    border-radius: 30px;',
            '    border: solid 5px #000;',
            '    overflow: hidden;',
            '}',
            '',
            '#progress-percentage {',
            '    position: absolute;',
            '    width: 100%;',
            '    height: 100%;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    color: white;',
            '    font-weight: bold;',
            '    z-index: 1;',
            '}',
            '',
            '#progress-bar {',
            '    width: 0%;',
            '    height: 100%;',
            '    background: rgb(0, 80, 150);',
            '    background: linear-gradient(0deg, rgba(0, 80, 150, 1) 0%, rgba(0, 200, 255, 1) 100%);',
            '}',
            '',
            '@media (max-width: 480px) {',
            '    #application-splash {',
            '        width: 170px;',
            '        left: calc(50% - 85px);',
                '}',
                '#application-splash-wrapper {',
                '    position: absolute;',
                '    top: 0;',
                '    left: 0;',
                '    height: 100%;',
                '    width: 100%;',
                '    background: url("https://assets.venge.io/FL-Thumbnail-Mobile.jpg") no-repeat center center;',
                '    background-size: cover;',
                '    overflow: hidden;',
                '}',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };

    createCss();
    showSplash();

    app.on('preload:end', function () {
        app.off('preload:progress');
    });
    app.on('preload:progress', setProgress);
    app.on('start', hideSplash);
});