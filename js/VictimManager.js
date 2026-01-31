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
    }

    updateAllHealthBars() {
        // Update health bars for all victims
        this.victims.forEach(victim => {
            if (victim.updateHealthBar) {
                victim.updateHealthBar();
            }
        });
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
                this.updateAllHealthBars();
            }
        });
    }

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

        // Show victim's health bar
        victim.healthBarBg.isVisible = true;
        victim.healthBarFg.isVisible = true;
        victim.updateHealthBar();

        this.occupiedPositions.add(positionIndex);
        this.availablePositions.delete(positionIndex);

        this.victims.push(victim);

        console.log(`%cVictim spawned at position ${positionIndex} (x=${victim.position.x}, z=${victim.position.z})`,
            "color: orange; font-size: 14px;");
        console.log(`%cOccupied: [${Array.from(this.occupiedPositions)}], Available: [${Array.from(this.availablePositions)}]`,
            "color: cyan; font-size: 12px;");

        return victim;
    }

    getActiveVictim() {
        return this.victims[this.activeVictimIndex] || null;
    }

    healActiveVictim(amount) {
        const victim = this.getActiveVictim();
        if (victim) {
            victim.modifyHealth(amount);
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
            victim.healthBarBg.isVisible = false;
            victim.healthBarFg.isVisible = false;

            this.occupiedPositions.delete(positionIndex);
            this.availablePositions.add(positionIndex);

            this.victims.splice(index, 1);

            console.log(`%cPosition ${positionIndex} freed. Available: [${Array.from(this.availablePositions)}]`,
                "color: lime; font-size: 12px;");

            if (this.activeVictimIndex >= this.victims.length) {
                this.activeVictimIndex = 0;
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
            victim.healthBarBg.isVisible = false;
            victim.healthBarFg.isVisible = false;
        });

        this.victims = [];
        this.activeVictimIndex = 0;
        this.gameOver = false;
        this.lastSpawnTime = 0;

        this.occupiedPositions.clear();
        this.availablePositions = new Set([0, 1, 2, 3, 4, 5]);
    }
}