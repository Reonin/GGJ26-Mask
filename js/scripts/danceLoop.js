export function createDancingSprite(scene) {
    // Create sprite manager with your sprite sheet
    const spriteManager = new BABYLON.SpriteManager(
        "plagueDoctorManager",
        "js/sprites/dancingDoc.png",  // Changed from ../ to ./
        10,
        500,
        scene
    );

    const plagueDoctor = new BABYLON.Sprite("plagueDoctor", spriteManager);
    plagueDoctor.position = new BABYLON.Vector3(0, 1, 2);

    plagueDoctor.width = 5;
    plagueDoctor.height = 5;

    plagueDoctor.playAnimation(0, 4, true, 300);

    // Create speech bubble background as a disc in world space
    const bubbleDisc = BABYLON.MeshBuilder.CreateDisc("bubbleDisc", { radius: 0.6, tessellation: 32 }, scene);
    bubbleDisc.position = new BABYLON.Vector3(0, 1.9, -.8);
    bubbleDisc.rotation.x = Math.PI / 2; // Face up toward camera
    bubbleDisc.isPickable = false;
    bubbleDisc.isVisible = false; // Hidden until game starts

    const bubbleMat = new BABYLON.StandardMaterial("bubbleMat", scene);
    bubbleMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    bubbleMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    bubbleMat.disableLighting = true;
    bubbleMat.backFaceCulling = false;
    bubbleDisc.material = bubbleMat;

    // Create tool indicator plane on top of bubble
    const toolIndicator = BABYLON.MeshBuilder.CreatePlane("toolIndicator", { size: 0.9 }, scene);
    toolIndicator.position = new BABYLON.Vector3(0, 2.1, -.8);
    toolIndicator.rotation.x = -Math.PI / 2; // Face up toward camera
    toolIndicator.isPickable = false;
    toolIndicator.isVisible = false; // Hidden until game starts

    const toolMat = new BABYLON.StandardMaterial("toolIndicatorMat", scene);
    toolMat.emissiveTexture = new BABYLON.Texture("./assets/tools/cross.svg", scene);
    toolMat.emissiveTexture.hasAlpha = true;
    toolMat.opacityTexture = toolMat.emissiveTexture;
    toolMat.disableLighting = true;
    toolMat.backFaceCulling = false;
    toolIndicator.material = toolMat;

    // Tool image paths
    const toolImages = {
        garlic: "./assets/tools/garlic.svg",
        rosaries: "./assets/tools/rosaries.svg",
        cross: "./assets/tools/cross.svg",
        holyWater: "./assets/tools/holyWater.svg",
        scalpel: "./assets/tools/scalpel.svg"
    };

    // Function to update the bubble image
    const updateBubble = (toolName) => {
        if (toolName && toolImages[toolName]) {
            toolMat.emissiveTexture = new BABYLON.Texture(toolImages[toolName], scene);
            toolMat.emissiveTexture.hasAlpha = true;
            toolMat.opacityTexture = toolMat.emissiveTexture;
            // Only show if game has started
            if (window.gameStarted) {
                bubbleDisc.isVisible = true;
                toolIndicator.isVisible = true;
            }
        } else {
            bubbleDisc.isVisible = false;
            toolIndicator.isVisible = false;
        }
    };

    // Store bubble references globally so they can be shown when game starts
    window.toolBubble = { bubbleDisc, toolIndicator };

    // Store update function globally so ToolQueue can access it
    window.updateToolBubble = updateBubble;

    return plagueDoctor;
}
