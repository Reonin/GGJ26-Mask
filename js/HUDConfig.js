let startGameButton;
let playerScore = {},
scoreLabel = {},
title = {},
subtitle = {};
let currentRound = 0; 
const buttonList = {
    startGameButton,
};

const HUD = {
    playerScore,
    scoreLabel,
    title,
    subtitle,
    currentRound
}

export async function setUpHUD(BABYLON, scene){
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene, BABYLON.Texture.NEAREST_NEAREST);
    let loadedGUI = await advancedTexture.parseFromURLAsync("./json/guiTexture.json");
    
    setUpButtons(advancedTexture, buttonList);

    HUD.playerScore = advancedTexture.getControlByName("PlayerScore");
    HUD.scoreLabel = advancedTexture.getControlByName("scoreLabel");
    HUD.title = advancedTexture.getControlByName("Title");
    HUD.subtitle = advancedTexture.getControlByName("Subtitle");
    HUD.challenge = advancedTexture.getControlByName("challenge");
   


    return HUD;
}

function setUpButtons(advancedTexture, buttonList) {
    buttonList.startGameButton = advancedTexture.getControlByName("Start Game");
    buttonList.startGameButton.onPointerUpObservable.add(function () {
        hideTitleScreen();
        console.log("%cStart Game Pressed", "color:green");
    });
}


export function hideTitleScreen() {
        HUD.title.isVisible = false;
        HUD.subtitle.isVisible = false;

        buttonList.startGameButton.isVisible = false;
}