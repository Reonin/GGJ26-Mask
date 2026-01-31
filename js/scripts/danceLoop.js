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

    return plagueDoctor;
}
