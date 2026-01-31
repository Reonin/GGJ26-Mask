export function createTable(scene) {
    // Table placeholder - positioned in upper portion of screen
    // Flat surface for the victim's body
    const tableWidth = 6;
    const tableHeight = 3;

    const table = BABYLON.MeshBuilder.CreatePlane("table", {
        width: tableWidth,
        height: tableHeight
    }, scene);

    // Rotate to lay flat on the ground (face up toward camera)
    table.rotation.x = Math.PI / 2;

    // Position in upper center of view (negative Z is toward top of screen)
    table.position = new BABYLON.Vector3(0, 0.01, -4);

    // Placeholder material - wooden brown color for table
    const tableMat = new BABYLON.StandardMaterial("tableMat", scene);
    tableMat.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    tableMat.emissiveColor = new BABYLON.Color3(0.2, 0.12, 0.08);
    tableMat.backFaceCulling = false;
    table.material = tableMat;
    table.isPickable = false;

    return table;
}
