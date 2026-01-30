import { createDancingSprite } from './scripts/danceLoop.js'
import { createTable } from './table.js';
import { createVictim } from './victim.js';
import { AudioManager } from './AudioManager.js';
import { GameManager } from './Dictionary.js';
import { HandMotions } from './HandMotions.js';
import {setUpHUD, hideTitleScreen} from './HUDConfig.js';
import { createToolManager } from './tools.js';
import { TypingTest } from './scripts/typingTest.js';

export class Main {
constructor() {
    this.audioManager;
    this.gameManager = new GameManager();
    this.light;

    const canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(canvas, true, { stencil: true });
    document.body.style.cursor = "none";

    //create typing test
    this.typingTest = new TypingTest('js/data/wordBank.json');
    
    
    const PromiseScene = this.createScene();
    PromiseScene.then(({ scene, toolManager }) => {
        this.engine.runRenderLoop(function () {
            scene.render();
        });

        scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                console.log("KEY DOWN: ", kbInfo.event.key);
                if (/^[a-zA-Z]$/.test(kbInfo.event.key)) {
                    this.audioManager.playKey(kbInfo.event.key.toLowerCase());
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
                        hideTitleScreen(this.light);
                        this.gameManager.changeRound(1, true);
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
                    case '`':
                        this.#toggleDebugger(scene);
                        break;
                }
            }
        });
    });

   this.boundResizeHandler = this.#handleResize.bind(this);
   window.addEventListener('resize', this.boundResizeHandler);
    
}

    #handleResize(event) {
        this.engine.resize();
    }

    #setupCamera(scene){
        var renderWidth = 1920;
        var renderHeight = 1080;
        const scale = 128;
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 15, 0), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        camera.orthoLeft = -renderWidth / scale;
        camera.orthoRight = renderWidth / scale;
        camera.orthoTop = renderHeight / scale;
        camera.orthoBottom = -renderHeight / scale;
    }

    async createScene() {
        const scene = new BABYLON.Scene(this.engine);
        scene.clearColor = BABYLON.Color3.Black();

        this.#setupCamera(scene);

        this.light = new BABYLON.RectAreaLight("light", new BABYLON.Vector3(0, 1, 10), 3, 10, scene);
        this.light.intensity = 0.35;
        
        //GUI
        const HUD = setUpHUD(BABYLON, scene, this.light, this.engine, this.typingTest);

        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
        
        // Create the dancing plague doctor
        const dancer = createDancingSprite(scene);
        
        const table = createTable(scene);
        const victim = createVictim(scene);

        const handMotions = new HandMotions(BABYLON, scene);

        this.audioManager = new AudioManager(BABYLON, scene);

        // Create tool manager (tools spawn on demand)
        const toolManager = createToolManager(scene);

        return { scene, toolManager };
    };
   
    #toggleDebugger(scene) {
        if(scene.debugLayer.isVisible()){
            scene.debugLayer.hide();
        }else {
            scene.debugLayer.show();
            document.body.style.cursor = "revert";
        }
    }
}
