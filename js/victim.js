export function createVictim(scene, index = 0) {
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

    victim.maxHealth = 200;
    victim.currentHealth = 0;
    victim.drainRate = 0;
    victim.isDead = false;

    // Create health bar for this victim
    const healthBarWidth = 2;
    const healthBarHeight = 0.3;

    // Background bar (red)
    victim.healthBarBg = BABYLON.MeshBuilder.CreatePlane(`healthBarBg_${index}`, {
        width: healthBarWidth,
        height: healthBarHeight
    }, scene);
    victim.healthBarBg.rotation.x = Math.PI / 2;
    victim.healthBarBg.isPickable = false;

    const bgMaterial = new BABYLON.StandardMaterial(`healthBgMat_${index}`, scene);
    bgMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
    bgMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
    victim.healthBarBg.material = bgMaterial;

    // Foreground bar (green)
    victim.healthBarFg = BABYLON.MeshBuilder.CreatePlane(`healthBarFg_${index}`, {
        width: healthBarWidth,
        height: healthBarHeight
    }, scene);
    victim.healthBarFg.rotation.x = Math.PI / 2;
    victim.healthBarFg.isPickable = false;

    victim.fgMaterial = new BABYLON.StandardMaterial(`healthFgMat_${index}`, scene);
    victim.fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
    victim.fgMaterial.emissiveColor = new BABYLON.Color3(0, 0.5, 0);
    victim.healthBarFg.material = victim.fgMaterial;

    victim.healthBarWidth = healthBarWidth;

    // Update health bar position and fill
    victim.updateHealthBar = function() {
        // Position health bar above victim
        this.healthBarBg.position.x = this.position.x;
        this.healthBarBg.position.y = this.position.y + 0.1;
        this.healthBarBg.position.z = this.position.z - 1.5;

        this.healthBarFg.position.x = this.position.x;
        this.healthBarFg.position.y = this.position.y + 0.11;
        this.healthBarFg.position.z = this.position.z - 1.5;

        // Update fill based on health
        const healthPercent = Math.max(0, this.currentHealth / this.maxHealth);
        this.healthBarFg.scaling.x = healthPercent || 0.001; // Prevent 0 scale

        // Offset to fill from left
        const offset = (this.healthBarWidth * (1 - healthPercent)) / 2;
        this.healthBarFg.position.x = this.position.x - offset;

        // Change color based on health
        if (healthPercent > 0.5) {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        } else if (healthPercent > 0.25) {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        } else {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        }
    };

    // Modify health helper
    victim.modifyHealth = function(amount) {
        this.currentHealth = Math.max(0, Math.min(this.maxHealth, this.currentHealth + amount));
        this.updateHealthBar();
    };

    // Hide initially
    victim.isVisible = false;
    victim.healthBarBg.isVisible = false;
    victim.healthBarFg.isVisible = false;

    return victim;
}