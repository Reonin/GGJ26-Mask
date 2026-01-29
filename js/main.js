import { createPlagueDoctor } from './plagueDoctor.js';
import { createTable } from './table.js';
import { createVictim } from './victim.js';
import { AudioManager } from './AudioManager.js';
import { GameManager } from './Dictionary.js';

const gameManager = new GameManager();
export function init() {

    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true, { stencil: true }); // Generate the BABYLON 3D engine

    const createScene = async function () {
        // Creates a basic Babylon Scene object
        const scene = new BABYLON.Scene(engine);
        // Creates and positions a free camera
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 15, 0), scene);
        // Targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        // camera.attachControl(canvas, true);
        // Creates a light, aiming 0,1,0 - to the sky
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -0.400), scene);
        // Dim the light a small amount - 0 to 1
        light.intensity = 0.5;

        // Our built-in 'ground' shape.
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);

        // Create the plague doctor placeholder
        const plagueDoctor = createPlagueDoctor(scene);

        // Create the table placeholder
        const table = createTable(scene);

        // Create the victim placeholder on the table
        const victim = createVictim(scene);

   
        const audioManager = new AudioManager(BABYLON, scene);
       
        return scene;
    };


    const PromiseScene = createScene(); //Call the createScene function that returns a promise
    PromiseScene.then(scene => {
        // scene.debugLayer.show();//show debugger
        // Register a render loop to repeatedly render the scene
        engine.runRenderLoop(function () {
            scene.render();
        });
        
       
        scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
                console.log("KEY DOWN: ", kbInfo.event.key);
                switch (kbInfo.event.key) {
                    case 'A':
                    case 'a':
                        audioManager.error.then(s => s.play());
                        break;
                    case 'S':
                    case 's':
                        
                        break;
                    case 'D':
                    case 'd':
                        break;
                    case ' ':
                        gameManager.changeRound(1, true);
                        break;
                }
            }
            else if (kbInfo.type == BABYLON.KeyboardEventTypes.KEYUP) {
               
            }
        });


    })

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
}