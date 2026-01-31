import { createTable } from './table.js';
import { createVictim } from './victim.js';

const TABLE_CENTER_X = 0;
const TABLE_Z = -4;
const OFF_SCREEN_X = 12; // Distance to move off screen


export function createPatientQueue(scene) {
    // Create initial table and victim
    let currentTable = createTable(scene);
    let currentVictim = createVictim(scene);

    // Parent the victim to the table so they move together
    currentVictim.parent = currentTable;
    currentVictim.position = new BABYLON.Vector3(4, 0.01, 0);
    currentVictim.rotation.x = 0; // Reset rotation since it inherits from parent

    const queue = {
        table: currentTable,
        victim: currentVictim,
        isTransitioning: false
    };

    return queue;
}

export function transitionToNextPatient(scene, queue, onComplete) {
    if (queue.isTransitioning) return;

    queue.isTransitioning = true;

    const oldTable = queue.table;
    const oldVictim = queue.victim;

    // Create new table and victim off-screen to the right
    const newTable = createTable(scene);
    newTable.position.x = OFF_SCREEN_X;

    const newVictim = createVictim(scene);
    newVictim.parent = newTable;
    newVictim.position = new BABYLON.Vector3(0, 0.01, 0);
    newVictim.rotation.x = 0; // Reset rotation since it inherits from parent

    // Animation duration in frames (60fps)
    const animationDuration = 30;

    // Animate old table moving right (off screen)
    const oldTableAnim = new BABYLON.Animation(
        "oldTableSlide",
        "position.x",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    oldTableAnim.setKeys([
        { frame: 0, value: TABLE_CENTER_X },
        { frame: animationDuration, value: -OFF_SCREEN_X }
    ]);

    // Animate new table moving to center
    const newTableAnim = new BABYLON.Animation(
        "newTableSlide",
        "position.x",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    newTableAnim.setKeys([
        { frame: 0, value: OFF_SCREEN_X },
        { frame: animationDuration, value: TABLE_CENTER_X }
    ]);

    // Add easing for smooth motion
    const easingFunction = new BABYLON.QuadraticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    oldTableAnim.setEasingFunction(easingFunction);
    newTableAnim.setEasingFunction(easingFunction);

    // Apply animations
    oldTable.animations = [oldTableAnim];
    newTable.animations = [newTableAnim];

    // Run both animations
    scene.beginAnimation(oldTable, 0, animationDuration, false);
    scene.beginAnimation(newTable, 0, animationDuration, false, 1, () => {
        // Clean up old table and victim
        oldVictim.dispose();
        oldTable.dispose();

        // Update queue references
        queue.table = newTable;
        queue.victim = newVictim;
        queue.isTransitioning = false;

        if (onComplete) onComplete();
    });
}
