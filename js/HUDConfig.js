let startGameButton;
let playerScore = {},
scoreLabel = {},
title = {},
subtitle = {};
let currentRound = 0; 
const buttonList = {
    startGameButton,
};
let typingTest;
let victimManager;

const HUD = {
    playerScore,
    scoreLabel,
    title,
    subtitle,
    currentRound,
    typingTest,
    victimManager
}

export async function setUpHUD(BABYLON, scene, light, engine, typingTest, victimManagerRef){ // Add victimRef parameter
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene, BABYLON.Texture.NEAREST_NEAREST);
    let loadedGUI = await advancedTexture.parseFromURLAsync("./json/guiTexture.json");
    
    setUpButtons(advancedTexture, buttonList, light, victimManagerRef);
    
    HUD.playerScore = advancedTexture.getControlByName("PlayerScore");
    HUD.playerScore.paddingLeft = "30px"
    HUD.scoreLabel = advancedTexture.getControlByName("ScoreLabel");
    HUD.title = advancedTexture.getControlByName("Title");
    HUD.subtitle = advancedTexture.getControlByName("Subtitle");
    HUD.challenge = advancedTexture.getControlByName("challenge");
    HUD.challenge.paddingLeft = "30px"
    HUD.typingTest = typingTest;
    HUD.victimManager = victimManagerRef;
    
    setupTimer(scene, engine, HUD.challenge);
    setupScore(scene, HUD.typingTest, HUD.playerScore, 0);
    setupVictimHealing(scene, HUD.typingTest, HUD.victimManager);
    return HUD;
}

function setUpButtons(advancedTexture, buttonList, light, victim) {
    buttonList.startGameButton = advancedTexture.getControlByName("Start Game");
    buttonList.startGameButton.onPointerUpObservable.add(function () {
        hideTitleScreen(light, victim);
        console.log("%cStart Game Pressed", "color:green");
    });
}

function setupScore(scene, typingTest, target){
     scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted){
            const stats = typingTest.getStats();
            const typingScore = (stats.correctWords - stats.incorrectCharacters) * (1 + stats.wordsPerMinute);
            const toolScore = window.toolScore || 0;
            target.text = Math.floor(typingScore + toolScore);
            
        }
    });
}


function setupVictimHealing(scene, typingTest, victimManager) {
    let lastCorrectWords = 0;
    let lastIncorrectCharacters = 0; // Track incorrect characters
    const healAmount = 50; // HP restored per correct word
    const damageAmount = 5; // HP lost per incorrect character
    
    scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted && victimManager) {
            const stats = typingTest.getStats();
            const currentCorrectWords = stats.correctWords;
            const currentIncorrectCharacters = stats.incorrectCharacters;
            
            // Check if a new word was typed correctly
            if (currentCorrectWords > lastCorrectWords) {
                const newWords = currentCorrectWords - lastCorrectWords;
                victimManager.healActiveVictim(healAmount * newWords);
                console.log(`Healed ${healAmount * newWords} HP for ${newWords} correct word(s)`);
                lastCorrectWords = currentCorrectWords;
            }
            
            // Check if incorrect characters increased
            if (currentIncorrectCharacters > lastIncorrectCharacters) {
                const newErrors = currentIncorrectCharacters - lastIncorrectCharacters;
                victimManager.healActiveVictim(-damageAmount * newErrors)
                console.log(`Damaged ${damageAmount * newErrors} HP for ${newErrors} incorrect character(s)`);
                lastIncorrectCharacters = currentIncorrectCharacters;
            }
        }
    });
}

function setupTimer(scene, engine, target){
    let timeElapsed = 0;
    const targetTime = 300;
    let gameEnded = false;
    
    scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted && !gameEnded){
            timeElapsed += engine.getDeltaTime() / 1000;
            
            // Check if too many victims
            if (HUD.victimManager && HUD.victimManager.gameOver) {
                resetToDefault();
                gameEnded = true;
                window.gameStarted = false;
                target.text = "Too Many Victims!";
                console.log("%cGame Over - Too Many Victims!", "color: red; font-size: 24px;");
                
            }
            // Check if time is up
            else if (timeElapsed >= targetTime) {
                resetToDefault();
                gameEnded = true;
                window.gameStarted = false;
                target.text = "Time's Up!";
                console.log("%cGame Over - Time's Up!", "color: red; font-size: 24px;");
                
            } else {
                target.text = `Time: ${timeElapsed.toFixed(1)}s | Victims: ${HUD.victimManager ? HUD.victimManager.getVictimCount() : 0}/5`;
            }
        }
    });
}

export function resetToDefault() {
    console.log('resetting')
    HUD.title.isVisible = true;
    HUD.subtitle.isVisible = true;
    buttonList.startGameButton.isVisible = true;
        
    if (HUD.typingTest) {
        HUD.typingTest.reset();
    }
    
    window.toolScore = 0;
}



export function hideTitleScreen(light) { // Remove victim parameter
    HUD.title.isVisible = false;
    HUD.subtitle.isVisible = false;
    window.gameStarted = true;
    buttonList.startGameButton.isVisible = false;
    light.width = 30;
    light.intensity = 1.55;
    HUD.typingTest.startTest();
    
    // Start victim manager
    if (HUD.victimManager) {
        HUD.victimManager.start();
    }
}

// Helper function to modify victim health from anywhere
export function modifyVictimHealth(amount) {
    if (HUD.victim) {
        HUD.victim.modifyHealth(amount);
    }
}