export const ASSETSPATH = {
    ENDSCREEN: "./assets/endTexts/",
    AUDIO: "./assets/audio/",
    BUTTONS: "./assets/buttons/",
    FONTS: "./assets/fonts/",
    ANIMATIONS: "./assets/animations/",
    PHYSICS: "./assets/physics/",
    LOAD: "./assets/load/",
    MENU: "./assets/0menu/",
    FLY: "./assets/1fly/",
    PROTECT: "./assets/2protect/",
    ALAN: "./assets/3alan/",
    JUMPSCARE: "./assets/4jumpscare/",
    COMEDIAN: "./assets/5comedian/",
    PARTY: "./assets/6party/",
    DRESSUP: "./assets/8dressup/",
    COLLECT: "./assets/9candycollect/",
    SORT: "./assets/10sortcandy/",
    GHOSTBUSTERS: "./assets/11ghostbusters/",
    HEAVENHELL: "./assets/12heavenorhell/",
}

export const CONST = {
       REGISTRY: {
        ADBLOCKENABLED: "adblockEnabled",
        SKIPUSED: "skipUsed",
        JUMPSCARE_ATTEMPTS: "jumpscareAttempts",
        GHOSTBUSTERS_ATTEMPTED: "ghostbustersAttempted",
        HELL_COMPLETED: "hellCompleted",
        GAME_COMPLETED: "gameCompleted",
    },

    GAMESTATE: {
        START: "START",
        PLAYING: "PLAYING",
        WIN: "WIN",
        LOSE: "LOSE",
        LOADNEXTLEVEL: "LOAD",
    },

    SCENES: {
        LOAD: "LOAD",
        PROGRESSIVE_LOAD: "PROGRESSIVE_LOAD",
        SOUNDTRACK: "SOUNDTRACK",
        MENU: "MENU",
        FLY: "FLY",
        ALAN: "ALAN",
        PROTECT: "PROTECT",
        JUMPSCARE: "JUMPSCARE",
        COMEDIAN: "COMEDIAN",
        PARTY: "PARTY",
        DRESSUP: "DRESSUP",
        COLLECT: "COLLECT",
        SORT: "SORT",
        GHOSTBUSTERS: "GHOSTBUSTERS",
        HEAVENHELL: "HEAVENHELL",
        CREDITS: "CREDITS",
    },

    STORAGE_KEYS: {
        PROGRESS: "game_progress",
        DRESSUP_COSTUME: "dressup_costume",
    },

    AUDIO: {
        SOUNDTRACK: ASSETSPATH.AUDIO + "soundtrack.mp3",
        SOUNDTRACK_SHORT: ASSETSPATH.AUDIO + "soundtrackShort.mp3",
        EERIE: ASSETSPATH.AUDIO + "eerie.mp3",
        GRAB: ASSETSPATH.AUDIO + "paperGrab.mp3",
        BOUNCE: ASSETSPATH.AUDIO + "bounce.mp3",
        SCARE1: ASSETSPATH.AUDIO + "scare1.mp3",
        SCARE2: ASSETSPATH.AUDIO + "scare2.mp3",
        PARTY_MUSIC: ASSETSPATH.AUDIO + "partyMusic.mp3",
        WINK: ASSETSPATH.AUDIO + "wink.mp3",
        CLICK: ASSETSPATH.AUDIO + "btnClick.mp3",

        WIN: ASSETSPATH.AUDIO + "win.mp3",
        LOSE: ASSETSPATH.AUDIO + "lose.mp3",
    },

    BUTTONS: {
        TRYAGAIN: ASSETSPATH.BUTTONS + "button.png",
        SKIP: ASSETSPATH.BUTTONS + "ad-button.png",
        SPINNER: ASSETSPATH.BUTTONS + "spinner.png",

        PURPLE: ASSETSPATH.BUTTONS + "purple.png",
        RED: ASSETSPATH.BUTTONS + "red.png",

        SOUND_ON: ASSETSPATH.BUTTONS + "sound-on.png",
        SOUND_OFF: ASSETSPATH.BUTTONS + "sound-off.png",
    },

    FONT: {
        ATLAS: ASSETSPATH.FONTS + "LTGFont.png",
        XML: ASSETSPATH.FONTS + "LTGFont.xml",
    },

    ANIMATIONS: {
        CANDY_IDLE: ASSETSPATH.ANIMATIONS + "CandyAnim.json",
        CANDY_DIE: ASSETSPATH.ANIMATIONS + "CandyDie.json",
        SCARYARM_BACK: ASSETSPATH.ANIMATIONS + "scaryArmBack.json",
        SCARYARM_FRONT: ASSETSPATH.ANIMATIONS + "scaryArmFront.json",
        GHOST_IDLE: ASSETSPATH.ANIMATIONS + "ghostIdle.json",
        GHOST_DIE: ASSETSPATH.ANIMATIONS + "ghostDie.json",
        GRANNY_HAND1: ASSETSPATH.ANIMATIONS + "granny_hand1.json",
        GRANNY_HAND2: ASSETSPATH.ANIMATIONS + "granny_hand2.json",
        GRANNYDIE_HAND1: ASSETSPATH.ANIMATIONS + "grannyDie_hand1.json",
        GRANNYDIE_HAND2: ASSETSPATH.ANIMATIONS + "grannyDie_hand2.json",
        GRANNYDIE_BODY: ASSETSPATH.ANIMATIONS + "grannyDie_body.json",
        WIN_IMAGE_POPUP: ASSETSPATH.ANIMATIONS + "winImagePopup.json",
        NOTE_DEATH: ASSETSPATH.ANIMATIONS + "noteDeath.json",
        BLUE_LIGHT: ASSETSPATH.ANIMATIONS + "bluelight.json",
        GREEN_LIGHT: ASSETSPATH.ANIMATIONS + "greenlight.json",
        PINK_LIGHT: ASSETSPATH.ANIMATIONS + "pinklight.json",
        COMEDIAN_HAND_1: ASSETSPATH.ANIMATIONS + "comedianHand.json",
        COMEDIAN_HAND_2: ASSETSPATH.ANIMATIONS + "comedianHand2.json",
        FLY_WIN: ASSETSPATH.ANIMATIONS + "flyWin.json",
    },

    PHYSICS: {
        FLY_SHAPES: ASSETSPATH.PHYSICS + "ghost_shape.json",
        HEAVENHELL_SHAPES: ASSETSPATH.PHYSICS + "heavenhell_shapes.json",
    },

    MENU: {
        BACKGROUND: ASSETSPATH.MENU + "background.png",
        OVERLAY: ASSETSPATH.MENU + "overlay.png",
        PLAY_BUTTON: ASSETSPATH.MENU + "playButton.png",
        STAR_PARTICLE: ASSETSPATH.MENU + "particle.png"
    },

    FLY: {
        BACKGROUND: ASSETSPATH.FLY + "ozadje-modr.png",
        HOLD_TEXT: ASSETSPATH.FLY + "hold.png",
        GRADIENT: ASSETSPATH.FLY + "gradient.png",
        WHITE_SQUARE: ASSETSPATH.FLY + "white_square.jpg",
        START_GRASS: ASSETSPATH.FLY + "grass_start.png",
        GRASS_1: ASSETSPATH.FLY + "grass1.png",
        GRASS_2: ASSETSPATH.FLY + "grass2.png",

        FOUNTAIN: ASSETSPATH.FLY + "fountain.png",
        LIGHT: ASSETSPATH.FLY + "light-2.png",
        MOON: ASSETSPATH.FLY + "moon.png",
        SPIDER_1: ASSETSPATH.FLY + "spider-1.png",
        SPIDER_2: ASSETSPATH.FLY + "spider-2.png",
        SPIDER_3: ASSETSPATH.FLY + "spider-3.png",
        SPIDER_LINE: ASSETSPATH.FLY + "crta.png",
        TWIG: ASSETSPATH.FLY + "twig.png",
        GHOST: ASSETSPATH.FLY + "duhc.png",

        WIN_IMAGE: ASSETSPATH.FLY + "win.png",
        WIN_GHOST: ASSETSPATH.FLY + "win_ghost.png",
        END: ASSETSPATH.ENDSCREEN + "fly.png"
    },

    ALAN: {
        BACKGROUND: ASSETSPATH.ALAN + "background.png",
        CLOUDS: ASSETSPATH.ALAN + "clouds.png",
        PLANT: ASSETSPATH.ALAN + "plant.png",
        TABLE: ASSETSPATH.ALAN + "table.png",
        WINDOWS: ASSETSPATH.ALAN + "windows.png",
        ALAN: ASSETSPATH.ALAN + "alan.png",
        ALAN_SADMOUTH: ASSETSPATH.ALAN + "sad-mouth.png",
        ALAN_SADDERMOUTH: ASSETSPATH.ALAN + "sadder-mouth.png",

        PAPER_1: ASSETSPATH.ALAN + "paper1.png",
        PAPER_2: ASSETSPATH.ALAN + "paper2.png",
        PAPER_3: ASSETSPATH.ALAN + "paper3.png",
        PAPER_4: ASSETSPATH.ALAN + "paper4.png",
        PAPER_5: ASSETSPATH.ALAN + "paper5.png",
        PAPER_6: ASSETSPATH.ALAN + "paper6.png",
        PAPER_7: ASSETSPATH.ALAN + "paper7.png",
        LEAF: ASSETSPATH.ALAN + "leaf.png",
        MUG: ASSETSPATH.ALAN + "mug.png",
        NAPIS: ASSETSPATH.ALAN + "napis.png",
        PEN: ASSETSPATH.ALAN + "pen.png",
        PENCIL: ASSETSPATH.ALAN + "pencil.png",
        RUBBER: ASSETSPATH.ALAN + "rubber.png",
        
        END: ASSETSPATH.ENDSCREEN + "alan.png"
    },

    PROTECT: {
        BACKGROUND: ASSETSPATH.PROTECT + "bg.png",
        DRAG_TEXT: ASSETSPATH.PROTECT + "drag.png",
        WIN_SCREEN: ASSETSPATH.PROTECT + "protect.png",
        LADY: ASSETSPATH.PROTECT + "lady.png",
        HAND_1: ASSETSPATH.PROTECT + "h1.png",
        HAND_2: ASSETSPATH.PROTECT + "h2.png",
        AXE: ASSETSPATH.PROTECT + "axe.png",
        KNIFE: ASSETSPATH.PROTECT + "hey-orange.png",
        NINJA: ASSETSPATH.PROTECT + "nunja.png",
        POOP: ASSETSPATH.PROTECT + "poop.png",
        PORCUPINE: ASSETSPATH.PROTECT + "porcupine.png",
        YARN: ASSETSPATH.PROTECT + "yarn.png",
        END: ASSETSPATH.ENDSCREEN + "protect.png",
    },

    JUMPSCARE: {
        BACKGROUND: ASSETSPATH.JUMPSCARE + "background.png",
        WALLPAPER: ASSETSPATH.JUMPSCARE + "epic-poster.png",
        CHAIR: ASSETSPATH.JUMPSCARE + "chair.png",
        TABLE: ASSETSPATH.JUMPSCARE + "table.png",
        TV_PLAY: ASSETSPATH.JUMPSCARE + "tvPlay.png",
        TV_SCARE: ASSETSPATH.JUMPSCARE + "tvScare.png",
        CLICK_TEXT: ASSETSPATH.JUMPSCARE + "click.png",
        FAST_TEXT: ASSETSPATH.JUMPSCARE + "fast.png",
        JACK: ASSETSPATH.JUMPSCARE + "jackaboy.png",
        NORMAL_EYES: ASSETSPATH.JUMPSCARE + "jack-normal-eyes.png",
        SCARED_EYES: ASSETSPATH.JUMPSCARE + "jack-shit-pantso.png",
        ARM_1: ASSETSPATH.JUMPSCARE + "arm.png",
        ARM_2: ASSETSPATH.JUMPSCARE + "arm-2.png",  
        BAR: ASSETSPATH.JUMPSCARE + "bar-brez-crtice.png",
        BAR_LINE: ASSETSPATH.JUMPSCARE + "crtica-za-bar.png",
        BUTTON: ASSETSPATH.JUMPSCARE + "button.png",
        BUTTON_PRESSED: ASSETSPATH.JUMPSCARE + "button-presed.png",
        SCARE_SCREEN: ASSETSPATH.JUMPSCARE + "jumpscare.png",
    },

    COMEDIAN: {
        BACKGROUND: ASSETSPATH.COMEDIAN + "background.png",
        MIC: ASSETSPATH.COMEDIAN + "mic.png",

        JOKE_1_QUESTION: ASSETSPATH.COMEDIAN + "5-2.png",
        JOKE_1_ANSWER_1: ASSETSPATH.COMEDIAN + "5-1.png",
        JOKE_1_ANSWER_2: ASSETSPATH.COMEDIAN + "5-3.png",
        JOKE_1_ANSWER_3: ASSETSPATH.COMEDIAN + "5-4.png",

        JOKE_2_QUESTION: ASSETSPATH.COMEDIAN + "1-2.png",
        JOKE_2_ANSWER_1: ASSETSPATH.COMEDIAN + "1-1.png",
        JOKE_2_ANSWER_2: ASSETSPATH.COMEDIAN + "1-3.png",
        JOKE_2_ANSWER_3: ASSETSPATH.COMEDIAN + "1-4.png",

        JOKE_3_QUESTION: ASSETSPATH.COMEDIAN + "2-3.png",
        JOKE_3_ANSWER_1: ASSETSPATH.COMEDIAN + "2-4.png",
        JOKE_3_ANSWER_2: ASSETSPATH.COMEDIAN + "2-1.png",
        JOKE_3_ANSWER_3: ASSETSPATH.COMEDIAN + "2-2.png",

        JOKE_4_QUESTION: ASSETSPATH.COMEDIAN + "3-2.png",
        JOKE_4_ANSWER_1: ASSETSPATH.COMEDIAN + "3-4.png",
        JOKE_4_ANSWER_2: ASSETSPATH.COMEDIAN + "3-3.png",
        JOKE_4_ANSWER_3: ASSETSPATH.COMEDIAN + "3-1.png",

        JOKE_5_QUESTION: ASSETSPATH.COMEDIAN + "4-3.png",
        JOKE_5_ANSWER_1: ASSETSPATH.COMEDIAN + "4-4.png",
        JOKE_5_ANSWER_2: ASSETSPATH.COMEDIAN + "4-2.png",
        JOKE_5_ANSWER_3: ASSETSPATH.COMEDIAN + "4-1.png",

        WIN_BACKGROUND: ASSETSPATH.COMEDIAN + "win-anim/background.png",
        GHOST_1: ASSETSPATH.COMEDIAN + "win-anim/duhc-1.png",
        GHOST_2: ASSETSPATH.COMEDIAN + "win-anim/duhc-2.png",
        GHOST_3: ASSETSPATH.COMEDIAN + "win-anim/duhc-3.png",
        GHOST_4: ASSETSPATH.COMEDIAN + "win-anim/duhc-4.png",
        GHOST_5: ASSETSPATH.COMEDIAN + "win-anim/duhc-5.png",
        GHOST_6: ASSETSPATH.COMEDIAN + "win-anim/duhc-6.png",
        GHOST_7: ASSETSPATH.COMEDIAN + "win-anim/duhc-7.png",
        GHOST_8: ASSETSPATH.COMEDIAN + "win-anim/duhc-8.png",
        HANDS_1: ASSETSPATH.COMEDIAN + "win-anim/hands.png",
        HANDS_2: ASSETSPATH.COMEDIAN + "win-anim/hands2.png",

        LOSEIMAGE: ASSETSPATH.ENDSCREEN + "comedian-1.png",
        END: ASSETSPATH.ENDSCREEN + "comedian-2.png"        
    },

    PARTY: {
        BACKGROUND_BACK: ASSETSPATH.PARTY + "ozadje-zadi.png",
        BACKGROUND_FRONT: ASSETSPATH.PARTY + "ozadje-spredi.png",
        GRAVE: ASSETSPATH.PARTY + "grave.png",
        MARTINI: ASSETSPATH.PARTY + "martini.png",
        BATS: ASSETSPATH.PARTY + "netopirji.png",
        LUNA: ASSETSPATH.PARTY + "ozdaje-moon.png",

        GHOST_1_BODY: ASSETSPATH.PARTY + "ghost-1-body.png",
        GHOST_2_BODY: ASSETSPATH.PARTY + "ghost-2-body.png",
        GHOST_3_BODY: ASSETSPATH.PARTY + "ghost-3-body.png",
        GHOST_4_BODY: ASSETSPATH.PARTY + "ghost-4-body.png",

        DOT_BLUE: ASSETSPATH.PARTY + "blue-dot.png",
        DOT_GREEN: ASSETSPATH.PARTY + "green-dot.png",
        DOT_PINK: ASSETSPATH.PARTY + "pink-dot.png",
        END_BLUE: ASSETSPATH.PARTY + "blue-something.png",
        END_GREEN: ASSETSPATH.PARTY + "green-something.png",
        END_PINK: ASSETSPATH.PARTY + "pink-something.png",
        LIGHT_BLUE: ASSETSPATH.PARTY + "blue-light.png",
        LIGHT_GREEN: ASSETSPATH.PARTY + "green-light.png",
        LIGHT_PINK: ASSETSPATH.PARTY + "pink-light.png",
        LINE_BLUE: ASSETSPATH.PARTY + "blue-line.png",
        LINE_GREEN: ASSETSPATH.PARTY + "green-line.png",
        LINE_PINK: ASSETSPATH.PARTY + "pink-line.png",

        WIN_SCREEN: ASSETSPATH.PARTY + "party.png",

        END: ASSETSPATH.ENDSCREEN + "party.png"
    },

    JSONPARTY: {
        MUSIC: ASSETSPATH.PARTY + "music.json",
        FFT: ASSETSPATH.PARTY + "fft.json",
    },

    DRESSUP: {
        BACKGROUND: ASSETSPATH.DRESSUP + "ozadje.png",
        GHOST: ASSETSPATH.DRESSUP + "ghost.png",
        FABULOUS_BUTTON: ASSETSPATH.DRESSUP + "fabulousButton.png",
        BOY_1: ASSETSPATH.DRESSUP + "boy-1.png",
        BOY_2: ASSETSPATH.DRESSUP + "boy-2.png",
        BOY_3: ASSETSPATH.DRESSUP + "boy-3.png",
        DPOOL_1: ASSETSPATH.DRESSUP + "deadpool-1.png",
        DPOOL_2: ASSETSPATH.DRESSUP + "deadpool-2.png",
        DPOOL_3: ASSETSPATH.DRESSUP + "deadpool-3.png",
        DINO_1: ASSETSPATH.DRESSUP + "dinosaur-1.png",
        DINO_2: ASSETSPATH.DRESSUP + "dinosaur-2.png",
        DINO_3: ASSETSPATH.DRESSUP + "dinosaur-3.png",
        WITCH_1: ASSETSPATH.DRESSUP + "whitch-1.png",
        WITCH_2: ASSETSPATH.DRESSUP + "witch-2.png",
        WITCH_3: ASSETSPATH.DRESSUP + "witch-3.png",
        END: ASSETSPATH.ENDSCREEN + "halloween-dress-up.png"
    }, 

    COLLECT: {
        BACKGROUND: ASSETSPATH.COLLECT + "bg.png",
        CANDY_1: ASSETSPATH.COLLECT + "candy1.png",
        CANDY_2: ASSETSPATH.COLLECT + "candy2.png",
        CANDY_3: ASSETSPATH.COLLECT + "candy3.png",
        CANDY_4: ASSETSPATH.COLLECT + "candy4.png",
        CANDY_5: ASSETSPATH.COLLECT + "candy5.png",
        PLAYER_0: ASSETSPATH.COLLECT + "homan.png",
        PLAYER_1: ASSETSPATH.COLLECT + "raaaaaawr.png",
        PLAYER_2: ASSETSPATH.COLLECT + "dead-pooly.png",
        PLAYER_3: ASSETSPATH.COLLECT + "its-a-witch.png",
        END: ASSETSPATH.ENDSCREEN + "haloween-collect.png"
    },

    SORT: {
        BACKGROUND: ASSETSPATH.SORT + "ozadje.png",
        SORT_TEXT: ASSETSPATH.SORT + "sort.png",
        PUMPKIN_BACK: ASSETSPATH.SORT + "pumpkin_1.png",
        PUMPKIN_FRONT: ASSETSPATH.SORT + "pumpkin-ozadje.png",
        TRASH_BACK: ASSETSPATH.SORT + "trash.png",
        TRASH_FRONT: ASSETSPATH.SORT + "trash-front.png",
        GHOST: ASSETSPATH.SORT + "ghost.png",
        CANDY_1: ASSETSPATH.SORT + "bombombom-3.png",
        CANDY_2: ASSETSPATH.SORT + "bonbon.png",
        CANDY_3: ASSETSPATH.SORT + "chocoloto.png",
        CANDY_4: ASSETSPATH.SORT + "loleh.png",
        CANDY_5: ASSETSPATH.SORT + "nom.png",
        BROCCOLI: ASSETSPATH.SORT + "brocololo.png",
        MEAT: ASSETSPATH.SORT + "meat.png",
        RAZOR: ASSETSPATH.SORT + "razor.png",
        TOOTHBRUSH: ASSETSPATH.SORT + "tootho.png",
        WIN_BACKGROUND: ASSETSPATH.SORT + "endbg.png", //TODO: Fix so it is only the basket!
        WIN_GHOST: ASSETSPATH.SORT + "sort-ghost.png",
        END: ASSETSPATH.ENDSCREEN + "sortCandy.png" //TODO: fix so it is without wood background
    },

    GHOSTBUSTERS: {
        BACKGROUND: ASSETSPATH.GHOSTBUSTERS + "ozadje.png",
        START_GRADIENT: ASSETSPATH.GHOSTBUSTERS + "gradient.png",
        LEVEL: ASSETSPATH.GHOSTBUSTERS + "polje.png",
        CANNON: ASSETSPATH.GHOSTBUSTERS + "shooter.png",
        BALL: ASSETSPATH.GHOSTBUSTERS + "krogla.png",
        LASER: ASSETSPATH.GHOSTBUSTERS + "laser.png",
        SPINNER: ASSETSPATH.GHOSTBUSTERS + "swirly.png",
        END: ASSETSPATH.ENDSCREEN + "ghostbusters.png"
    },

    HEAVENHELL: {
        HEAVEN_BACKGROUND: ASSETSPATH.HEAVENHELL + "heaven-ozadje.png",
        HELL_BACKGROUND: ASSETSPATH.HEAVENHELL + "hell-ozadje.png",
        START_CLOUD: ASSETSPATH.HEAVENHELL + "startCloud.png",
        START_GHOST: ASSETSPATH.HEAVENHELL + "ghostie.png",
        GHOST_SIDE: ASSETSPATH.HEAVENHELL + "ghost-side.png",
        SIGN_HEAVEN: ASSETSPATH.HEAVENHELL + "heaven_sign.png",
        SIGN_HELL: ASSETSPATH.HEAVENHELL + "hell-sign.png",

        //Hell
        EVIL_DUCK: ASSETSPATH.HEAVENHELL + "duck-devil.png",
        NORMAL_DUCK: ASSETSPATH.HEAVENHELL + "suck-a-duck.png",

        //Heaven
        SWING: ASSETSPATH.HEAVENHELL + "bar.png",
        CLICKER: ASSETSPATH.HEAVENHELL + "clicker.png",
        ROAD: ASSETSPATH.HEAVENHELL + "road.png",
        ROAD_FIRE: ASSETSPATH.HEAVENHELL + "road-of-fire.png",
        STAIRS_START: ASSETSPATH.HEAVENHELL + "staircaseStart.png",
        STAIRS_MID: ASSETSPATH.HEAVENHELL + "stairs.png",
        STAIRS_END: ASSETSPATH.HEAVENHELL + "stairsEnd.png",

        CLOUD_1: ASSETSPATH.HEAVENHELL + "oblak1.png",
        CLOUD_2: ASSETSPATH.HEAVENHELL + "oblak2.png",
        CLOUD_3: ASSETSPATH.HEAVENHELL + "oblak3.png",
        CLOUD_4: ASSETSPATH.HEAVENHELL + "oblak4.png",
        CLOUD_5: ASSETSPATH.HEAVENHELL + "oblak5.png",
        CLOUD_7: ASSETSPATH.HEAVENHELL + "oblak7.png",

        END: ASSETSPATH.ENDSCREEN + "hell.png"
    },

    CREDITS: {
        HELL: ASSETSPATH.ENDSCREEN + "credits-hell.png",
        HEAVEN: ASSETSPATH.ENDSCREEN + "credits-heaven.png",
    }
}