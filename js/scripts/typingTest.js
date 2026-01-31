export class TypingTest {
    constructor(wordBankPath = 'js/data/wordBank.json') {
        this.wordBank = [];
        this.currentWord = null;
        this.currentIndex = 0;
        this.userInput = '';
        this.startTime = null;
        this.endTime = null;
        
        this.stats = {
            totalWords: 0,
            correctWords: 0,
            totalCharacters: 0,
            correctCharacters: 0,
            incorrectCharacters: 0,
            startTime: null,
            endTime: null,
            wordsPerMinute: 0,
            accuracy: 0,
            errors: []
        };
        
        // DOM elements
        this.container = null;
        this.wordDisplay = null;

        // Typing zone
        this.typingZone = {
            minZ: -8,
            maxZ: -2
        };

        // Tool image paths
        this.toolImages = {
            garlic: "./assets/tools/garlic.svg",
            rosaries: "./assets/tools/rosaries.svg",
            cross: "./assets/tools/cross.svg",
            holyWater: "./assets/tools/holyWater.svg",
            scalpel: "./assets/tools/scalpel.svg"
        };

        // Tetris falling animation properties
        this.minFallDuration = 3000; // Fastest fall time (3 seconds)
        this.maxFallDuration = 8000; // Slowest fall time (8 seconds)
        this.currentFallDuration = 5000;
        this.isFalling = false;
        this.fallAnimationFrame = null;
        this.fallStartTime = null;
        this.currentTopPosition = -200; // Start position
        this.targetTopPosition = window.innerHeight; // Bottom of screen

        this.loadWordBank(wordBankPath);
        this.createUI();
        this.bindEvents();
    }

    isHandInTypingZone() {
        if (!window.gameElements || !window.gameElements.handMotions) {
            return true;
        }

        const handMotions = window.gameElements.handMotions;
        const handPos = handMotions.getHandPosition();

        const inZone = handPos.z >= this.typingZone.minZ && handPos.z <= this.typingZone.maxZ;
        if (!inZone) {
            return false;
        }

        if (!handMotions.isHoldingTool()) {
            return false;
        }

        const heldTool = handMotions.getHeldTool();
        if (!heldTool || !heldTool.metadata) {
            return false;
        }

        const heldToolType = heldTool.metadata.toolType;
        const victimManager = window.gameElements.victimManager;

        if (!victimManager) {
            return true;
        }

        const requiredTool = victimManager.getActiveVictimTool();
        if (!requiredTool) {
            return true;
        }

        return heldToolType === requiredTool;
    }
    
    async loadWordBank(path) {
        try {
            const response = await fetch(path);
            const data = await response.json();
            this.wordBank = Object.values(data);
            console.log('Word bank loaded:', this.wordBank.length, 'words');
        } catch (error) {
            console.error('Error loading word bank:', error);
            this.wordBank = [
                { challenge: "hello", handPlacement: "left", difficulty: "easy" },
                { challenge: "world", handPlacement: "right", difficulty: "easy" },
                { challenge: "test", handPlacement: "left", difficulty: "easy" }
            ];
        }
    }
    
    createUI() {
        // Create container - starts OFF SCREEN at top
        this.container = document.createElement('div');
        this.container.id = 'typing-test-container';
        this.container.style.cssText = `
            position: fixed;
            top: -200px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 30px 50px;
            border-radius: 15px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            min-width: 400px;
            text-align: center;
            border: 3px solid #666;
        `;
        
        // Create word display
        this.wordDisplay = document.createElement('div');
        this.wordDisplay.id = 'word-display';
        this.wordDisplay.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 5px;
            min-height: 60px;
            color: white;
        `;

        // Create tool indicator
        this.toolIndicator = document.createElement('div');
        this.toolIndicator.id = 'tool-indicator';
        this.toolIndicator.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            gap: 10px;
        `;

        this.toolImage = document.createElement('img');
        this.toolImage.style.cssText = `
            width: 80px;
            height: 80px;
            object-fit: contain;
        `;
        this.toolImage.src = '';

        this.toolIndicator.appendChild(this.toolImage);

        window.updateToolBubble = (toolName) => {
            if (toolName && this.toolImages[toolName]) {
                this.toolImage.src = this.toolImages[toolName];
                this.toolIndicator.style.display = 'flex';
            } else {
                this.toolIndicator.style.display = 'none';
            }
        };

        this.statsDisplay = document.createElement('div');
        this.statsDisplay.id = 'stats-display';
        this.statsDisplay.style.cssText = `
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            display: none;
            justify-content: space-around;
        `;
        
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        `;

        this.container.appendChild(this.wordDisplay);
        this.container.appendChild(this.toolIndicator);
        this.container.appendChild(this.statsDisplay);
        this.container.appendChild(this.buttonsContainer);
        document.body.appendChild(this.container);
    }

    // Start continuous falling animation
    startFalling() {
        if (this.isFalling) return;
        
        this.isFalling = true;
        this.fallStartTime = Date.now();
        
        // Random fall duration for variety
        this.currentFallDuration = Math.random() * (this.maxFallDuration - this.minFallDuration) + this.minFallDuration;
        
        console.log(`Word falling for ${(this.currentFallDuration / 1000).toFixed(1)}s`);
        
        this.animateFall();
    }

    // Animation loop for falling
    animateFall() {
        if (!this.isFalling) return;
        
        const elapsed = Date.now() - this.fallStartTime;
        const progress = Math.min(elapsed / this.currentFallDuration, 1);
        
        // Easing function for natural fall (ease-in)
        const easedProgress = progress * progress;
        
        // Calculate current position
        const totalDistance = this.targetTopPosition - (-200);
        this.currentTopPosition = -200 + (totalDistance * easedProgress);
        
        this.container.style.top = `${this.currentTopPosition}px`;
        
        // Check if reached bottom
        if (progress >= 1) {
            console.log("%cWord reached bottom - GAME OVER or penalty!", "color: red; font-size: 16px;");
            this.onWordReachedBottom();
            return;
        }
        
        // Continue animation
        this.fallAnimationFrame = requestAnimationFrame(() => this.animateFall());
    }

    // Stop falling animation
    stopFalling() {
        this.isFalling = false;
        if (this.fallAnimationFrame) {
            cancelAnimationFrame(this.fallAnimationFrame);
            this.fallAnimationFrame = null;
        }
    }

    // Reset to top of screen
    resetPosition() {
        this.stopFalling();
        this.currentTopPosition = -200;
        this.container.style.top = '-200px';
    }

    // Called when word reaches bottom without being completed
    onWordReachedBottom() {
        this.stopFalling();
        
        // Penalty logic - damage health, lose points, etc.
        if (window.gameElements && window.gameElements.victimManager) {
            window.gameElements.victimManager.healActiveVictim(-50); // 50 damage for missing word
        }
        
        console.log("%c-50 HP for missing word!", "color: red; font-weight: bold;");
        
        // Load next word
        setTimeout(() => {
            this.nextWord();
        }, 500);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            if (e.key === 'Backspace') {
                e.preventDefault();
                this.handleBackspace();
            } else if (e.key.length === 1) {
                e.preventDefault();
                this.handleCharacter(e.key);
            }
        });

        // Update target position on window resize
        window.addEventListener('resize', () => {
            this.targetTopPosition = window.innerHeight;
        });
    }
    
    startTest() {
        this.stats.startTime = Date.now();
        this.nextWord();
    }
    
    nextWord() {
        if (this.wordBank.length === 0) return;
        
        // Reset position to top
        this.resetPosition();
        
        const randomIndex = Math.floor(Math.random() * this.wordBank.length);
        this.currentWord = this.wordBank[randomIndex].challenge;
        this.currentIndex = 0;
        this.userInput = '';
        this.stats.totalWords++;
        
        this.renderWord();
        
        // Start falling animation after brief delay
        setTimeout(() => {
            this.startFalling();
        }, 100);
    }
    
    handleCharacter(rawChar) {
        if (!this.currentWord) return;

        if (!this.isHandInTypingZone()) {
            console.log("Hand not in typing zone!");
            return;
        }

        if (this.currentIndex >= this.currentWord.length) return;
        
        let char = rawChar;
        const expectedChar = this.currentWord[this.currentIndex];
        const isCorrect = char.toLowerCase() === expectedChar.toLowerCase();
        
        this.userInput += char;
        this.stats.totalCharacters++;
        
        if (isCorrect) {
            this.stats.correctCharacters++;
            this.animateCorrect(this.currentIndex);
        } else {
            this.stats.incorrectCharacters++;
            this.stats.errors.push({
                word: this.currentWord,
                position: this.currentIndex,
                expected: expectedChar,
                typed: char
            });
            this.animateIncorrect(this.currentIndex);
        }
        
        this.currentIndex++;
        
        // Check if word is complete
        if (this.currentIndex >= this.currentWord.length) {
            if (this.userInput === this.currentWord) {
                this.stats.correctWords++;
                console.log("%cWord completed!", "color: lime; font-weight: bold;");
            }
            
            // Stop falling and load next word
            this.stopFalling();
            
            setTimeout(() => {
                this.nextWord();
            }, 500);
        } else {
            this.renderWord();
        }
        
        this.updateStats();
    }
    
    handleBackspace() {
        if (!this.isHandInTypingZone()) {
            return;
        }

        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.userInput = this.userInput.slice(0, -1);
            this.renderWord();
        }
    }
    
    renderWord() {
        if (!this.currentWord) return;
        
        this.wordDisplay.innerHTML = '';
        
        for (let i = 0; i < this.currentWord.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentWord[i];
            span.id = `char-${i}`;
            span.style.cssText = `
                display: inline-block;
                transition: color 0.3s ease;
                color: #fff;
            `;
            
            if (i < this.userInput.length) {
                if (this.userInput[i].toLowerCase() === this.currentWord[i].toLowerCase()) {
                    span.style.color = '#22c55e';
                } else {
                    span.style.color = '#ef4444';
                }
            }
            
            if (i === this.currentIndex) {
                span.style.backgroundColor = '#fef08a';
                span.style.color = '#000';
                span.style.padding = '2px 4px';
                span.style.borderRadius = '3px';
            }
            
            this.wordDisplay.appendChild(span);
        }
    }
    
    animateCorrect(index) {
        const char = document.getElementById(`char-${index}`);
        if (!char) return;
        
        char.style.color = '#22c55e';
        char.style.transition = 'color 0.4s ease, transform 0.2s ease';
        char.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            char.style.transform = 'scale(1)';
        }, 200);
    }
    
    animateIncorrect(index) {
        const char = document.getElementById(`char-${index}`);
        if (!char) return;
        
        char.style.color = '#ef4444';
        
        const keyframes = [
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0px)' }
        ];
        
        const timing = {
            duration: 300,
            iterations: 1,
            easing: 'ease-in-out'
        };
        
        char.animate(keyframes, timing);
    }
    
    updateStats() {
        const elapsedTime = (Date.now() - this.stats.startTime) / 1000 / 60;
        const wpm = Math.round((this.stats.correctCharacters / 5) / elapsedTime) || 0;
        const accuracy = this.stats.totalCharacters > 0 
            ? Math.round((this.stats.correctCharacters / this.stats.totalCharacters) * 100) 
            : 100;
        
        this.stats.wordsPerMinute = wpm;
        this.stats.accuracy = accuracy;
        
        this.statsDisplay.innerHTML = `
            <div><strong>WPM:</strong> ${wpm}</div>
            <div><strong>Accuracy:</strong> ${accuracy}%</div>
            <div><strong>Words:</strong> ${this.stats.correctWords}/${this.stats.totalWords}</div>
            <div><strong>Errors:</strong> ${this.stats.incorrectCharacters}</div>
        `;
    }
    
    getStats() {
        return {
            ...this.stats,
            endTime: Date.now(),
            duration: (Date.now() - this.stats.startTime) / 1000
        };
    }
    
    reset() {
        this.stopFalling();
        this.stats = {
            totalWords: 0,
            correctWords: 0,
            totalCharacters: 0,
            correctCharacters: 0,
            incorrectCharacters: 0,
            startTime: null,
            endTime: null,
            wordsPerMinute: 0,
            accuracy: 0,
            errors: []
        };
        this.currentWord = null;
        this.currentIndex = 0;
        this.userInput = '';
        this.wordDisplay.innerHTML = '';
        this.statsDisplay.innerHTML = '';
        this.resetPosition();
    }
    
    stopTest() {
        this.stopFalling();
        const finalStats = this.getStats();
        
        this.wordDisplay.innerHTML = `
            <div style="font-size: 24px; color: #666;">Test Stopped!</div>
        `;
        
        this.statsDisplay.innerHTML = `
            <div><strong>Final WPM:</strong> ${finalStats.wordsPerMinute}</div>
            <div><strong>Final Accuracy:</strong> ${finalStats.accuracy}%</div>
            <div><strong>Words Completed:</strong> ${finalStats.correctWords}/${finalStats.totalWords}</div>
            <div><strong>Duration:</strong> ${Math.round(finalStats.duration)}s</div>
        `;
        
        console.log('Test stopped. Final statistics:', finalStats);
        
        this.currentWord = null;
        this.stats.startTime = null;
    }
    
    restartTest() {
        this.reset();
        
        this.wordDisplay.innerHTML = `
            <div style="font-size: 24px; color: #666;">Ready to start!</div>
        `;
        
        this.statsDisplay.innerHTML = `
            <div style="text-align: center; color: #999;">Start typing to begin...</div>
        `;
        
        console.log('Test restarted. All data reset.');
    }
    
    destroy() {
        this.stopFalling();
        if (this.container) {
            this.container.remove();
        }
    }
}