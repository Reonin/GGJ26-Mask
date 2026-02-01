let startGameButton;
let playerScore = {},
    scoreLabel = {},
    title = {},
    subtitle = {};

let currentRound = 0;

const buttonList = {
    startGameButton,
};

let victimManager;

const HUD = {
    playerScore,
    scoreLabel,
    title,
    subtitle,
    currentRound,
    typingTests: {},   // now stores 3 instances
    victimManager
};

export async function setUpHUD(
    BABYLON,
    scene,
    light,
    engine,
    typingTests,        // now receives all 3 TypingTests
    victimManagerRef
) {
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
        "GUI",
        true,
        scene,
        BABYLON.Texture.NEAREST_NEAREST
    );

    let loadedGUI = await advancedTexture.parseFromURLAsync("./json/guiTexture.json");

    setUpButtons(advancedTexture, buttonList, light, victimManagerRef);
    createMuteButton(advancedTexture);

    HUD.playerScore = advancedTexture.getControlByName("PlayerScore");
    HUD.playerScore.paddingLeft = "30px";

    HUD.scoreLabel = advancedTexture.getControlByName("ScoreLabel");
    HUD.title = advancedTexture.getControlByName("Title");
    HUD.subtitle = advancedTexture.getControlByName("Subtitle");

    HUD.challenge = advancedTexture.getControlByName("challenge");
    HUD.challenge.paddingLeft = "30px";

    HUD.typingTests = typingTests;      // store all 3
    HUD.victimManager = victimManagerRef;

    setupTimer(scene, engine, HUD.challenge);
    setupScore(scene, engine, HUD.playerScore, 0);
    setupVictimHealing(scene, HUD.typingTests, HUD.victimManager);

    return HUD;
}

function setUpButtons(advancedTexture, buttonList, light, victimManager) {
    buttonList.startGameButton = advancedTexture.getControlByName("Start Game");

    buttonList.startGameButton.onPointerUpObservable.add(function () {
        hideTitleScreen(light);
        console.log("%cStart Game Pressed", "color:green");
    });

    buttonList.startGameButton.onPointerEnterObservable.add(() => {
        document.body.style.cursor = "pointer";
    });

    buttonList.startGameButton.onPointerOutObservable.add(() => {
        document.body.style.cursor = "none";
    });
}

function createMuteButton(advancedTexture) {
    const muteButton = BABYLON.GUI.Button.CreateSimpleButton("muteBtn", "Mute");
    muteButton.width = "80px";
    muteButton.height = "30px";
    muteButton.color = "white";
    muteButton.cornerRadius = 5;
    muteButton.background = "green";
    muteButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    muteButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    muteButton.left = "350px";
    muteButton.top = "-10px";

    muteButton.onPointerUpObservable.add(function () {
        if (window.audioManager) {
            const isMuted = window.audioManager.toggleMute();
            muteButton.children[0].text = isMuted ? "Unmute" : "Mute";
            muteButton.background = isMuted ? "red" : "green";
        }
    });

    muteButton.onPointerEnterObservable.add(() => {
        document.body.style.cursor = "pointer";
    });

    muteButton.onPointerOutObservable.add(() => {
        document.body.style.cursor = "none";
    });

    advancedTexture.addControl(muteButton);
}

function setupScore(scene, engine, target) {
    let timeElapsed = 0;
    const targetTime = 5;
    let gameEnded = false;

    scene.onBeforeRenderObservable.add(() => {
        if (window.gameStarted && !gameEnded) {
            timeElapsed += engine.getDeltaTime() / 1000;

            if (timeElapsed >= targetTime) {
                const score = window.toolScore += (1 * HUD.victimManager.getVictimCount());
                target.text = score;
                timeElapsed = 0;
            }
        }
    });
}

function setupVictimHealing(scene, typingTests, victimManager) {
    scene.onBeforeRenderObservable.add(() => {
        if (!window.gameStarted || !victimManager) return;

        Object.values(typingTests).forEach(test => {
            const stats = test.getStats();

            if (!test._lastCorrectWords) test._lastCorrectWords = 0;
            if (!test._lastIncorrectCharacters) test._lastIncorrectCharacters = 0;

            if (stats.correctWords > test._lastCorrectWords) {
                const newWords = stats.correctWords - test._lastCorrectWords;
                victimManager.healActiveVictim(50 * newWords);
                console.log(`Healed ${50 * newWords} HP from TypingTest ${test.instanceId}`);
                test._lastCorrectWords = stats.correctWords;
            }

            if (stats.incorrectCharacters > test._lastIncorrectCharacters) {
                const newErrors = stats.incorrectCharacters - test._lastIncorrectCharacters;
                victimManager.healActiveVictim(-5 * newErrors);
                console.log(`Damaged ${5 * newErrors} HP from TypingTest ${test.instanceId}`);
                test._lastIncorrectCharacters = stats.incorrectCharacters;
            }
        });
    });
}

function setupTimer(scene, engine, target) {
    let timeElapsed = 0;
    const targetTime = 300;
    let gameEnded = false;

    scene.onBeforeRenderObservable.add(() => {
        if (window.gameStarted && !gameEnded) {
            timeElapsed += engine.getDeltaTime() / 1000;

            if (HUD.victimManager && HUD.victimManager.gameOver) {
                resetToDefault();
                gameEnded = true;
                window.gameStarted = false;
                target.text = "Too Many Victims!";
                console.log("%cGame Over - Too Many Victims!", "color: red; font-size: 24px;");
            }
            else if (timeElapsed >= targetTime) {
                resetToDefault();
                gameEnded = true;
                window.gameStarted = false;
                target.text = "Time's Up!";
                console.log("%cGame Over - Time's Up!", "color: red; font-size: 24px;");
            }
            else {
                target.text = `Patients: ${HUD.victimManager ? HUD.victimManager.getVictimCount() : 0}/3`;
            }
        }
    });
}

export function resetToDefault() {
    HUD.title.isVisible = true;
    HUD.subtitle.isVisible = true;
    buttonList.startGameButton.isVisible = true;

    Object.values(HUD.typingTests).forEach(test => {
        test.resetPosition()
        test.stopTest()

    });

    window.toolScore = 0;
}

export function hideTitleScreen(light) {
    HUD.title.isVisible = false;
    HUD.subtitle.isVisible = false;
    window.gameStarted = true;
    buttonList.startGameButton.isVisible = false;

    light.width = 30;
    light.intensity = 1.55;
     document.body.style.cursor = "none";

    Object.values(HUD.typingTests).forEach(test => test.startTest());

    if (HUD.victimManager) {
        HUD.victimManager.start();
    }

    if (window.gameElements) {
        if (window.gameElements.dancer) window.gameElements.dancer.isVisible = true;
        if (window.gameElements.table) window.gameElements.table.isVisible = true;
        if (window.gameElements.handMotions) window.gameElements.handMotions.show();
        if (window.gameElements.toolManager) window.gameElements.toolManager.show();
    }
}

export function modifyVictimHealth(amount) {
    if (HUD.victimManager) {
        HUD.victimManager.healActiveVictim(amount);
    }
}
