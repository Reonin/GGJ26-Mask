import { TOOL_NAMES } from './tools.js';
import { modifyVictimHealth } from './HUDConfig.js';

export class ToolQueue {
    constructor() {
        this.queue = [];
        this.score = 0;
        this.onScoreChange = null; // Callback for UI updates
        this.onQueueChange = null; // Callback for UI updates
        window.toolScore = 0; // Initialize global for HUD
    }

    // Fill queue with random tools
    fillQueue(count = 5) {
        this.queue = [];
        for (let i = 0; i < count; i++) {
            const randomTool = TOOL_NAMES[Math.floor(Math.random() * TOOL_NAMES.length)];
            this.queue.push(randomTool);
        }
        if (this.onQueueChange) this.onQueueChange(this.queue);
        // Update speech bubble
        if (window.updateToolBubble) {
            window.updateToolBubble(this.getNextRequired());
        }
        return this.queue;
    }

    // Get the next required tool (front of queue)
    getNextRequired() {
        return this.queue.length > 0 ? this.queue[0] : null;
    }

    // Check if tool matches the next required, award points if correct
    useTool(toolName) {
        const required = this.getNextRequired();
        if (required && toolName === required) {
            this.queue.shift(); // Remove from front
            this.score += 100;
            window.toolScore = this.score; // Update global for HUD
            console.log(`Correct tool! +100 points. Score: ${this.score}`);
            
            // Vicitim Healthbar modify +
            modifyVictimHealth(15);

            const nextTool = this.getNextRequired();
            if (nextTool) {
                console.log(`%cNext required tool: ${nextTool}`, "color: cyan; font-size: 16px; font-weight: bold;");
            } else {
                console.log(`%cQueue complete!`, "color: lime; font-size: 16px; font-weight: bold;");
            }
            // Update speech bubble
            if (window.updateToolBubble) {
                window.updateToolBubble(nextTool);
            }
            if (this.onScoreChange) this.onScoreChange(this.score);
            if (this.onQueueChange) this.onQueueChange(this.queue);
            return true;
        }
        this.score -= 50;
        window.toolScore = this.score; // Update global for HUD
        
        // Vicitim Healthbar modify +
        modifyVictimHealth(-20);
        
        console.log(`%cWrong tool! -50 points. Needed: ${required}, got: ${toolName}`, "color: red; font-size: 16px; font-weight: bold;");
        if (this.onScoreChange) this.onScoreChange(this.score);
        return false;
    }

    // Get current score
    getScore() {
        return this.score;
    }

    // Get full queue
    getQueue() {
        return [...this.queue];
    }

    // Check if queue is empty
    isEmpty() {
        return this.queue.length === 0;
    }

    // Reset everything
    reset() {
        this.queue = [];
        this.score = 0;
        if (this.onScoreChange) this.onScoreChange(this.score);
        if (this.onQueueChange) this.onQueueChange(this.queue);
    }
}
