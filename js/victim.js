export function createVictim(scene, index = 0) {
    // Sprite images for each victim position
    const victimSprites = [
        "./js/sprites/human1.png",  // Position 0
        "./js/sprites/human2.png",  // Position 1
        "./js/sprites/human3.png"   // Position 2
    ];

    // Create sprite manager for this victim
    const spriteManager = new BABYLON.SpriteManager(
        `victimSpriteManager_${index}`,
        victimSprites[index] || victimSprites[0], // Fallback to first sprite
        1, // Only 1 sprite needed
        { width: 64, height: 64 }, // Adjust to your sprite size
        scene
    );

    // Create the sprite
    const victimSprite = new BABYLON.Sprite(`victimSprite_${index}`, spriteManager);
    victimSprite.width = 4;  // Width in world units
    victimSprite.height = 3; // Height in world units
    victimSprite.position = new BABYLON.Vector3(0, 0.02, -4);

    // Create a transform node to act as the "victim" object
    const victim = new BABYLON.TransformNode(`victim_${index}`, scene);
    victim.position = new BABYLON.Vector3(0, 0.02, -4);
    
    // Store sprite reference on victim
    victim.sprite = victimSprite;
    
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
        this.healthBarBg.position.y = this.position.y + 2.5; // Adjusted for sprite height
        this.healthBarBg.position.z = this.position.z - 1.5;
        
        this.healthBarFg.position.x = this.position.x;
        this.healthBarFg.position.y = this.position.y + 2.6;
        this.healthBarFg.position.z = this.position.z - 1.5;
        
        // Update sprite position to match victim
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        this.sprite.position.z = this.position.z;
        
        // Update fill based on health
        const healthPercent = Math.max(0, this.currentHealth / this.maxHealth);
        this.healthBarFg.scaling.x = healthPercent || 0.001;
        
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
    
    // Override isVisible to control sprite visibility
    Object.defineProperty(victim, 'isVisible', {
        get: function() {
            return this.sprite.isVisible;
        },
        set: function(value) {
            this.sprite.isVisible = value;
        }
    });
    
    // Hide initially
    victim.isVisible = false;
    victim.healthBarBg.isVisible = false;
    victim.healthBarFg.isVisible = false;
    
    return victim;
}