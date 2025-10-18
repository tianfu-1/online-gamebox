/** @type {import("../typings/phaser")} */

import {LoadScene} from "./scenes/LoadScene";
import {MenuScene} from "./scenes/MenuScene";
import { SoundtrackScene } from "./scenes/SoundtrackScene";
import { DressupScene } from "./scenes/DressupScene";
import { CollectScene } from "./scenes/CollectScene";
import { SortScene } from "./scenes/SortScene";
import { JumpscareScene } from "./scenes/JumpscareScene";
import { GhostbustersScene } from "./scenes/GhostbustersScene";
import { ProtectScene } from "./scenes/ProtectScene";
import { AlanScene } from "./scenes/AlanScene";
import { PartyScene } from "./scenes/PartyScene";
import { ComedianScene } from "./scenes/ComedianScene";
import { FlyScene } from "./scenes/FlyScene";
import { HeavenHellScene } from "./scenes/HeavenHellScene";
import { CreditsScene } from "./scenes/CreditsScene";
import { ProgressiveLoadScene } from "./scenes/ProgressiveLoadScene";
import { StoragePlugin } from "./plugins/StoragePlugin";
import { AudioPlugin } from "./plugins/AudioPlugin";
import { AnalyticsPlugin } from "./plugins/AnalyticsPlugin";
import { MatterFixedStepPlugin } from "./plugins/MatterFixedStepPlugin";

let game = new Phaser.Game({
    width: 853,
    height: 480,
    plugins: {
        scene: [
            { key: "MatterFixedStepPlugin", plugin: MatterFixedStepPlugin, start: true},
        ],
        global: [
            { key: "AnalyticsPlugin", plugin: AnalyticsPlugin, mapping: 'analyticsPlugin', start: true},
            { key: "StoragePlugin", plugin: StoragePlugin, mapping: 'storagePlugin', start: true},
            { key: "AudioPlugin", plugin: AudioPlugin, mapping: 'audioPlugin', start: true},
        ] 
    },
    scale: {
        mode: Phaser.Scale.FIT,
    },
    scene: [
        LoadScene,
        ProgressiveLoadScene,
        SoundtrackScene,
        MenuScene,
        FlyScene,
        AlanScene,
        ProtectScene,
        JumpscareScene,
        ComedianScene,
        PartyScene,
        DressupScene,
        CollectScene,
        SortScene,
        GhostbustersScene,
        HeavenHellScene,
        CreditsScene
    ],

    physics: {
        default: "matter",
        matter: {
            debug: false,
            autoUpdate: false
        }
    }
});