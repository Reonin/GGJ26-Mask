export class TypingTest {
    constructor(wordBankPath = 'js/data/wordBank.json') {
        this.wordBank = [];
        this.currentWord = null;
        this.currentIndex = 0;
        this.userInput = '';
        this.startTime = null;
        this.endTime = null;
        
                /* Statistics can throw this into state to be available for affects on the screen etc..
           Will probably need to be accessible throughout the project
        */ 
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
        
        // Load word bank
        this.loadWordBank(wordBankPath);
        
        // Create UI
        this.createUI();
        
        // Bind keyboard events
        this.bindEvents();
    }
    
    async loadWordBank(path) {
        try {
            const response = await fetch(path);
            const data = await response.json();
            this.wordBank = Object.values(data);
            console.log('Word bank loaded:', this.wordBank.length, 'words');
        } catch (error) {
            console.error('Error loading word bank:', error);
            // Fallback word bank
            this.wordBank = [
                { challenge: "hello", handPlacement: "left", difficulty: "easy" },
                { challenge: "world", handPlacement: "right", difficulty: "easy" },
                { challenge: "test", handPlacement: "left", difficulty: "easy" }
            ];
        }
    }
    
    createUI() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'typing-test-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: transparent;
            padding: 30px 50px;
            border-radius: 15px;
            z-index: 1000;
            font-family: 'Courier New', monospace;
            min-width: 400px;
            text-align: center;
        `;
        
        // Create word display
        this.wordDisplay = document.createElement('div');
        this.wordDisplay.id = 'word-display';
        this.wordDisplay.style.cssText = `
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            letter-spacing: 5px;
            min-height: 60px;
        `;
        
        // Create stats display
        this.statsDisplay = document.createElement('div');
        this.statsDisplay.id = 'stats-display';
        this.statsDisplay.style.cssText = `
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            display: none;
            justify-content: space-around;
        `;
        
        // Create instruction text
        const instructions = document.createElement('div');
        instructions.style.cssText = `
            font-size: 12px;
            color: #999;
            margin-top: 10px;
        `;
        instructions.textContent = 'Start typing to begin the test';
        
        // Create buttons container
        this.buttonsContainer = document.createElement('div');
        this.buttonsContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        `;
        
        // Create Stop button
        this.stopButton = document.createElement('button');
        this.stopButton.textContent = 'Stop Test';
        this.stopButton.style.cssText = `
            padding: 10px 20px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            transition: background 0.3s ease;
        `;
        this.stopButton.onmouseover = () => {
            this.stopButton.style.background = '#dc2626';
        };
        this.stopButton.onmouseout = () => {
            this.stopButton.style.background = '#ef4444';
        };
        this.stopButton.onclick = () => this.stopTest();
        
        // Create Restart button
        this.restartButton = document.createElement('button');
        this.restartButton.textContent = 'Restart Test';
        this.restartButton.style.cssText = `
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            transition: background 0.3s ease;
        `;
        this.restartButton.onmouseover = () => {
            this.restartButton.style.background = '#2563eb';
        };
        this.restartButton.onmouseout = () => {
            this.restartButton.style.background = '#3b82f6';
        };
        this.restartButton.onclick = () => this.restartTest();
        
        this.buttonsContainer.appendChild(this.stopButton);
        this.buttonsContainer.appendChild(this.restartButton);
        
        this.container.appendChild(this.wordDisplay);
        this.container.appendChild(this.statsDisplay);
        this.container.appendChild(instructions);
        this.container.appendChild(this.buttonsContainer);
        document.body.appendChild(this.container);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            // Ignore special keys
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            // Start test on first key press
            if (!this.stats.startTime) {
                this.startTest();
            }
            
            if (e.key === 'Backspace') {
                e.preventDefault();
                this.handleBackspace();
            } else if (e.key.length === 1) {
                e.preventDefault();
                this.handleCharacter(e.key);
            }
        });
    }
    
    startTest() {
        this.stats.startTime = Date.now();
        this.nextWord();
    }
    
    nextWord() {
        if (this.wordBank.length === 0) return;
        
        // Random word selection
        const randomIndex = Math.floor(Math.random() * this.wordBank.length);
        this.currentWord = this.wordBank[randomIndex].challenge;
        this.currentIndex = 0;
        this.userInput = '';
        this.stats.totalWords++;
        
        this.renderWord();
    }
    
    handleCharacter(char) {
        if (!this.currentWord) return;
        
        const expectedChar = this.currentWord[this.currentIndex];
        const isCorrect = char === expectedChar;
        
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
            // Check if entire word was correct
            if (this.userInput === this.currentWord) {
                this.stats.correctWords++;
            }
            
            setTimeout(() => {
                this.nextWord();
            }, 500);
        } else {
            this.renderWord();
        }
        
        this.updateStats();
    }
    
    handleBackspace() {
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
                color: ${i < this.currentIndex ? '#000' : '#000'};
            `;
            
            // Color based on input
            if (i < this.userInput.length) {
                if (this.userInput[i] === this.currentWord[i]) {
                    span.style.color = '#22c55e'; // Green
                } else {
                    span.style.color = '#ef4444'; // Red
                }
            }
            
            // Highlight current character
            if (i === this.currentIndex) {
                span.style.backgroundColor = '#fef08a'; // Yellow highlight
                span.style.padding = '2px 4px';
                span.style.borderRadius = '3px';
            }
            
            this.wordDisplay.appendChild(span);
        }
    }
    
    animateCorrect(index) {
        const char = document.getElementById(`char-${index}`);
        if (!char) return;
        
        // Smooth color transition to green
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
        
        // Red color with shake animation
        char.style.color = '#ef4444';
        
        // Create shake animation
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
        const elapsedTime = (Date.now() - this.stats.startTime) / 1000 / 60; // in minutes
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
    }
    
    stopTest() {
        const finalStats = this.getStats();
        
        // Show final results
        this.wordDisplay.innerHTML = `
            <div style="font-size: 24px; color: #666;">Test Stopped!</div>
        `;
        
        this.statsDisplay.innerHTML = `
            <div><strong>Final WPM:</strong> ${finalStats.wordsPerMinute}</div>
            <div><strong>Final Accuracy:</strong> ${finalStats.accuracy}%</div>
            <div><strong>Words Completed:</strong> ${finalStats.correctWords}/${finalStats.totalWords}</div>
            <div><strong>Duration:</strong> ${Math.round(finalStats.duration)}s</div>
        `;
        
        // Log detailed stats to console
        console.log('Test stopped. Final statistics:', finalStats);
        
        // Disable typing
        this.currentWord = null;
        this.stats.startTime = null;
    }
    
    restartTest() {
        this.reset();
        
        // Show ready message
        this.wordDisplay.innerHTML = `
            <div style="font-size: 24px; color: #666;">Ready to start!</div>
        `;
        
        this.statsDisplay.innerHTML = `
            <div style="text-align: center; color: #999;">Start typing to begin...</div>
        `;
        
        console.log('Test restarted. All data reset.');
    }
    
    destroy() {
        if (this.container) {
            this.container.remove();
        }
    }
}