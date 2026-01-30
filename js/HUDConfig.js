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

export async function setUpHUD(BABYLON, scene, light){
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, scene, BABYLON.Texture.NEAREST_NEAREST);
    let loadedGUI = await advancedTexture.parseFromURLAsync("./json/guiTexture.json");
    
    setUpButtons(advancedTexture, buttonList, light);

    HUD.playerScore = advancedTexture.getControlByName("PlayerScore");
    HUD.scoreLabel = advancedTexture.getControlByName("scoreLabel");
    HUD.title = advancedTexture.getControlByName("Title");
    HUD.subtitle = advancedTexture.getControlByName("Subtitle");
    HUD.challenge = advancedTexture.getControlByName("challenge");
   


    return HUD;
}

function setUpButtons(advancedTexture, buttonList, light) {
    buttonList.startGameButton = advancedTexture.getControlByName("Start Game");
    buttonList.startGameButton.onPointerUpObservable.add(function () {
        hideTitleScreen(light);
        console.log("%cStart Game Pressed", "color:green");
    });
}


export function hideTitleScreen(light) {
        HUD.title.isVisible = false;
        HUD.subtitle.isVisible = false;

        buttonList.startGameButton.isVisible = false;
        light.width = 30;
        light.intensity = 1.55;
}