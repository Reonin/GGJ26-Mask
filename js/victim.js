export function createVictim(scene) {
    // Victim placeholder - long oval on the table
    // Using a disc/ellipse shape stretched to be oval
    const victim = BABYLON.MeshBuilder.CreateDisc("victim", {
        radius: .65,
        tessellation: 32
    }, scene);

    // Scale to make it an oval (long and narrow)
    victim.scaling = new BABYLON.Vector3(3.5, 1.5, 1.5);

    // Rotate to lay flat on the table (face up toward camera)
    victim.rotation.x = Math.PI / 2;

    // Position on top of the table (same Z, slightly higher Y)
    victim.position = new BABYLON.Vector3(0, 0.02, -4);

    // Placeholder material - pale skin tone color
    const victimMat = new BABYLON.StandardMaterial("victimMat", scene);
    victimMat.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.65);
    victimMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0.2);
    victimMat.backFaceCulling = false;
    victim.material = victimMat;
    victim.isPickable = false;

    return victim;
}
