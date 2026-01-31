export class HandMotions {
    constructor(BABYLON, scene){
        let followingSprite;
        let isGrabbing = false;
        let currentFrame = 0;
        let animationTimer = 0;
        const FRAME_DURATION = 100; // milliseconds per frame

        // Create a sprite manager for the hand animations
        // Your sprite sheet: 1536 width / 3 frames = 512 per frame
        const spriteManager = new BABYLON.SpriteManager(
            "handSpriteManager", 
            "/js/sprites/handgrab.png", // Your sprite sheet path
            1, // Only need 1 sprite instance
            512, // Cell size (512x512 per frame)
            scene
        );

        // Create the sprite
        followingSprite = new BABYLON.Sprite("handSprite", spriteManager);
        followingSprite.width = 5; // Width in world units
        followingSprite.height = 5; // Height in world units
        followingSprite.position = new BABYLON.Vector3(0, 5, 0);
        followingSprite.cellIndex = 0; // Start with frame 0 (idle hand)
        
        // Make sure sprite is visible
        followingSprite.isVisible = true;

        console.log("Sprite created:", followingSprite);
        console.log("Sprite manager:", spriteManager);

        scene.onPointerMove = function (evt) {
            const pickResult = scene.pick(evt.clientX, evt.clientY);
            
            if(followingSprite.position.x > 2){
                 console.log("%c Left", "color: orange; font-size: 20px; font-weight: bold;");
            }else if(followingSprite.position.x < -2) {
                 console.log("%c Right", "color: green; font-size: 20px; font-weight: bold;");
            }else {
                console.log("%c Center", "color: white; font-size: 20px; font-weight: bold;");
            }
            
            if (pickResult.hit) {
                followingSprite.position.x = pickResult.pickedPoint.x;
                followingSprite.position.y = 5;
                followingSprite.position.z = pickResult.pickedPoint.z;
            }
        };

        // Click to start grab animation
        scene.onPointerDown = function (evt) {
            if (evt.button === 0 && !isGrabbing) { // Left click
                isGrabbing = true;
                currentFrame = 0;
                animationTimer = 0;
                console.log("Grab animation started");
            }
        };

        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);

        const pivotNode = new BABYLON.TransformNode("pivot", scene);
        pivotNode.position = new BABYLON.Vector3(0, 0, 0);

        box.setParent(pivotNode);
        box.position.y = -1;

        const linePoints = [pivotNode.absolutePosition, followingSprite.position];
        const line = BABYLON.MeshBuilder.CreateLines("line", { points: linePoints }, scene);
        line.color = new BABYLON.Color3(0, 0, 0);
        line.enableEdgesRendering();
        line.edgesWidth = 100;
        line.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

        let lastTime = Date.now();

        scene.onBeforeRenderObservable.add(() => {
            // Update line position
            line.setVerticesData(BABYLON.VertexBuffer.PositionKind, [
                pivotNode.absolutePosition.x, pivotNode.absolutePosition.y, pivotNode.absolutePosition.z,
                followingSprite.position.x, followingSprite.position.y, followingSprite.position.z
            ]);

            // Handle grab animation
            if (isGrabbing) {
                const currentTime = Date.now();
                const deltaTime = currentTime - lastTime;
                animationTimer += deltaTime;

                if (animationTimer >= FRAME_DURATION) {
                    currentFrame++;
                    animationTimer = 0;

                    if (currentFrame >= 3) { // After 3 frames (0, 1, 2)
                        currentFrame = 0;
                        isGrabbing = false;
                        followingSprite.cellIndex = 0; // Return to idle
                    } else {
                        followingSprite.cellIndex = currentFrame;
                    }
                }

                lastTime = currentTime;
            } else {
                lastTime = Date.now();
                followingSprite.cellIndex = 0; // Idle frame
            }
        });
    }
}
