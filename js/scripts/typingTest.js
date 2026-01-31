export class TypingTest {
    constructor(wordBankPath = 'js/data/wordBank.json', instanceId = 1) {
        this.instanceId = instanceId;

        this.wordBank = [];
        this.currentWord = null;
        this.currentIndex = 0;
        this.userInput = '';
        this.startTime = null;

        this.stats = {
            totalWords: 0,
            correctWords: 0,
            totalCharacters: 0,
            correctCharacters: 0,
            incorrectCharacters: 0,
            startTime: null,
            wordsPerMinute: 0,
            accuracy: 0,
            errors: []
        };

        this.container = null;
        this.wordDisplay = null;

        // Tool image paths
        this.toolImages = {
            garlic: "../assets/tools/garlic.svg",
            rosaries: "../assets/tools/rosaries.svg",
            cross: "../assets/tools/cross.svg",
            holyWater: "../assets/tools/holyWater.svg",
            scalpel: "../assets/tools/scalpel.svg"
        };


        // Falling animation
        this.minFallDuration = 3000;
        this.maxFallDuration = 20000;
        this.currentFallDuration = 12000;
        this.isFalling = false;
        this.fallAnimationFrame = null;
        this.fallStartTime = null;
        this.currentTopPosition = -200;
        this.targetTopPosition = window.innerHeight;

        this.loadWordBank(wordBankPath);
        this.createUI();
        this.bindEvents();

        // Register instance globally for tool bubble updates
        window.typingTests = window.typingTests || {};
        window.typingTests[this.instanceId] = this;
    }

    // -------------------------------------------------------------
    // NEW TYPING ZONE LOGIC — UI PANEL IS THE TYPING ZONE
    // -------------------------------------------------------------
    isHandInTypingZone() {
        if (!window.gameElements || !window.gameElements.handMotions) return true;

        const handMotions = window.gameElements.handMotions;
        const handPos = handMotions.getHandPosition();

        // Convert 3D hand position to 2D screen coordinates
        const scene = handMotions.scene;
        const engine = scene.getEngine();

        const screenPos = BABYLON.Vector3.Project(
            handPos,
            BABYLON.Matrix.Identity(),
            scene.getTransformMatrix(),
            {
                x: 0,
                y: 0,
                width: engine.getRenderWidth(),
                height: engine.getRenderHeight()
            }
        );

        const x = screenPos.x;
        const y = screenPos.y;

        // Get this TypingTest's DOM rectangle
        const rect = this.container.getBoundingClientRect();

        const inside =
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom;

        if (!inside) return false;

        // Must be holding a tool
        if (!handMotions.isHoldingTool()) return false;

        const heldTool = handMotions.getHeldTool();
        if (!heldTool || !heldTool.metadata) return false;

        const heldToolType = heldTool.metadata.toolType;

        if (!victimManager) return true;

        const requiredTool = victimManager.getActiveVictimTool();
        if (!requiredTool) return true;

        return heldToolType === requiredTool;
    }

    // -------------------------------------------------------------
    // LOAD WORD BANK
    // -------------------------------------------------------------
    async loadWordBank(path) {
        try {
            const response = await fetch(path);
            const data = await response.json();
            this.wordBank = Object.values(data);
        } catch (error) {
            console.error('Error loading word bank:', error);
            this.wordBank = [
                { challenge: "hello" },
                { challenge: "world" },
                { challenge: "test" }
            ];
        }
    }

    // -------------------------------------------------------------
    // UI CREATION
    // -------------------------------------------------------------
    createUI() {
        this.container = document.createElement('div');
        this.container.id = `typing-test-container-${this.instanceId}`;
        this.container.style.cssText = `
            position: fixed;
            top: -200px;
            left: ${20 + (this.instanceId - 1) * 30}%;
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

        this.wordDisplay = document.createElement('div');
        this.wordDisplay.id = `word-display-${this.instanceId}`;
        this.wordDisplay.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 5px;
            min-height: 60px;
            color: white;
        `;

        this.toolIndicator = document.createElement('div');
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
        this.toolIndicator.appendChild(this.toolImage);

        this.updateToolBubble = (toolName) => {
            if (toolName && this.toolImages[toolName]) {
                this.toolImage.src = this.toolImages[toolName];
                this.toolIndicator.style.display = 'flex';
            } else {
                this.toolIndicator.style.display = 'none';
            }
        };

        this.statsDisplay = document.createElement('div');
        this.statsDisplay.style.cssText = `
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            display: flex;
            justify-content: space-around;
        `;

        this.container.appendChild(this.wordDisplay);
        this.container.appendChild(this.toolIndicator);
        this.container.appendChild(this.statsDisplay);
        document.body.appendChild(this.container);
    }

    // -------------------------------------------------------------
    // FALLING ANIMATION
    // -------------------------------------------------------------
    startFalling() {
        if (this.isFalling) return;

        this.isFalling = true;
        this.fallStartTime = Date.now();
        this.currentFallDuration =
            Math.random() * (this.maxFallDuration - this.minFallDuration) + this.minFallDuration;

        this.animateFall();
    }

    animateFall() {
        if (!this.isFalling) return;

        const elapsed = Date.now() - this.fallStartTime;
        const progress = Math.min(elapsed / this.currentFallDuration, 1);
        const eased = progress * progress;

        const totalDistance = this.targetTopPosition - (-200);
        this.currentTopPosition = -200 + totalDistance * eased;

        this.container.style.top = `${this.currentTopPosition}px`;

        if (progress >= 1) {
            this.onWordReachedBottom();
            return;
        }

        this.fallAnimationFrame = requestAnimationFrame(() => this.animateFall());
    }

    stopFalling() {
        this.isFalling = false;
        if (this.fallAnimationFrame) cancelAnimationFrame(this.fallAnimationFrame);
    }

    resetPosition() {
        this.stopFalling();
        this.currentTopPosition = -200;
        this.container.style.top = '-200px';
    }

    onWordReachedBottom() {
        this.stopFalling();

        if (window.gameElements?.victimManager) {
            window.gameElements.victimManager.healActiveVictim(-50);
        }

        setTimeout(() => this.nextWord(), 500);
    }

    // -------------------------------------------------------------
    // INPUT HANDLING
    // -------------------------------------------------------------
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

        this.resetPosition();

        const randomIndex = Math.floor(Math.random() * this.wordBank.length);
        this.currentWord = this.wordBank[randomIndex].challenge;
        this.currentIndex = 0;
        this.userInput = '';
        this.stats.totalWords++;

        // Pick a random tool for this word
        const toolNames = Object.keys(this.toolImages);
        const randomTool = toolNames[Math.floor(Math.random() * toolNames.length)];
        this.currentTool = randomTool;
        if (window.updateToolBubble) {
            window.updateToolBubble(randomTool);
        }

        this.renderWord();

        // Start falling animation after brief delay
        setTimeout(() => {
            this.startFalling();
        }, 100);
    }

    handleCharacter(rawChar) {
        if (!this.currentWord) return;
        if (!this.isHandInTypingZone()) return;

        if (this.currentIndex >= this.currentWord.length) return;

        const char = rawChar;
        const expected = this.currentWord[this.currentIndex];
        const correct = char.toLowerCase() === expected.toLowerCase();

        this.userInput += char;
        this.stats.totalCharacters++;

        if (correct) {
            this.stats.correctCharacters++;
            this.animateCorrect(this.currentIndex);
        } else {
            this.stats.incorrectCharacters++;
            this.stats.errors.push({
                word: this.currentWord,
                position: this.currentIndex,
                expected,
                typed: char
            });
            this.animateIncorrect(this.currentIndex);
        }

        this.currentIndex++;

        if (this.currentIndex >= this.currentWord.length) {
            if (this.userInput === this.currentWord) {
                this.stats.correctWords++;
            }

            this.stopFalling();
            setTimeout(() => this.nextWord(), 500);
        } else {
            this.renderWord();
        }

        this.updateStats();
    }

    handleBackspace() {
        if (!this.isHandInTypingZone()) return;

        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.userInput = this.userInput.slice(0, -1);
            this.renderWord();
        }
    }

    // -------------------------------------------------------------
    // WORD RENDERING
    // -------------------------------------------------------------
    renderWord() {
        if (!this.currentWord) return;

        this.wordDisplay.innerHTML = '';

        for (let i = 0; i < this.currentWord.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentWord[i];
            span.id = `char-${this.instanceId}-${i}`;
            span.style.cssText = `
                display: inline-block;
                transition: color 0.3s ease;
                color: #fff;
            `;

            if (i < this.userInput.length) {
                span.style.color =
                    this.userInput[i].toLowerCase() === this.currentWord[i].toLowerCase()
                        ? '#22c55e'
                        : '#ef4444';
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
        const char = document.getElementById(`char-${this.instanceId}-${index}`);
        if (!char) return;

        char.style.color = '#22c55e';
        char.style.transform = 'scale(1.1)';

        setTimeout(() => {
            char.style.transform = 'scale(1)';
        }, 200);
    }

    animateIncorrect(index) {
        const char = document.getElementById(`char-${this.instanceId}-${index}`);
        if (!char) return;

        char.style.color = '#ef4444';

        char.animate(
            [
                { transform: 'translateX(0px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0px)' }
            ],
            {
                duration: 300,
                easing: 'ease-in-out'
            }
        );
    }

    // -------------------------------------------------------------
    // STATS
    // -------------------------------------------------------------
    updateStats() {
        const elapsedMinutes = (Date.now() - this.stats.startTime) / 1000 / 60;
        const wpm = Math.round((this.stats.correctCharacters / 5) / elapsedMinutes) || 0;
        const accuracy =
            this.stats.totalCharacters > 0
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
            duration: (Date.now() - this.stats.startTime) / 1000
        };
    }

    // -------------------------------------------------------------
    // RESET / DESTROY
    // -------------------------------------------------------------
    reset() {
        this.stopFalling();
        this.stats = {
            totalWords: 0,
            correctWords: 0,
            totalCharacters: 0,
            correctCharacters: 0,
            incorrectCharacters: 0,
            startTime: null,
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
        this.currentWord = null;
    }

    destroy() {
        this.stopFalling();
        if (this.container) this.container.remove();
    }
}
