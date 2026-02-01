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
        victimSprites[index] || victimSprites[0],
        1,
        { width: 64, height: 64 },
        scene
    );

    const victimSprite = new BABYLON.Sprite(`victimSprite_${index}`, spriteManager);
    victimSprite.width = 4;
    victimSprite.height = 3;
    victimSprite.position = new BABYLON.Vector3(0, 0.02, -4);

    const victim = new BABYLON.TransformNode(`victim_${index}`, scene);
    victim.position = new BABYLON.Vector3(0, 0.02, -4);
    
    victim.sprite = victimSprite;
    victim.isPickable = false;
    victim.maxHealth = 200;
    victim.currentHealth = 0;
    victim.drainRate = 0;
    victim.isDead = false;
    
    // Shake animation properties
    victim.isShaking = false;
    victim.originalPosition = victim.position.clone();

    const healthBarWidth = 2;
    const healthBarHeight = 0.3;
    
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
    
    // Shake animation function
    victim.shake = function() {
        if (this.isShaking) return;
        
        this.isShaking = true;
        const shakeIntensity = 0.5;
        const shakeDuration = 500;
        const shakeFrequency = 40;
        const startTime = Date.now();
        
        // Store the CURRENT position at shake start, not the original
        const shakeStartX = this.position.x;
        const shakeStartY = this.position.y;
        
        const shakeInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / shakeDuration;
            
            if (progress >= 1) {
                // Reset to shake start position
                this.position.x = shakeStartX;
                this.position.y = shakeStartY;
                this.isShaking = false;
                clearInterval(shakeInterval);
                this.updateHealthBar();
                return;
            }
            
            const dampen = 1 - progress;
            
            const offsetX = (Math.random() - 0.5) * shakeIntensity * dampen;
            const offsetY = (Math.random() - 0.5) * shakeIntensity * dampen;
            
            // Shake around the shake start position, not originalPosition
            this.position.x = shakeStartX + offsetX;
            this.position.y = shakeStartY + offsetY;
            
            this.updateHealthBar();
        }, 1000 / shakeFrequency);
    };
    
    victim.updateHealthBar = function() {
        this.healthBarBg.position.x = this.position.x;
        this.healthBarBg.position.y = this.position.y + 2.5;
        this.healthBarBg.position.z = this.position.z - 1.5;
        
        this.healthBarFg.position.x = this.position.x;
        this.healthBarFg.position.y = this.position.y + 2.6;
        this.healthBarFg.position.z = this.position.z - 1.5;
        
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        this.sprite.position.z = this.position.z;
        
        const healthPercent = Math.max(0, this.currentHealth / this.maxHealth);
        this.healthBarFg.scaling.x = healthPercent || 0.001;
        
        const offset = (this.healthBarWidth * (1 - healthPercent)) / 2;
        this.healthBarFg.position.x = this.position.x - offset;
        
        if (healthPercent > 0.5) {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        } else if (healthPercent > 0.25) {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        } else {
            this.fgMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        }
    };
    
    victim.modifyHealth = function(amount) {
        this.currentHealth = Math.max(0, Math.min(this.maxHealth, this.currentHealth + amount));
        
        // Trigger shake on damage (negative amount)
        if (amount < 0) {
            this.shake();
        }
        
        this.updateHealthBar();
    };
    
    Object.defineProperty(victim, 'isVisible', {
        get: function() {
            return this.sprite.isVisible;
        },
        set: function(value) {
            this.sprite.isVisible = value;
        }
    });
    
    victim.isVisible = false;
    victim.healthBarBg.isVisible = false;
    victim.healthBarFg.isVisible = false;
    
    return victim;
}