import {resetToDefault} from './HUDConfig.js';
import { TOOL_NAMES } from './tools.js';

// VictimManager.js
export class VictimManager {
    constructor(scene, createVictimFunc) {
        this.victimToTypingTestMap = new Map(); // Maps victim index to typing test instance ID
        this.scene = scene;
        this.createVictimFunc = createVictimFunc;
        this.victims = [];
        this.maxVictims = 3;
        this.spawnInterval = 15000; // 3 seconds between spawns
        this.lastSpawnTime = 0;
        this.gameOver = false;
        this.activeVictimIndex = 0;
        
        this.patientPositions = [
            {hori: 7, vert: 8},
            {hori:0, vert: 8},
            {hori:-7, vert: 8},
    
        ];
        
        // Track which positions are occupied
        this.occupiedPositions = new Set();
        // Track available positions (start with all positions available)
        this.availablePositions = new Set([0, 1, 2]);
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
            console.log('index here ', index)
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
        victim.currentHealth = 200; // Start at FULL health now (not 0)
        victim.positionIndex = positionIndex;
        victim.isVisible = true;

        victim.requiredTool = this.getRandomTool();
        victim.toolUsed = false;
        console.log(`%cVictim needs tool: ${victim.requiredTool}`, "color: cyan; font-size: 14px;");

        victim.position.x = this.patientPositions[positionIndex].hori;
        victim.position.z = this.patientPositions[positionIndex].vert;
        victim.position.y = 5;

        victim.healthBarBg.isVisible = true;
        victim.healthBarFg.isVisible = true;
        victim.updateHealthBar();

        this.occupiedPositions.add(positionIndex);
        this.availablePositions.delete(positionIndex);

        this.victims.push(victim);
        
        // Map victim to typing test instance
        const victimIndex = this.victims.length - 1;
        const typingTestId = positionIndex + 1;
        this.victimToTypingTestMap.set(victimIndex, typingTestId);
        
        console.log(`%cVictim ${victimIndex} mapped to Typing Test ${typingTestId}`,
            "color: magenta; font-size: 14px;");

        console.log(`%cVictim spawned at position ${positionIndex} (x=${victim.position.x}, z=${victim.position.z})`,
            "color: orange; font-size: 14px;");

        return victim;
    }

    getActiveVictim() {
        return this.victims[this.activeVictimIndex] || null;
    }

    healActiveVictim(amount) {
        console.log('damage dealing')
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

   spawnVictim() {
        console.log("%cAttempting to spawn victim...", "color: yellow; font-size: 14px;");
        
        const positionIndex = this.getNextAvailablePosition();
        if (positionIndex === undefined) {
            console.log("%cNo available positions!", "color: red; font-size: 14px;");
            return;
        }
        
        // Check if position index is valid for patientPositions array
        if (positionIndex >= this.patientPositions.length) {
            console.log(`%cInvalid position index ${positionIndex}, max is ${this.patientPositions.length - 1}`,
                "color: red; font-size: 14px;");
            return;
        }
        
        const victim = this.createVictimFunc(this.scene, positionIndex);
        victim.currentHealth = 200;
        victim.positionIndex = positionIndex;
        victim.isVisible = true;

        victim.requiredTool = this.getRandomTool();
        victim.toolUsed = false;

        victim.position.x = this.patientPositions[positionIndex].hori;
        victim.position.z = this.patientPositions[positionIndex].vert;
        victim.position.y = 5;

        victim.healthBarBg.isVisible = true;
        victim.healthBarFg.isVisible = true;
        victim.updateHealthBar();

        this.occupiedPositions.add(positionIndex);
        this.availablePositions.delete(positionIndex);

        this.victims.push(victim);
        
        const victimIndex = this.victims.length - 1;
        const typingTestId = positionIndex + 1;
        this.victimToTypingTestMap.set(victimIndex, typingTestId);

        console.log(`%cVictim spawned at position ${positionIndex}`, "color: orange; font-size: 14px;");

        return victim;
    }
        // Add method to damage victim by typing test ID
        damageVictimByTypingTest(typingTestId, damage = 66) { // 66 damage means ~3 hits to kill (200 health)
            // Find victim index for this typing test
            let victimIndex = null;
            for (let [index, testId] of this.victimToTypingTestMap.entries()) {
                if (testId === typingTestId) {
                    victimIndex = index;
                    break;
                }
            }
            
            if (victimIndex === null) {
                console.log(`%cNo victim found for typing test ${typingTestId}`, "color: orange;");
                return;
            }
            
            const victim = this.victims[victimIndex];
            if (victim) {
                // Directly damage health
                victim.modifyHealth(-damage);
                
                console.log(`%cVictim ${victimIndex} took ${damage} damage! Health: ${victim.currentHealth}/${victim.maxHealth}`,
                    "color: orange; font-size: 16px; font-weight: bold;");
                
                // Check if victim died (health reached 0)
                if (victim.currentHealth <= 0) {
                    console.log(`%cVictim ${victimIndex} destroyed!`, 
                        "color: red; font-size: 18px;");
                    this.destroyVictim(victimIndex);
                }
            }
        }

        // Add method to destroy victim
    destroyVictim(index) {
        const victim = this.victims[index];
        if (victim) {
            const positionIndex = victim.positionIndex;

            console.log(`%cVictim at position ${positionIndex} destroyed!`,
                "color: red; font-size: 16px; font-weight: bold;");

            victim.isVisible = false;
            victim.healthBarBg.isVisible = false;
            victim.healthBarFg.isVisible = false;

            this.occupiedPositions.delete(positionIndex);
            this.availablePositions.add(positionIndex);

            this.victimToTypingTestMap.delete(index);
            
            this.victims.splice(index, 1);

            // Update map indices after removal
            const newMap = new Map();
            for (let [idx, testId] of this.victimToTypingTestMap.entries()) {
                if (idx > index) {
                    newMap.set(idx - 1, testId);
                } else {
                    newMap.set(idx, testId);
                }
            }
            this.victimToTypingTestMap = newMap;

            console.log(`%cPosition ${positionIndex} freed. Available: [${Array.from(this.availablePositions)}]`,
                "color: lime; font-size: 12px;");

            if (this.activeVictimIndex >= this.victims.length) {
                this.activeVictimIndex = 0;
            }
            
            // Check if all victims are dead
            if (this.areAllVictimsDead()) {
                console.log(`%cALL VICTIMS DEAD - TRIGGERING GAME OVER!`, 
                    "color: red; font-size: 24px; font-weight: bold;");
                this.triggerAllVictimsDeadGameOver();
                return;
            }
            
        }
    }

    areAllVictimsDead() {
        return this.victims.length === 0;
    }

        
    triggerAllVictimsDeadGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            window.gameStarted = false;
            
            console.log("%cGAME OVER - All victims died!", 
                "color: red; font-size: 24px; font-weight: bold;");
            
            if (window.onAllVictimsDead) {
                window.onAllVictimsDead();
            }
            
            resetToDefault();
            this.reset();
        }
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