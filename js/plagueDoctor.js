export function createPlagueDoctor(scene) {
    // Plague doctor placeholder - positioned in lower center of screen
    // Using a plane since this is 2D, rotated flat on ground
    const plagueDoctorHeight = 5; // Takes up roughly 1/3 of visible height
    const plagueDoctorWidth = 3;

    const plagueDoctor = BABYLON.MeshBuilder.CreatePlane("plagueDoctor", {
        width: plagueDoctorWidth,
        height: plagueDoctorHeight
    }, scene);

    // Rotate to lay flat on the ground (face up toward camera)
    plagueDoctor.rotation.x = Math.PI / 2;

    // Position in lower center of view (positive Z is toward bottom of screen)
    plagueDoctor.position = new BABYLON.Vector3(0, 0.01, 4);

    // Placeholder material - dark color to represent plague doctor silhouette
    const plagueDoctorMat = new BABYLON.StandardMaterial("plagueDoctorMat", scene);
    plagueDoctorMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.18);
    plagueDoctorMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.12);
    plagueDoctorMat.backFaceCulling = false;
    plagueDoctor.material = plagueDoctorMat;

    return plagueDoctor;
}
