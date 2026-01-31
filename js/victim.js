export function createVictim(scene, index = 0) {
    const victim = BABYLON.MeshBuilder.CreateDisc("victim", {
        radius: .65,
        tessellation: 32
    }, scene);

    victim.scaling = new BABYLON.Vector3(3.5, 1.5, 1.5);
    victim.rotation.x = Math.PI / 2;
    victim.position = new BABYLON.Vector3(0, 0.02, -4 - (index * 1.5)); // Offset by index

    const victimMat = new BABYLON.StandardMaterial("victimMat", scene);
    victimMat.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.65);
    victimMat.emissiveColor = new BABYLON.Color3(0.3, 0.25, 0.2);
    victimMat.backFaceCulling = false;
    victim.material = victimMat;
    victim.isPickable = false;

    victim.maxHealth = 200;
    victim.currentHealth = 0; // Start at 0
    victim.drainRate = 0; // Don't drain, only heal
    victim.isDead = false;

    const healthBarWidth = 2;
    const healthBarHeight = 0.3;
    
    const healthBarBg = BABYLON.MeshBuilder.CreatePlane("healthBarBg", {
        width: healthBarWidth,
        height: healthBarHeight
    }, scene);
    healthBarBg.position = new BABYLON.Vector3(0, 0.1, -3 - (index * 1.5)); // Offset by index
    healthBarBg.rotation.x = Math.PI / 2;
    
    const bgMaterial = new BABYLON.StandardMaterial("healthBgMat", scene);
    bgMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
    bgMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
    healthBarBg.material = bgMaterial;
    healthBarBg.isPickable = false;

    const healthBarFg = BABYLON.MeshBuilder.CreatePlane("healthBarFg", {
        width: healthBarWidth,
        height: healthBarHeight
    }, scene);
    healthBarFg.position = new BABYLON.Vector3(0, 0.11, -3 - (index * 1.5)); // Offset by index
    healthBarFg.rotation.x = Math.PI / 2;
    
    const fgMaterial = new BABYLON.StandardMaterial("healthFgMat", scene);
    fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
    fgMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
    healthBarFg.material = fgMaterial;
    healthBarFg.isPickable = false;

    victim.healthBarFg = healthBarFg;
    victim.healthBarBg = healthBarBg;
    victim.healthBarWidth = healthBarWidth;

    victim.updateHealthBar = function() {
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBarFg.scaling.x = healthPercent;
        
        // Now fills from LEFT to RIGHT (0 to 200)
        const offset = (this.healthBarWidth * (1 - healthPercent)) / 2;
        this.healthBarFg.position.x = -offset; // Changed from + to -
        
        if (healthPercent > 0.5) {
            fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        } else if (healthPercent > 0.25) {
            fgMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        } else {
            fgMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        }
    };

    victim.modifyHealth = function(amount) {
        this.currentHealth = Math.max(0, Math.min(this.maxHealth, this.currentHealth + amount));
        this.updateHealthBar();
        console.log(`Health modified by ${amount}. Current health: ${this.currentHealth}`);
    };

    victim.isVisible = false;
    healthBarBg.isVisible = false;
    healthBarFg.isVisible = false;

    return victim;
}