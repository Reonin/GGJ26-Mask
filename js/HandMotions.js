export class HandMotions {
    constructor(BABYLON, scene){
        const gloveColor = new BABYLON.Color3(1, 1, 1);
        const gloveMaterial = new BABYLON.StandardMaterial("material", scene);
        gloveMaterial.diffuseColor = gloveColor; // Red color for visibility
        // gloveMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

        const followingMesh = BABYLON.MeshBuilder.CreateSphere("followingMesh", {diameter: 0.4}, scene);
        followingMesh.material = gloveMaterial;
        followingMesh.isPickable = false;

        const fingers = [];
        for (let index = 0; index < 5; index++) {
            var finger = BABYLON.MeshBuilder.CreateSphere("ellipsoid", {
                diameterX: 0.05,
                diameterY: 0.05,
                diameterZ: 0.5,
            }, scene);
            finger.material = gloveMaterial;
            finger.setParent(followingMesh);
            finger.position.z = -0.25;
            finger.isPickable = false;
            fingers.push(finger);

        }
        
        fingers[0].position.x = 0; // middle
        fingers[1].position.x = -0.10; 
        fingers[2].position.x = -0.20; 
        fingers[3].position.x = 0.1; 
        fingers[4].position.x = 0.20; //thumb
        fingers[4].position.z = -0.05;
        fingers[4].rotation.y = -0.523599; //radians


        scene.onPointerMove = function (evt) {
            // Use scene.pick() with predicate to only pick the ground
            const pickResult = scene.pick(evt.clientX, evt.clientY, (mesh) => mesh.name === "ground");
            // console.log(followingMesh.position.x)
            if(followingMesh.position.x > 2){
                 console.log("%c Left", "color: orange; font-size: 20px; font-weight: bold;");
            }else if(followingMesh.position.x < -2) {
                 console.log("%c Right", "color: green; font-size: 20px; font-weight: bold;");
            }else {
                console.log("%c Center", "color: white; font-size: 20px; font-weight: bold;");
            }
            // Check if the ray intersected with the ground
            if (pickResult.hit) {
                // Update the position of the following mesh to the picked point
                followingMesh.position.x = pickResult.pickedPoint.x;
                followingMesh.position.y = 5; // May need adjustment for height
                followingMesh.position.z = pickResult.pickedPoint.z;
            }
        };



        // Assuming 'scene' is your BABYLON.Scene object
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
        box.isPickable = false;

        // 1. Create a TransformNode as a pivot
        const pivotNode = new BABYLON.TransformNode("pivot", scene);
        // Position the pivot node at the desired world position (e.g., origin for now)
        pivotNode.position = new BABYLON.Vector3(0, 0, 0);

        // 2. Parent the box to the pivot node
        // The box's local position is now relative to pivotNode
        // To place the box's bottom at the pivot node's position, offset it locally
        box.setParent(pivotNode);
        box.position.y = -1; // Box height is 2, so local Y of 1 puts the bottom at Y=0 of the parent

  
        // 3. Create the line mesh
        // The line starts at the pivot node's absolute position and ends at the sphere's position
        const linePoints = [pivotNode.absolutePosition, followingMesh.position];
        const line = BABYLON.MeshBuilder.CreateLines("line", { points: linePoints }, scene);
        line.color = new BABYLON.Color3(0, 0, 0);
        line.enableEdgesRendering();
        line.edgesWidth = 100;
        line.edgesColor = new BABYLON.Color4(0, 0, 0, 1);
        line.isPickable = false;

        // 4. Update the line in the render loop if objects are moving
        scene.onBeforeRenderObservable.add(() => {
            // If the pivot or sphere moves, update the line's points
            line.setVerticesData(BABYLON.VertexBuffer.PositionKind, [
                pivotNode.absolutePosition.x, pivotNode.absolutePosition.y, pivotNode.absolutePosition.z,
                followingMesh.position.x, followingMesh.position.y, followingMesh.position.z
            ]);
        });
    }

        
    
}
