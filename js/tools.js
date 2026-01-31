export const TOOL_NAMES = ['garlic', 'rosaries', 'cross', 'holyWater', 'scalpel'];

const TOOL_RADIUS = 0.8;

// Toolbelt configuration
const TOOLBELT = {
    z: 5,           // Bottom of screen (positive Z)
    y: 1,         // Above toolbelt background
    spacing: 2,     // Space between tools
    startX: -3.4    // Leftmost tool position
};

// Tool types with their images
const TOOL_TYPES = {
    garlic: {
        name: 'garlic',
        image: './assets/tools/garlic.svg',
        slot: 0
    },
    rosaries: {
        name: 'rosaries',
        image: './assets/tools/rosaries.svg',
        slot: 1
    },
    cross: {
        name: 'cross',
        image: './assets/tools/cross.svg',
        slot: 2
    },
    holyWater: {
        name: 'holyWater',
        image: './assets/tools/holyWater.svg',
        slot: 3
    },
    scalpel: {
        name: 'scalpel',
        image: './assets/tools/scalpel.svg',
        slot: 4
    }
};

function getToolbeltPosition(slot) {
    return {
        x: TOOLBELT.startX + (slot * TOOLBELT.spacing),
        y: TOOLBELT.y,
        z: TOOLBELT.z
    };
}

export function createToolManager(scene) {
    const tools = [];
    const spawnedTypes = new Set();
    let toolbeltMesh = null;

    // Create the toolbelt background
    function createToolbeltBackground() {
        const beltWidth = 12;
        const beltHeight = 2.4;

        const belt = BABYLON.MeshBuilder.CreatePlane("toolbelt", {
            width: beltWidth,
            height: beltHeight
        }, scene);

        belt.rotation.x = -Math.PI / 2;
        belt.position = new BABYLON.Vector3(0, 0.05, TOOLBELT.z + 0.3);
        belt.isPickable = false;

        const beltMat = new BABYLON.StandardMaterial("toolbeltMat", scene);
        beltMat.emissiveTexture = new BABYLON.Texture('./assets/tools/toolbelt.svg', scene);
        beltMat.emissiveTexture.hasAlpha = true;
        beltMat.opacityTexture = new BABYLON.Texture('./assets/tools/toolbelt.svg', scene);
        beltMat.disableLighting = true;
        beltMat.backFaceCulling = false;
        belt.material = beltMat;

        return belt;
    }

    const toolManager = {
        tools,
        spawnedTypes,

        // Spawn all tools in the toolbelt
        spawnToolbelt() {
            // Create toolbelt background if not exists
            if (!toolbeltMesh) {
                toolbeltMesh = createToolbeltBackground();
            }
            let totalTools = Object.keys(TOOL_TYPES).length;

            TOOL_NAMES.forEach(name => {
                if(totalTools == 5){
                    TOOLBELT.startX = TOOLBELT.startX - 1.4;
                }
                else if(totalTools == 4){
                    TOOLBELT.startX = TOOLBELT.startX - .14;
                }
                else if(totalTools == 3){
                    TOOLBELT.startX = TOOLBELT.startX - .3;
                }
                else if(totalTools == 2){
                    TOOLBELT.startX = TOOLBELT.startX - .2;
                }
                this.spawnTool(name);
                totalTools = totalTools - 1;

            });
            return tools;
        },

        spawnTool(specificType = null) {
            if (!specificType || !TOOL_TYPES[specificType]) return null;
            if (spawnedTypes.has(specificType)) return null;

            const toolType = TOOL_TYPES[specificType];

            const tool = BABYLON.MeshBuilder.CreateDisc("tool_" + toolType.name, {
                radius: TOOL_RADIUS,
                tessellation: 32
            }, scene);

            // Store the tool type on the mesh for reference
            tool.metadata = { toolType: toolType.name, slot: toolType.slot };
            tool.isPickable = false;

            // Rotate to lay flat on ground (face up toward camera) and flip right-side up
            tool.rotation.x = -Math.PI / 2;
            tool.rotation.z = Math.PI;  // Flip 180 degrees

            // Position in toolbelt slot
            const pos = getToolbeltPosition(toolType.slot);
            tool.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);

            // Material with tool image (unlit so colors show regardless of scene lighting)
            const toolMat = new BABYLON.StandardMaterial("toolMat_" + toolType.name, scene);
            toolMat.emissiveTexture = new BABYLON.Texture(toolType.image, scene);
            toolMat.emissiveTexture.hasAlpha = true;
            toolMat.opacityTexture = new BABYLON.Texture(toolType.image, scene);
            toolMat.disableLighting = true;
            toolMat.backFaceCulling = false;
            tool.material = toolMat;

            tools.push(tool);
            spawnedTypes.add(toolType.name);
            return tool;
        },

        removeTool(tool) {
            const index = tools.indexOf(tool);
            if (index > -1) {
                tools.splice(index, 1);
                if (tool.metadata && tool.metadata.toolType) {
                    spawnedTypes.delete(tool.metadata.toolType);
                }
                tool.dispose();
            }
        },

        removeToolByType(typeName) {
            const tool = this.getToolByType(typeName);
            if (tool) {
                this.removeTool(tool);
            }
        },

        clearAllTools() {
            tools.forEach(tool => tool.dispose());
            tools.length = 0;
            spawnedTypes.clear();
            if (toolbeltMesh) {
                toolbeltMesh.dispose();
                toolbeltMesh = null;
            }
        },

        getToolByType(typeName) {
            return tools.find(t => t.metadata && t.metadata.toolType === typeName);
        },

        isTypeSpawned(typeName) {
            return spawnedTypes.has(typeName);
        },

        getToolCount() {
            return tools.length;
        },

        hide() {
            tools.forEach(tool => tool.isVisible = false);
            if (toolbeltMesh) toolbeltMesh.isVisible = false;
        },

        show() {
            tools.forEach(tool => tool.isVisible = true);
            if (toolbeltMesh) toolbeltMesh.isVisible = true;
        }
    };

    return toolManager;
}
