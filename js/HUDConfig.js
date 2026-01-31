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
let victim; // Add victim reference

const HUD = {
    playerScore,
    scoreLabel,
    title,
    subtitle,
    currentRound,
    typingTest,
    victim // Add to HUD object
}

export async function setUpHUD(BABYLON, scene, light, engine, typingTest, victimRef){ // Add victimRef parameter
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene, BABYLON.Texture.NEAREST_NEAREST);
    let loadedGUI = await advancedTexture.parseFromURLAsync("./json/guiTexture.json");
    
    setUpButtons(advancedTexture, buttonList, light, victimRef);
    
    HUD.playerScore = advancedTexture.getControlByName("PlayerScore");
    HUD.playerScore.paddingLeft = "30px"
    HUD.scoreLabel = advancedTexture.getControlByName("ScoreLabel");
    HUD.title = advancedTexture.getControlByName("Title");
    HUD.subtitle = advancedTexture.getControlByName("Subtitle");
    HUD.challenge = advancedTexture.getControlByName("challenge");
    HUD.challenge.paddingLeft = "30px"
    HUD.typingTest = typingTest;
    HUD.victim = victimRef; // Store victim reference
    
    setupTimer(scene, engine, HUD.challenge);
    setupScore(scene, HUD.typingTest, HUD.playerScore, 0);
    setupVictimHealing(scene, HUD.typingTest, HUD.victim)
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

function setupVictimHealing(scene, typingTest, victim) {
    let lastCorrectWords = 0;
    let lastIncorrectCharacters = 0; // Track incorrect characters
    const healAmount = 10; // HP restored per correct word
    const damageAmount = 5; // HP lost per incorrect character
    
    scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted && victim) {
            const stats = typingTest.getStats();
            const currentCorrectWords = stats.correctWords;
            const currentIncorrectCharacters = stats.incorrectCharacters;
            
            // Check if a new word was typed correctly
            if (currentCorrectWords > lastCorrectWords) {
                const newWords = currentCorrectWords - lastCorrectWords;
                victim.modifyHealth(healAmount * newWords);
                console.log(`Healed ${healAmount * newWords} HP for ${newWords} correct word(s)`);
                lastCorrectWords = currentCorrectWords;
            }
            
            // Check if incorrect characters increased
            if (currentIncorrectCharacters > lastIncorrectCharacters) {
                const newErrors = currentIncorrectCharacters - lastIncorrectCharacters;
                victim.modifyHealth(-damageAmount * newErrors);
                console.log(`Damaged ${damageAmount * newErrors} HP for ${newErrors} incorrect character(s)`);
                lastIncorrectCharacters = currentIncorrectCharacters;
            }
        }
    });
}

function setupTimer(scene, engine, target){
    let timeElapsed = 0;
    const targetTime = 300; // 5 mins
    
    scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted){
            timeElapsed += engine.getDeltaTime() / 1000;
            
            if (timeElapsed >= targetTime) {
                target.text = "Time's Up!";
                window.gameStarted = false; // This stops everything
                console.log("%cGame Over - Time's Up!", "color: red; font-size: 24px;");
            } else {
                target.text = `Time: ${timeElapsed.toFixed(1)}s`;
            }
        }
    });
}
export function hideTitleScreen(light) { // Remove victim parameter
    HUD.title.isVisible = false;
    HUD.subtitle.isVisible = false;
    window.gameStarted = true;
    buttonList.startGameButton.isVisible = false;
    light.width = 30;
    light.intensity = 1.55;
    HUD.typingTest.startTest();
    
    // Show victim and health bars using HUD.victim
    if (HUD.victim) {
        HUD.victim.isVisible = true;
        HUD.victim.healthBarBg.isVisible = true;
        HUD.victim.healthBarFg.isVisible = true;
    }
}

// Helper function to modify victim health from anywhere
export function modifyVictimHealth(amount) {
    if (HUD.victim) {
        HUD.victim.modifyHealth(amount);
    }
}