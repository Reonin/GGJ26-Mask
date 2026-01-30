export const TOOL_NAMES = ['garlic', 'rosaries', 'cross', 'holyWater', 'scalpel'];
const TOOL_RADIUS = 0.4;
const MIN_DISTANCE = 4; // Minimum distance between tools
const MAX_SPAWN_ATTEMPTS = 20; // Max attempts to find valid position

// Tool types with their images
const TOOL_TYPES = {
    garlic: {
        name: 'garlic',
        image: './assets/tools/garlic.svg'
    },
    rosaries: {
        name: 'rosaries',
        image: './assets/tools/rosaries.svg'
    },
    cross: {
        name: 'cross',
        image: './assets/tools/cross.svg'
    },
    holyWater: {
        name: 'holyWater',
        image: './assets/tools/holyWater.svg'
    },
    scalpel: {
        name: 'scalpel',
        image: './assets/tools/scalpel.svg'
    }
};

const ALL_TOOL_NAMES = Object.keys(TOOL_TYPES);
const MAX_TOOLS = ALL_TOOL_NAMES.length;

// Bounds for random placement (visible area from camera)
const BOUNDS = {
    minX: -8,
    maxX: 8,
    minZ: -6,
    maxZ: 6
};

function getRandomPosition() {
    const x = BOUNDS.minX + Math.random() * (BOUNDS.maxX - BOUNDS.minX);
    const z = BOUNDS.minZ + Math.random() * (BOUNDS.maxZ - BOUNDS.minZ);
    return { x, z };
}

function distanceBetween(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
}

function findValidPosition(tools) {
    for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
        const pos = getRandomPosition();
        let valid = true;

        for (const tool of tools) {
            const dist = distanceBetween(pos, { x: tool.position.x, z: tool.position.z });
            if (dist < MIN_DISTANCE) {
                valid = false;
                break;
            }
        }

        if (valid) return pos;
    }
    // Fallback to random position if can't find valid one
    return getRandomPosition();
}

export function createToolManager(scene) {
    const tools = [];
    const spawnedTypes = new Set(); // Track which tool types are on screen

    const toolManager = {
        tools,
        spawnedTypes,

        spawnTool(specificType = null) {
            if (tools.length >= MAX_TOOLS) return null;

            // Determine which tool type to spawn
            let toolType;
            if (specificType && TOOL_TYPES[specificType] && !spawnedTypes.has(specificType)) {
                toolType = TOOL_TYPES[specificType];
            } else {
                // Find an unspawned tool type
                const available = ALL_TOOL_NAMES.filter(name => !spawnedTypes.has(name));
                if (available.length === 0) return null;
                const randomName = available[Math.floor(Math.random() * available.length)];
                toolType = TOOL_TYPES[randomName];
            }

            const tool = BABYLON.MeshBuilder.CreateDisc("tool_" + toolType.name, {
                radius: TOOL_RADIUS,
                tessellation: 32
            }, scene);

            // Store the tool type on the mesh for reference
            tool.metadata = { toolType: toolType.name };

            // Rotate to lay flat on ground (face up toward camera)
            tool.rotation.x = -Math.PI / 2;

            // Find position far from other tools
            const pos = findValidPosition(tools);
            tool.position = new BABYLON.Vector3(pos.x, 0.1, pos.z);

            // Material with tool image
            const toolMat = new BABYLON.StandardMaterial("toolMat_" + toolType.name, scene);
            toolMat.diffuseTexture = new BABYLON.Texture(toolType.image, scene);
            toolMat.diffuseTexture.hasAlpha = true;
            toolMat.useAlphaFromDiffuseTexture = true;
            toolMat.emissiveTexture = new BABYLON.Texture(toolType.image, scene);
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

        removeRandomTool() {
            if (tools.length === 0) return;
            const index = Math.floor(Math.random() * tools.length);
            const tool = tools[index];
            tools.splice(index, 1);
            if (tool.metadata && tool.metadata.toolType) {
                spawnedTypes.delete(tool.metadata.toolType);
            }
            tool.dispose();
        },

        clearAllTools() {
            tools.forEach(tool => tool.dispose());
            tools.length = 0;
            spawnedTypes.clear();
        },

        getToolByType(typeName) {
            return tools.find(t => t.metadata && t.metadata.toolType === typeName);
        },

        isTypeSpawned(typeName) {
            return spawnedTypes.has(typeName);
        },

        spawnMultiple(count) {
            const spawned = [];
            for (let i = 0; i < count && tools.length < MAX_TOOLS; i++) {
                const tool = this.spawnTool();
                if (tool) spawned.push(tool);
            }
            return spawned;
        },

        getToolCount() {
            return tools.length;
        }
    };

    return toolManager;
}
