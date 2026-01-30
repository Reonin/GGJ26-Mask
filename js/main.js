import { createDancingSprite } from './scripts/danceLoop.js'
import { createTable } from './table.js';
import { createVictim } from './victim.js';
import { AudioManager } from './AudioManager.js';
import { GameManager } from './Dictionary.js';
import { HandMotions } from './HandMotions.js';
import {setUpHUD, hideTitleScreen} from './HUDConfig.js';
import { createToolManager } from './tools.js';
import { TypingTest } from './scripts/typingTest.js';

const gameManager = new GameManager();
let audioManager;
export function init() {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true, { stencil: true });
    document.body.style.cursor = "none";

    //create typing test
    const typingTest = new TypingTest('js/data/wordBank.json');
    
    const createScene = async function () {
        const scene = new BABYLON.Scene(engine);
        
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 15, 0), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -0.400), scene);
        light.intensity = 0.25;
        
        //GUI
        const HUD = setUpHUD(BABYLON, scene);

        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
        
        // Create the dancing plague doctor
        const dancer = createDancingSprite(scene);
        
        const table = createTable(scene);
        const victim = createVictim(scene);

        const handMotions = new HandMotions(BABYLON, scene);

        audioManager = new AudioManager(BABYLON, scene);

        // Create tool manager (tools spawn on demand)
        const toolManager = createToolManager(scene);

        return { scene, toolManager };
    };
    
    const PromiseScene = createScene();
    PromiseScene.then(({ scene, toolManager }) => {
        engine.runRenderLoop(function () {
            scene.render();
        });

        scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                console.log("KEY DOWN: ", kbInfo.event.key);
                if (/^[a-zA-Z]$/.test(kbInfo.event.key)) {
                    audioManager.playKey(kbInfo.event.key.toLowerCase());
                }
                switch (kbInfo.event.key) {
                    case 'A':
                    case 'a':
                        break;
                    case 'S':
                    case 's':
                        break;
                    case 'D':
                    case 'd':
                        break;
                    case ' ':
                        hideTitleScreen();
                        gameManager.changeRound(1, true);
                        break;
                    case 'T':
                    case 't':
                        // Test: spawn a tool
                        toolManager.spawnTool();
                        break;
                    case 'R':
                    case 'r':
                        // Test: remove a random tool
                        toolManager.removeRandomTool();
                        break;
                }
            }
        });
    });
    
    window.addEventListener("resize", function () {
        engine.resize();
    });
}