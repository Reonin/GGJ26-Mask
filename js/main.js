import { createDancingSprite } from './scripts/danceLoop.js'
import { createTable } from './table.js';
import { createVictim } from './victim.js';
import { AudioManager } from './AudioManager.js';
import { GameManager } from './Dictionary.js';
import { HandMotions } from './HandMotions.js';
import {setUpHUD, hideTitleScreen} from './HUDConfig.js';

const gameManager = new GameManager();
export function init() {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true, { stencil: true });
    
    const createScene = async function () {
        const scene = new BABYLON.Scene(engine);
        
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 15, 0), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -0.400), scene);
        light.intensity = 0.25;
        
        //GUI
        const HUD = setUpHUD(BABYLON, scene);

        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
        
        // Create the dancing sprite instead of plague doctor
        const dancer = createDancingSprite(scene);  // Change this line
        
        const table = createTable(scene);
        const victim = createVictim(scene);

        const handMotions = new HandMotions(BABYLON, scene);
   
        const audioManager = new AudioManager(BABYLON, scene);
    
        return scene;
    };
    
    const PromiseScene = createScene();
    PromiseScene.then(scene => {
        engine.runRenderLoop(function () {
            scene.render();
        });
        
       
        scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                console.log("KEY DOWN: ", kbInfo.event.key);
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
                }
            }
        });
    });
    
    window.addEventListener("resize", function () {
        engine.resize();
    });
}