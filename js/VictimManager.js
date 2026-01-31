import {resetToDefault} from './HUDConfig.js';
import { TOOL_NAMES } from './tools.js';

// VictimManager.js
export class VictimManager {
    constructor(scene, createVictimFunc) {
        this.scene = scene;
        this.createVictimFunc = createVictimFunc;
        this.victims = [];
        this.maxVictims = 5;
        this.spawnInterval = 8000; // 15 seconds between spawns
        this.lastSpawnTime = 0;
        this.gameOver = false;
        this.activeVictimIndex = 0; // Which victim is currently being healed
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
            // Update the bubble to show checkmark or hide
            if (window.updateToolBubble) {
                window.updateToolBubble(null); // Hide bubble when tool is used
            }
            return true;
        } else {
            console.log(`%cWrong tool! Needed: ${victim.requiredTool}, got: ${toolName}`, "color: red; font-size: 16px;");
            return false;
        }
    }

    start() {
        this.lastSpawnTime = Date.now();
        this.spawnVictim(); // Spawn first victim immediately
        
        this.scene.onBeforeRenderObservable.add(() => {
            if (window.gameStarted && !this.gameOver) {
                this.update();
            }
        });
    }

    update() {
        const currentTime = Date.now();
        
        // Check if we should spawn a new victim
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            if (this.victims.length < this.maxVictims) {
                this.spawnVictim();
                this.lastSpawnTime = currentTime;
            }
        }

        // Check if max victims reached
        if (this.victims.length >= this.maxVictims) {
            this.triggerGameOver();
        }

        // Check if active victim is healed
        const activeVictim = this.getActiveVictim();
        if (activeVictim && activeVictim.currentHealth >= activeVictim.maxHealth) {
            this.healVictim(this.activeVictimIndex);
        }
    }

    spawnVictim() {
        console.log("%cAttempting to spawn victim...", "color: yellow; font-size: 14px;");
        const victim = this.createVictimFunc(this.scene, this.victims.length);
        victim.currentHealth = 0;
        victim.updateHealthBar();

        // Assign a random required tool to this victim
        victim.requiredTool = this.getRandomTool();
        victim.toolUsed = false;
        console.log(`%cVictim needs tool: ${victim.requiredTool}`, "color: cyan; font-size: 14px;");

        // Make victim visible immediately
        victim.isVisible = true;
        victim.healthBarBg.isVisible = true;
        victim.healthBarFg.isVisible = true;

        victim.position.z = -4 - (this.victims.length * 1.5);

        this.victims.push(victim);
        console.log(`%cVictim #${this.victims.length} spawned at z=${victim.position.z}! (${this.victims.length}/${this.maxVictims})`,
            "color: orange; font-size: 14px;");

        // Update bubble to show this victim's required tool (if this is the first/active victim)
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
            victim.modifyHealth(amount);
        }
    }

    healVictim(index) {
        const victim = this.victims[index];
        if (victim) {
            console.log(`%cVictim #${index + 1} healed and removed!`,
                "color: lime; font-size: 16px; font-weight: bold;");

            // Hide and remove victim
            victim.isVisible = false;
            victim.healthBarBg.isVisible = false;
            victim.healthBarFg.isVisible = false;

            this.victims.splice(index, 1);

            // Reposition remaining victims
            this.repositionVictims();

            // Reset active index if needed
            if (this.activeVictimIndex >= this.victims.length) {
                this.activeVictimIndex = 0;
            }

            // Update bubble to show next victim's required tool
            const nextVictim = this.getActiveVictim();
            if (nextVictim && window.updateToolBubble) {
                window.updateToolBubble(nextVictim.requiredTool);
            }
        }
    }

    repositionVictims() {
        this.victims.forEach((victim, index) => {
            victim.position.z = -4 - (index * 1.5);
            victim.healthBarBg.position.z = -3 - (index * 1.5);
            victim.healthBarFg.position.z = -3 - (index * 1.5);
        });
    }

    triggerGameOver() {
        if (!this.gameOver) {
            this.gameOver = true;
            window.gameStarted = false;
            console.log("%cGAME OVER - Too many victims!", "color: red; font-size: 24px; font-weight: bold;");
            resetToDefault()
            
            // Trigger game over in HUD
            if (window.onGameOver) {
                window.onGameOver("Too Many Victims!");
            }
            this.reset()

        }
    }

    getVictimCount() {
        return this.victims.length;
    }

    reset() {

        // Hide all victims
        this.victims.forEach(victim => {
            victim.isVisible = false;
            victim.healthBarBg.isVisible = false;
            victim.healthBarFg.isVisible = false;
        });
        
        this.victims = [];
        this.activeVictimIndex = 0;
        this.gameOver = false;
        this.lastSpawnTime = 0;
    }

    start() {
    console.log("%cVictimManager started!", "color: lime; font-size: 16px;");
    this.lastSpawnTime = Date.now();
    this.spawnVictim(); // Spawn first victim immediately
    
    this.scene.onBeforeRenderObservable.add(() => {
        if (window.gameStarted && !this.gameOver) {
            this.update();
        }
    });
}
}