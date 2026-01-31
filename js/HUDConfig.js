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

const HUD = {
    playerScore,
    scoreLabel,
    title,
    subtitle,
    currentRound,
    typingTest
}

export async function setUpHUD(BABYLON, scene, light, engine, typingTest){
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene, BABYLON.Texture.NEAREST_NEAREST);
    let loadedGUI = await advancedTexture.parseFromURLAsync("./json/guiTexture.json");
    
    setUpButtons(advancedTexture, buttonList, light);

    HUD.playerScore = advancedTexture.getControlByName("PlayerScore");
    HUD.scoreLabel = advancedTexture.getControlByName("ScoreLabel");
    HUD.title = advancedTexture.getControlByName("Title");
    HUD.subtitle = advancedTexture.getControlByName("Subtitle");
    HUD.challenge = advancedTexture.getControlByName("challenge");
    HUD.typingTest = typingTest;

    setupTimer(scene, engine, HUD.challenge);
    setupScore(scene, HUD.typingTest, HUD.playerScore);
    return HUD;
}

function setUpButtons(advancedTexture, buttonList, light) {
    buttonList.startGameButton = advancedTexture.getControlByName("Start Game");
    buttonList.startGameButton.onPointerUpObservable.add(function () {
        hideTitleScreen(light);
        console.log("%cStart Game Pressed", "color:green");
    });
}
function setupScore(scene, typingTest, target){
     scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted){
            //let points = ((Correct Characters typed - incorrect chars)) *1. WPM

            const stats = typingTest.getStats();
            const typingScore = (stats.correctWords - stats.incorrectCharacters) * (1 + stats.wordsPerMinute);
            const toolScore = window.toolScore || 0;
            target.text = Math.floor(typingScore + toolScore);
        }
    });
}

function setupTimer(scene, engine, target){
    let timeElapsed = 0;
    const targetTime = 300; // 5 mins
    // Register an observer to update the time every frame
    scene.onBeforeRenderObservable.add(() => {
        if(window.gameStarted){
            // getDeltaTime() returns the time in milliseconds since the last frame
            timeElapsed += engine.getDeltaTime() / 1000; // Convert to seconds

            if (timeElapsed >= targetTime) {
                target.text = "Time's Up!";
                // Stop the timer by removing the observer
                scene.onBeforeRenderObservable.remove(this);
                // Add your end-of-game logic here
            } else {
                // Display the time, formatted to one decimal place
                target.text = `Time: ${timeElapsed.toFixed(1)}s`;
            }
        }
    });

}

export function hideTitleScreen(light) {
        HUD.title.isVisible = false;
        HUD.subtitle.isVisible = false;
        window.gameStarted = true;
        buttonList.startGameButton.isVisible = false;
        light.width = 30;
        light.intensity = 1.55;
        HUD.typingTest.startTest();
}