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
    victimManager,
    startScreenBg: null
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

    // Create start screen background image
    createStartScreenBackground(advancedTexture);

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

function createStartScreenBackground(advancedTexture) {
    const bgImage = new BABYLON.GUI.Image("startScreenBg", "./assets/plaguearism.png");
    bgImage.width = "100%";
    bgImage.height = "100%";
    bgImage.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
    bgImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    bgImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    bgImage.zIndex = -1; // Behind other elements

    advancedTexture.addControl(bgImage);
    HUD.startScreenBg = bgImage;
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
        if(window.gameStarted){
			document.body.style.cursor = "none";
		}
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
                target.text = `Villagers: ${HUD.victimManager ? HUD.victimManager.getVictimCount() : 0}/3`;
            }
        }
    });
}

export function resetToDefault() {
    HUD.title.isVisible = true;
    HUD.subtitle.isVisible = true;
    buttonList.startGameButton.isVisible = true;
    if (HUD.startScreenBg) HUD.startScreenBg.isVisible = true;

    HUD.title.text = "Restarting Game in 5 seconds";
    setTimeout(function() {
        window.location.reload();
    }, 5000);

    Object.values(HUD.typingTests).forEach(test => {
        test.resetPosition();
        test.stopTest();
        test.container.style.display = 'none';
    });

    // Also hide any dynamically created typing tests
    if (window.typingTests) {
        Object.values(window.typingTests).forEach(test => {
            if (test) {
                test.stopFalling();
                test.container.style.display = 'none';
            }
        });
    }

    window.toolScore = 0;
}

export function hideTitleScreen(light) {
    HUD.title.isVisible = false;
    HUD.subtitle.isVisible = false;
    window.gameStarted = true;
    buttonList.startGameButton.isVisible = false;
    if (HUD.startScreenBg) HUD.startScreenBg.isVisible = false;

    light.width = 30;
    light.intensity = 1.55;
     document.body.style.cursor = "none";

    // Start typing tests with staggered delays so words don't all fall at once
    Object.values(HUD.typingTests).forEach((test, index) => {
        // Make container visible again
        test.container.style.display = 'block';

        const delay = index * (1500 + Math.random() * 2000); // 1.5-3.5 seconds between each
        setTimeout(() => {
            if (window.gameStarted) {
                test.startTest();
            }
        }, delay);
    });

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
