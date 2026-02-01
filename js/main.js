import { createDancingSprite } from './scripts/danceLoop.js';
import { createTable } from './table.js';
import { createVictim } from './victim.js';
import { AudioManager } from './AudioManager.js';
import { GameManager } from './Dictionary.js';
import { HandMotions } from './HandMotions.js';
import { setUpHUD, hideTitleScreen } from './HUDConfig.js';
import { createToolManager } from './tools.js';
import { TypingTest } from './scripts/typingTest.js';
import { ToolQueue } from './ToolQueue.js';
import { VictimManager } from './VictimManager.js';

export class Main {
    constructor() {
        this.audioManager;
        this.gameManager = new GameManager();
        this.light;

        const canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(canvas, true, { stencil: true });
       

        // ---------------------------------------------------------
        // CREATE THREE TYPING TEST INSTANCES (A1 behavior)
        // ---------------------------------------------------------
        this.typingTests = {
            1: new TypingTest('js/data/wordBank.json', 1),
            2: new TypingTest('js/data/wordBank.json', 2),
            3: new TypingTest('js/data/wordBank.json', 3)
        };

        const PromiseScene = this.createScene();

        PromiseScene.then(({ scene, toolManager, handMotions }) => {
            this.engine.runRenderLoop(() => {
                scene.render();
            });

            scene.onKeyboardObservable.add((kbInfo) => {
                if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                    const key = kbInfo.event.key;
                    console.log("KEY DOWN:", key);

                    let alphabetical;
                    if (/^[a-zA-Z]$/.test(key)) {
                        this.audioManager.playKey(key.toLowerCase());
                        alphabetical = key;
                    }

                    switch (alphabetical) {
                        case 'A':
                        case 'a':
                            break;
                        case 'S':
                        case 's':
                            break;
                        case 'D':
                        case 'd':
                            break;
                        case 'Enter':
                            hideTitleScreen(this.light);
                            this.gameManager.changeRound(1, true);
                            break;
                        case 'T':
                        case 't':
                            break;
                        case 'R':
                        case 'r':
                            break;
                        case '`':
                        case '~':
                            this.#toggleDebugger(scene);
                            break;
                    }

                    switch (key) {
                        case '`':
                        case '~':
                            this.#toggleDebugger(scene);
                            break;
                    }
                }
            });
        });

        this.boundResizeHandler = this.#handleResize.bind(this);
        window.addEventListener('resize', this.boundResizeHandler);
    }

    #handleResize() {
        this.engine.resize();
    }

    #setupCamera(scene) {
        const renderWidth = 1920;
        const renderHeight = 1080;
        const scale = 128;

        const camera = new BABYLON.UniversalCamera(
            "camera",
            new BABYLON.Vector3(0, 15, 0),
            scene
        );

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

        this.light = new BABYLON.RectAreaLight(
            "light",
            new BABYLON.Vector3(0, 1, 10),
            3,
            10,
            scene
        );
        this.light.intensity = 0.35;

        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 20, height: 20 },
            scene
        );

        const dancer = createDancingSprite(scene);
        dancer.isVisible = false;


        const victim = createVictim(scene);
        const victimManager = new VictimManager(scene, createVictim);

        // ---------------------------------------------------------
        // HUD now receives ALL THREE TypingTests
        // ---------------------------------------------------------
        const HUD = await setUpHUD(
            BABYLON,
            scene,
            this.light,
            this.engine,
            this.typingTests,
            victimManager
        );

        const handMotions = new HandMotions(BABYLON, scene);
        handMotions.hide();

        this.audioManager = new AudioManager(BABYLON, scene);

        const toolManager = createToolManager(scene);
        toolManager.spawnToolbelt();
        toolManager.hide();

        const toolQueue = new ToolQueue();
        toolQueue.fillQueue(10);

        handMotions.setToolManager(toolManager);
        handMotions.setToolQueue(toolQueue);
        handMotions.setVictimManager(victimManager);

        window.gameElements = {
            dancer,
            handMotions,
            toolManager,
            victimManager
        };

        return { scene, toolManager, handMotions, toolQueue };
    }

    #toggleDebugger(scene) {
        if (scene.debugLayer.isVisible()) {
            scene.debugLayer.hide();
        } else {
            scene.debugLayer.show();
            document.body.style.cursor = "revert";
        }
    }
}
