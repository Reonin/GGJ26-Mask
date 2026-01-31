import {resetToDefault} from './HUDConfig.js';
import { TOOL_NAMES } from './tools.js';

// VictimManager.js
export class VictimManager {
    constructor(scene, createVictimFunc) {
        this.scene = scene;
        this.createVictimFunc = createVictimFunc;
        this.victims = [];
        this.maxVictims = 6;
        this.spawnInterval = 15000; // 3 seconds between spawns
        this.lastSpawnTime = 0;
        this.gameOver = false;
        this.activeVictimIndex = 0;
        
        this.patientPositions = [
            {hori:0, vert: 8},
            {hori: 7, vert: 8},
            {hori:-7, vert: 8},
    
        ];
        
        // Track which positions are occupied
        this.occupiedPositions = new Set();
        // Track available positions (start with all positions available)
        this.availablePositions = new Set([0, 1, 2, 3, 4, 5]);
        
        // Create single static health bar
        this.createStaticHealthBar();
    }

    createStaticHealthBar() {
        const healthBarWidth = 8;
        const healthBarHeight = 0.6;
        
        // Background bar (red)
        this.healthBarBg = BABYLON.MeshBuilder.CreatePlane("staticHealthBarBg", {
            width: healthBarWidth,
            height: healthBarHeight
        }, this.scene);
        this.healthBarBg.position = new BABYLON.Vector3(0, 0.1, 4); // Static position
        this.healthBarBg.rotation.x = Math.PI / 2;
        
        const bgMaterial = new BABYLON.StandardMaterial("staticHealthBgMat", this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
        bgMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
        this.healthBarBg.material = bgMaterial;
        this.healthBarBg.isPickable = false;

        // Foreground bar (green)
        this.healthBarFg = BABYLON.MeshBuilder.CreatePlane("staticHealthBarFg", {
            width: healthBarWidth,
            height: healthBarHeight
        }, this.scene);
        this.healthBarFg.position = new BABYLON.Vector3(0, 0.11, 4); // Static position
        this.healthBarFg.rotation.x = Math.PI / 2;
        
        this.fgMaterial = new BABYLON.StandardMaterial("staticHealthFgMat", this.scene);
        this.fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        this.fgMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
        this.healthBarFg.material = this.fgMaterial;
        this.healthBarFg.isPickable = false;

        this.healthBarWidth = healthBarWidth;
        
        // Hide initially
        this.healthBarBg.isVisible = false;
        this.healthBarFg.isVisible = false;
    }

    updateHealthBar() {
        const activeVictim = this.getActiveVictim();
        
        if (!activeVictim) {
            this.healthBarBg.isVisible = false;
            this.healthBarFg.isVisible = false;
            return;
        }
        
        // Show health bar
        this.healthBarBg.isVisible = true;
        this.healthBarFg.isVisible = true;
        
        const healthPercent = activeVictim.currentHealth / activeVictim.maxHealth;
        this.healthBarFg.scaling.x = healthPercent;
        
        // Fill from left to right
        const offset = (this.healthBarWidth * (1 - healthPercent)) / 2;
        this.healthBarFg.position.x = -offset;
        
        // Change color based on health
        if (healthPercent > 0.5) {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        } else if (healthPercent > 0.25) {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        } else {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        }
    }

    // Get a random tool name
    getRandomTool() {
        return TOOL_NAMES[Math.floor(Math.random() * TOOL_NAMES.length)];
    }

    // Get the required tool for the active victim
    getActiveVictimTool() {
        const victim = this.getActiveVictim();
        return victim ? victim.requiredTool : null;
    }

    // Check if active victim's tool has been used
    isActiveVictimReady() {
        const victim = this.getActiveVictim();
        return victim ? victim.toolUsed : false;
    }

    // Use a tool on the active victim
    useToolOnVictim(toolName) {
        const victim = this.getActiveVictim();
        if (!victim) return false;

        if (toolName === victim.requiredTool) {
            victim.toolUsed = true;
            console.log(`%cCorrect tool! ${toolName} used on victim. Typing enabled!`, "color: lime; font-size: 16px;");
            return true;
        } else {
            console.log(`%cWrong tool! Needed: ${victim.requiredTool}, got: ${toolName}`, "color: red; font-size: 16px;");
            return false;
        }
    }

    start() {
        console.log("%cVictimManager started!", "color: lime; font-size: 16px;");
        this.lastSpawnTime = Date.now();
        for (let index = 0; index < 3; index++) {
            this.spawnVictim();
        }
       
        
        this.scene.onBeforeRenderObservable.add(() => {
            if (window.gameStarted && !this.gameOver) {
                //this.update();
                this.updateHealthBar(); // Update health bar every frame
            }
        });
    }

    // update() {
    //     const currentTime = Date.now();
        
    //     // Check if we should spawn a new victim and have available positions
    //     if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
    //         if (this.victims.length < this.maxVictims && this.availablePositions.size > 0) {
    //             this.spawnVictim();
    //             this.lastSpawnTime = currentTime;
    //         }
    //     }

    //     // Check if max victims reached
    //     if (this.victims.length >= this.maxVictims) {
    //         this.triggerGameOver();
    //     }

    //     // Check if active victim is healed
    //     const activeVictim = this.getActiveVictim();
    //     if (activeVictim && activeVictim.currentHealth >= activeVictim.maxHealth) {
    //         this.healVictim(this.activeVictimIndex);
    //     }
    // }

    getNextAvailablePosition() {
        // Get first available position from the Set
        const positionIndex = this.availablePositions.values().next().value;
        return positionIndex;
    }

    spawnVictim() {
        console.log("%cAttempting to spawn victim...", "color: yellow; font-size: 14px;");
        
        const positionIndex = this.getNextAvailablePosition();
        if (positionIndex === undefined) {
            console.log("%cNo available positions!", "color: red; font-size: 14px;");
            return;
        }
        
        const victim = this.createVictimFunc(this.scene, positionIndex);
        victim.currentHealth = 0;
        victim.positionIndex = positionIndex;
        victim.isVisible = true;

        // Assign a random required tool to this victim
        victim.requiredTool = this.getRandomTool();
        victim.toolUsed = false;
        console.log(`%cVictim needs tool: ${victim.requiredTool}`, "color: cyan; font-size: 14px;");

        victim.position.x = this.patientPositions[positionIndex].hori;
        victim.position.z = this.patientPositions[positionIndex].vert;
        victim.position.y = 5;
        
        this.occupiedPositions.add(positionIndex);
        this.availablePositions.delete(positionIndex);

        this.victims.push(victim);

        console.log(`%cVictim spawned at position ${positionIndex} (x=${victim.position.x}, z=${victim.position.z})`,
            "color: orange; font-size: 14px;");
        console.log(`%cOccupied: [${Array.from(this.occupiedPositions)}], Available: [${Array.from(this.availablePositions)}]`,
            "color: cyan; font-size: 12px;");

        this.updateHealthBar();

        // Update tool indicator for first/active victim
        if (this.victims.length === 1 && window.updateToolBubble) {
            window.updateToolBubble(victim.requiredTool);
        }

        return victim;
    }

    getActiveVictim() {
        return this.victims[this.activeVictimIndex] || null;
    }

    healActiveVictim(amount) {
        const victim = this.getActiveVictim();
        if (victim) {
            victim.currentHealth = Math.max(0, Math.min(victim.maxHealth, victim.currentHealth + amount));
            this.updateHealthBar(); // Update when health changes
            console.log(`Active victim health: ${victim.currentHealth}/${victim.maxHealth}`);
        }
    }

    healVictim(index) {
        const victim = this.victims[index];
        if (victim) {
            const positionIndex = victim.positionIndex;

            console.log(`%cVictim at position ${positionIndex} healed and removed!`,
                "color: lime; font-size: 16px; font-weight: bold;");

            victim.isVisible = false;

            this.occupiedPositions.delete(positionIndex);
            this.availablePositions.add(positionIndex);

            this.victims.splice(index, 1);

            console.log(`%cPosition ${positionIndex} freed. Available: [${Array.from(this.availablePositions)}]`,
                "color: lime; font-size: 12px;");

            if (this.activeVictimIndex >= this.victims.length) {
                this.activeVictimIndex = 0;
            }

            this.updateHealthBar();

            // Update tool indicator to show next victim's required tool
            const nextVictim = this.getActiveVictim();
            if (nextVictim && window.updateToolBubble) {
                window.updateToolBubble(nextVictim.requiredTool);
            }
        }
    }

    triggerGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            window.gameStarted = false;
            console.log("%cGAME OVER - Too many victims!", "color: red; font-size: 24px; font-weight: bold;");
            resetToDefault();
            
            if (window.onGameOver) {
                window.onGameOver("Too Many Victims!");
            }
            this.reset();
        }
    }

    getVictimCount() {
        return this.victims.length;
    }

    reset() {
        this.victims.forEach(victim => {
            victim.isVisible = false;
        });
        
        this.victims = [];
        this.activeVictimIndex = 0;
        this.gameOver = false;
        this.lastSpawnTime = 0;
        
        this.occupiedPositions.clear();
        this.availablePositions = new Set([0, 1, 2, 3, 4, 5]);
        
        // Hide health bar
        this.healthBarBg.isVisible = false;
        this.healthBarFg.isVisible = false;
    }
}