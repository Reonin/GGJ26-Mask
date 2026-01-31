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
        this.BABYLON = BABYLON;
        this.scene = scene;
        this.heldTool = null;
        this.toolManager = null;
        this.toolQueue = null;

        // Victim drop zone (matches victim position from victim.js)
        this.victimZone = {
            x: 0,
            z: -4,
            radius: 2.5 // How close to victim center to count as "on victim"
        };

        const gloveColor = new BABYLON.Color3(1, 1, 1);
        const gloveMaterial = new BABYLON.StandardMaterial("material", scene);
        gloveMaterial.albedoColor = gloveColor;
        gloveMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

        this.followingMesh = BABYLON.MeshBuilder.CreateSphere("followingMesh", {diameter: 0.4 } , scene);
        this.followingMesh.material = gloveMaterial;
        const followingMesh = this.followingMesh;

        // Create the sprite
        followingSprite = new BABYLON.Sprite("handSprite", spriteManager);
        followingSprite.width = 5; // Width in world units
        followingSprite.height = 5; // Height in world units
        followingSprite.position = new BABYLON.Vector3(0, 5, 0);
        followingSprite.cellIndex = 0; // Start with frame 0 (idle hand)
        this.followingSprite = followingSprite; // Store for pickup methods

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

        // Click to start grab animation and pickup/drop tools
        scene.onPointerDown = (evt) => {
            if (evt.button === 0 && !isGrabbing) { // Left click
                isGrabbing = true;
                currentFrame = 0;
                animationTimer = 0;
                console.log("Grab animation started");

                // Pickup or drop tool
                if (this.isHoldingTool()) {
                    this.dropTool();
                } else {
                    this.tryPickupTool();
                }
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

        // 4. Update the line in the render loop if objects are moving
        const self = this;
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

            // Make held tool follow the hand
            if (self.heldTool) {
                self.heldTool.position.x = followingSprite.position.x;
                self.heldTool.position.z = followingSprite.position.z + 1.5; // Offset down from hand
                self.heldTool.position.y = 1.5; // Hold above ground
            }
        });
    }

    setToolManager(toolManager) {
        this.toolManager = toolManager;
    }

    setToolQueue(toolQueue) {
        this.toolQueue = toolQueue;
    }

    isOverVictim() {
        const handPos = this.followingSprite.position;
        const dx = handPos.x - this.victimZone.x;
        const dz = handPos.z - this.victimZone.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < this.victimZone.radius;
    }

    getHandPosition() {
        return this.followingSprite.position;
    }

    tryPickupTool() {
        if (this.heldTool) {
            console.log("Already holding a tool!");
            return false;
        }

        if (!this.toolManager) {
            console.log("No tool manager set!");
            return false;
        }

        const handPos = this.followingSprite.position;
        const pickupRadius = 1.5;

        // Find nearest tool within pickup radius
        for (const tool of this.toolManager.tools) {
            const dx = tool.position.x - handPos.x;
            const dz = tool.position.z - handPos.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < pickupRadius) {
                this.heldTool = tool;
                tool.metadata.originalPosition = tool.position.clone();
                console.log("Picked up: " + tool.metadata.toolType);
                return true;
            }
        }

        console.log("No tool nearby to pick up");
        return false;
    }

    dropTool() {
        if (!this.heldTool) {
            return null;
        }

        const droppedTool = this.heldTool;
        const toolType = droppedTool.metadata.toolType;

        // Check if dropping on victim - use the tool
        if (this.isOverVictim() && this.toolQueue) {
            this.toolQueue.useTool(toolType);
        }

        // Return tool to original position in toolbelt
        if (droppedTool.metadata.originalPosition) {
            droppedTool.position = droppedTool.metadata.originalPosition;
        }

        this.heldTool = null;
        console.log("Dropped: " + toolType);
        return droppedTool;
    }

    getHeldTool() {
        return this.heldTool;
    }

    isHoldingTool() {
        return this.heldTool !== null;
    }
}
