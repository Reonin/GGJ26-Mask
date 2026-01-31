export function createVictim(scene) {
    // Victim placeholder - long oval on the table
    const victim = BABYLON.MeshBuilder.CreateDisc("victim", {
        radius: .65,
        tessellation: 32
    }, scene);



    victim.scaling = new BABYLON.Vector3(3.5, 1.5, 1.5);
    victim.rotation.x = Math.PI / 2;
    victim.position = new BABYLON.Vector3(0, 0.02, -4);
    
    const victimMat = new BABYLON.StandardMaterial("victimMat", scene);
    victimMat.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.65);
    victimMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0.2);
    victimMat.backFaceCulling = false;
    victim.material = victimMat;
    victim.isPickable = false;

    // Health system
    victim.maxHealth = 200;
    victim.currentHealth = 200;
    victim.drainRate = 5; // Increased from 1 to 5 for more visible draining
    victim.isDead = false;

    // Create health bar above victim
    const healthBarWidth = 2;
    const healthBarHeight = 0.3;
    
    // Background bar (red)
    const healthBarBg = BABYLON.MeshBuilder.CreatePlane("healthBarBg", {
        width: healthBarWidth,
        height: healthBarHeight
    }, scene);
    healthBarBg.position = new BABYLON.Vector3(0, 0.1, -3);
    healthBarBg.rotation.x = Math.PI / 2;
    

    
    const bgMaterial = new BABYLON.StandardMaterial("healthBgMat", scene);
    bgMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
    bgMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
    healthBarBg.material = bgMaterial;
    healthBarBg.isPickable = false;

    // Foreground bar (green, will shrink)
    const healthBarFg = BABYLON.MeshBuilder.CreatePlane("healthBarFg", {
        width: healthBarWidth,
        height: healthBarHeight
    }, scene);
    healthBarFg.position = new BABYLON.Vector3(0, 0.11, -3);
    healthBarFg.rotation.x = Math.PI / 2;
    
    const fgMaterial = new BABYLON.StandardMaterial("healthFgMat", scene);
    fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
    fgMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
    healthBarFg.material = fgMaterial;
    healthBarFg.isPickable = false;

    // Store references
    victim.healthBarFg = healthBarFg;
    victim.healthBarBg = healthBarBg;
    victim.healthBarWidth = healthBarWidth;
    

    // Update health bar scale based on current health
    victim.updateHealthBar = function() {
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBarFg.scaling.x = healthPercent;
        
        // Adjust position to keep bar RIGHT-aligned (drains from right to left)
        const offset = (this.healthBarWidth * (1 - healthPercent)) / 2;
        this.healthBarFg.position.x = offset;

        // Change color based on health
        if (healthPercent > 0.5) {
            fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0); // Green
        } else if (healthPercent > 0.25) {
            fgMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Yellow
        } else {
            fgMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red
        }
    };

    // Drain health over time - ALWAYS drains when game is started
    scene.onBeforeRenderObservable.add(() => {
        if (window.gameStarted && !victim.isDead) {
            const deltaTime = scene.getEngine().getDeltaTime() / 1000; // Convert to seconds
            victim.currentHealth -= victim.drainRate * deltaTime;
            
            if (victim.currentHealth <= 0) {
                victim.currentHealth = 0;
                victim.isDead = true;
                console.log("Victim has died!");
                // Add game over logic here
            }
            
            victim.updateHealthBar();
        }
    });

    // Method to heal/damage the victim
    victim.modifyHealth = function(amount) {
        this.currentHealth = Math.max(0, Math.min(this.maxHealth, this.currentHealth + amount));
        this.updateHealthBar();
        console.log(`Health modified by ${amount}. Current health: ${this.currentHealth}`);
    };

    // Initial visibility
    victim.isVisible = false;
    healthBarBg.isVisible = false;
    healthBarFg.isVisible = false;

    return victim;
}