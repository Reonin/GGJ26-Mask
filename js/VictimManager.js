import {resetToDefault} from './HUDConfig.js';
import { TOOL_NAMES } from './tools.js';

// VictimManager.js
export class VictimManager {
    constructor(scene, createVictimFunc) {
        this.typingTestToVictimMap = new Map(); // Maps typing test ID to victim position index
        this.activeToolsPerColumn = new Map(); // Maps position index to Set of active tools
        this.lastWordStartPerColumn = new Map(); // Maps position index to timestamp of last word start
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

    // Get available tools for a column (excluding ones already in use)
    getAvailableToolsForColumn(positionIndex) {
        const activeTools = this.activeToolsPerColumn.get(positionIndex) || new Set();
        const allTools = TOOL_NAMES.filter(tool => !activeTools.has(tool));
        // If all tools are in use, return all tools (fallback)
        return allTools.length > 0 ? allTools : TOOL_NAMES;
    }

    // Register a tool as active in a column
    registerToolInColumn(positionIndex, tool) {
        if (!this.activeToolsPerColumn.has(positionIndex)) {
            this.activeToolsPerColumn.set(positionIndex, new Set());
        }
        this.activeToolsPerColumn.get(positionIndex).add(tool);
    }

    // Unregister a tool from a column (when word completes or falls)
    unregisterToolFromColumn(positionIndex, tool) {
        const tools = this.activeToolsPerColumn.get(positionIndex);
        if (tools) {
            tools.delete(tool);
        }
    }

    // Check if a new word can start in a column (enough time since last word)
    canStartWordInColumn(positionIndex) {
        const lastStart = this.lastWordStartPerColumn.get(positionIndex) || 0;
        const minDelay = 3000; // Minimum 3 seconds between words in same column
        return Date.now() - lastStart >= minDelay;
    }

    // Register that a word started in a column
    registerWordStartInColumn(positionIndex) {
        this.lastWordStartPerColumn.set(positionIndex, Date.now());
    }

    // Get delay needed before starting a word in a column
    getDelayForColumn(positionIndex) {
        const lastStart = this.lastWordStartPerColumn.get(positionIndex) || 0;
        const minDelay = 3000; // Minimum 3 seconds between words in same column
        const elapsed = Date.now() - lastStart;
        return Math.max(0, minDelay - elapsed);
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

        // Map typing test to victim position (typing test ID = position + 1)
        const typingTestId = positionIndex + 1;
        this.typingTestToVictimMap.set(typingTestId, positionIndex);

        console.log(`%cTyping Test ${typingTestId} mapped to victim at position ${positionIndex}`,
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

        // Add method to damage victim by typing test ID
        damageVictimByTypingTest(typingTestId, damage = 66) { // 66 damage means ~3 hits to kill (200 health)
            // Find victim position for this typing test
            const victimPositionIndex = this.typingTestToVictimMap.get(typingTestId);

            if (victimPositionIndex === undefined) {
                console.log(`%cNo victim found for typing test ${typingTestId}`, "color: orange;");
                return;
            }

            // Find the victim at this position
            const victimIndex = this.victims.findIndex(v => v.positionIndex === victimPositionIndex);
            if (victimIndex === -1) {
                console.log(`%cVictim at position ${victimPositionIndex} not found (already dead?)`, "color: orange;");
                return;
            }

            const victim = this.victims[victimIndex];
            if (victim) {
                // Directly damage health
                victim.modifyHealth(-damage);

                console.log(`%cVictim at position ${victimPositionIndex} took ${damage} damage! Health: ${victim.currentHealth}/${victim.maxHealth}`,
                    "color: orange; font-size: 16px; font-weight: bold;");

                // Check if victim died (health reached 0)
                if (victim.currentHealth <= 0) {
                    console.log(`%cVictim at position ${victimPositionIndex} destroyed!`,
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

            // Find all typing tests that were targeting this victim
            const deadTypingTestIds = [];
            for (let [testId, pos] of this.typingTestToVictimMap.entries()) {
                if (pos === positionIndex) {
                    deadTypingTestIds.push(testId);
                }
            }

            // Remove mappings for dead victim's typing tests
            for (const testId of deadTypingTestIds) {
                this.typingTestToVictimMap.delete(testId);
            }

            this.occupiedPositions.delete(positionIndex);
            this.availablePositions.add(positionIndex);

            this.victims.splice(index, 1);

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

            // Stop the dead victim's typing tests and redistribute to remaining victims
            this.redistributeTypingTests(deadTypingTestIds);
        }
    }

    // Redistribute typing tests when a victim dies
    redistributeTypingTests(deadTypingTestIds) {
        if (!window.typingTests || this.victims.length === 0) return;

        // Find remaining living victims
        const livingVictims = this.victims.filter(v => v.currentHealth > 0);
        if (livingVictims.length === 0) return;

        // Clear tool tracking for the dead victim's column (it no longer exists)
        // and reset timing so new column doesn't have stale data
        for (const deadTestId of deadTypingTestIds) {
            const oldPosition = this.typingTestToVictimMap.get(deadTestId);
            if (oldPosition !== undefined) {
                this.activeToolsPerColumn.delete(oldPosition);
                this.lastWordStartPerColumn.delete(oldPosition);
            }
        }

        // Move each dead victim's typing test to a living victim immediately
        for (let i = 0; i < deadTypingTestIds.length; i++) {
            const deadTestId = deadTypingTestIds[i];
            const deadTest = window.typingTests[deadTestId];

            // Distribute evenly among living victims
            const targetVictim = livingVictims[i % livingVictims.length];
            const targetPositionIndex = targetVictim.positionIndex;

            if (deadTest) {
                // Move the existing typing test to the new victim's column immediately
                const leftPercent = 20 + targetPositionIndex * 30;
                deadTest.container.style.left = `${leftPercent}%`;

                // Reset position to top so the next word starts fresh in the new column
                deadTest.stopFalling();
                deadTest.currentTopPosition = -200;
                deadTest.container.style.top = '-200px';

                // Update the mapping to point to the new victim
                this.typingTestToVictimMap.set(deadTestId, targetPositionIndex);

                // Mark that this test was just redistributed (prevents double nextWord call)
                deadTest.wasRedistributed = true;

                // Start the next word immediately in the new column (no delay)
                if (window.gameStarted) {
                    deadTest.nextWord();
                }

                console.log(`%cMoved typing test ${deadTestId} to victim at position ${targetPositionIndex} (${leftPercent}%)`,
                    "color: cyan; font-size: 14px;");
            }
        }

        console.log(`%cRemaining victims: ${this.victims.length}, Active typing tests: ${this.typingTestToVictimMap.size}`,
            "color: yellow; font-size: 14px;");
    }

    getNextTypingTestId() {
        // Find the highest typing test ID and return the next one
        let maxId = 0;
        if (window.typingTests) {
            for (const id of Object.keys(window.typingTests)) {
                maxId = Math.max(maxId, parseInt(id));
            }
        }
        return maxId + 1;
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

        // Hide all typing tests
        if (window.typingTests) {
            for (const testId of Object.keys(window.typingTests)) {
                const test = window.typingTests[testId];
                if (test) {
                    test.stopFalling();
                    test.container.style.display = 'none';
                }
            }
        }

        this.victims = [];
        this.activeVictimIndex = 0;
        this.gameOver = false;
        this.lastSpawnTime = 0;
        this.typingTestToVictimMap.clear();
        this.activeToolsPerColumn.clear();
        this.lastWordStartPerColumn.clear();

        this.occupiedPositions.clear();
        this.availablePositions = new Set([0, 1, 2]);
    }
}