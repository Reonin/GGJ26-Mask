export function createVictim(scene, index = 0) {
    const victim = BABYLON.MeshBuilder.CreateDisc("victim", {
        radius: .65,
        tessellation: 32
    }, scene);

    victim.scaling = new BABYLON.Vector3(3.5, 1.5, 1.5);
    victim.rotation.x = Math.PI / 2;
    victim.position = new BABYLON.Vector3(0, 0.02, -4);

    const victimMat = new BABYLON.StandardMaterial("victimMat", scene);
    victimMat.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.65);
    victimMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0.2);
    victimMat.backFaceCulling = false;
    victim.material = victimMat;
    victim.isPickable = false;

    victim.maxHealth = 200;
    victim.currentHealth = 0;
    victim.drainRate = 0;
    victim.isDead = false;

    // NO health bars created here anymore

    victim.isVisible = false;

    return victim;
}