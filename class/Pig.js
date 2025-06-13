// --- CONSTANTS FOR PIG LOGIC ---
const PIG_ACTIVATION_DISTANCE = 250;
const PIG_SPEED = 2.2;
const PIG_ATTACK_RANGE = 45;
const PIG_ATTACK_COOLDOWN = 45;
const PIG_MAX_HEALTH = 3;

// --- PIG ENEMY CLASS ---
class Pig {
  constructor(x = windowWidth / 2 + windowWidth / 4, y = windowHeight / 2) {
    // --- PIG STATE ---
    this.isJumping = false;
    this.activated = false;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.health = PIG_MAX_HEALTH;
    this.dead = false;
    this.hitCooldown = 0;
    this.spawnX = x;
    this.spawnY = y;
    this.pigSpi = null;
    this.hitBoxPig = null;
  }

  // --- SETUP SPRITES AND ANIMATIONS ---
  pre(spriteSheet) {
    this.hitBoxPig = new Sprite(this.spawnX, this.spawnY, 34, 28);
    this.pigSpi = new Sprite(this.hitBoxPig.x, this.hitBoxPig.y, 34, 28);
    this.pigSpi.spriteSheet = spriteSheet;
    this.pigSpi.addAnis({
      death:  { row: 0, frames: 4, frameDelay: 10 },
      fall:   { row: 1 },
      ground: { row: 2 },
      hit:    { row: 3, frames: 2, frameDelay: 8 },
      idle:   { row: 4, frames: 11, frameDelay: 6 },
      jump:   { row: 5, frames: 1 },
      run:    { row: 6, frames: 6, frameDelay: 6 },
      attack: { row: 7, frames: 5, frameDelay: 6 }
    });
    this.pigSpi.changeAni('idle');
    this.hitBoxPig.rotationLock = true;
    this.pigSpi.rotationLock = true;
    this.hitBoxPig.collider = "dynamic";
    this.hitBoxPig.debug = true;
    this.pigSpi.visible = false;
    this.hitBoxPig.visible = false;
  }

  // --- PIG MOVEMENT AND ACTIVATION LOGIC ---
  move(playerX, playerY) {
    // If pig is dead or in hit animation, don't move
    if (this.dead || this.pigSpi.ani?.name === 'hit') {
      this.hitBoxPig.vel.x = 0;
      return;
    }

    // Calculate distance to player
    const dx = playerX - this.hitBoxPig.x;
    const dy = playerY - this.hitBoxPig.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    // Activate pig if player is close enough
    if (!this.activated && distToPlayer < PIG_ACTIVATION_DISTANCE) {
      this.activated = true;
    }

    if (this.activated) {
      // --- JUMPING LOGIC ---
      const onGround = this.hitBoxPig.vel.y === 0;
      const kingIsAbove = dy < -30;
      const kingIsCloseX = Math.abs(dx) < 60;

      let wallInFront = false;
      let edgeAhead = false;

      const checkX = this.hitBoxPig.x + Math.sign(dx) * 20;
      const checkY = this.hitBoxPig.y + 10;
      const groundCheckY = this.hitBoxPig.y + 30;

      // Check for wall in front
      wallInFront = allSprites.some(s => s !== this.hitBoxPig && s.collider === "static" && Math.abs(s.x - checkX) < 20 && Math.abs(s.y - checkY) < 30);
      // Check for edge ahead
      edgeAhead = !allSprites.some(s => s !== this.hitBoxPig && s.collider === "static" && Math.abs(s.x - checkX) < 20 && Math.abs(s.y - groundCheckY) < 10);

      // Jump if player is above and there's a wall or edge
      if (onGround && kingIsAbove && kingIsCloseX && (wallInFront || edgeAhead)) {
        this.hitBoxPig.vel.y = -7;
        this.isJumping = true;
      }

      // --- ATTACK AND CHASE LOGIC ---
      if (distToPlayer < PIG_ATTACK_RANGE) {
        this.hitBoxPig.vel.x = 0;
        this.isAttacking = true;
      }
      else if (distToPlayer < PIG_ATTACK_RANGE + 30) {
        // Approach slowly when near attack range
        const angle = Math.atan2(dy, dx);
        this.hitBoxPig.vel.x = Math.cos(angle) * (PIG_SPEED * 0.5);
        this.isAttacking = false;
      }
      else {
        // Chase player
        const angle = Math.atan2(dy, dx);
        this.hitBoxPig.vel.x = Math.cos(angle) * PIG_SPEED;
        this.isAttacking = false;
      }

      // Flip sprite based on direction
      this.pigSpi.mirror.x = dx > 0;
    }
    else {
      // Not activated, don't move
      this.hitBoxPig.vel.x = 0;
      this.isAttacking = false;
    }
  }

  // --- HANDLE ATTACKING THE PLAYER ---
  handleAttack(playerObj) {
    if (this.dead || !playerObj || !playerObj.hitBox) {
      return;
    }

    // Calculate distance to player
    const dx = playerObj.hitBox.x - this.hitBoxPig.x;
    const dy = playerObj.hitBox.y - this.hitBoxPig.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only attack if in attack mode, cooldown is done, in range, and not already attacking
    if (
      this.isAttacking && 
      this.attackCooldown <= 0 &&
      distance < PIG_ATTACK_RANGE &&
      this.pigSpi.ani?.name !== 'attack'
    ) {
      this.pigSpi.changeAni('attack');
      playerObj.takeDamage(this.hitBoxPig.x);
      this.attackCooldown = PIG_ATTACK_COOLDOWN;
    }

    // Update cooldowns
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    if (this.hitCooldown > 0) {
      this.hitCooldown--;
    }
  }

  // --- HANDLE TAKING DAMAGE FROM PLAYER ---
  takeHit(attackerX) {
    if (this.dead || this.hitCooldown > 0) {
      return;
    }
    this.health--;
    this.hitCooldown = 20;
    this.pigSpi.changeAni('hit');
    this.pigSpi.ani.frame = 0;

    // Knockback direction
    const direction = this.hitBoxPig.x < attackerX ? -1 : 1;
    this.hitBoxPig.vel.x = direction * 24;
    this.hitBoxPig.vel.y = -3; // Apply some vertical knockback

    // If health runs out, die
    if (this.health <= 0) {
      this.dead = true;
      this.pigSpi.changeAni('death');
    }
  }

  // --- SYNC SPRITE AND HITBOX POSITIONS ---
  colliderAndhitBox() {
    this.pigSpi.collider = "NONE";
    this.pigSpi.position.x = this.hitBoxPig.position.x - 2;
    this.pigSpi.position.y = this.hitBoxPig.position.y - 6.5;
  }

  // --- HANDLE ANIMATION STATES ---
  handleAnimations() {
    if (this.dead) {
      return;
    }

    // Priority: attack > hit > run > idle
    if (this.pigSpi.ani?.name === 'attack' && this.pigSpi.ani.frame < this.pigSpi.ani.lastFrame) {
      return; // Let attack animation finish
    }
    if (this.pigSpi.ani?.name === 'hit' && this.pigSpi.ani.frame < this.pigSpi.ani.lastFrame) {
      return; // Let hit animation finish
    }

    if (this.hitCooldown > 0) {
      this.pigSpi.changeAni('hit');
    }
    else if (this.isAttacking && this.attackCooldown <= 0) {
      if (this.pigSpi.ani?.name !== 'attack') {
        this.pigSpi.changeAni('attack');
      }
    }
    else if (Math.abs(this.hitBoxPig.vel.x) > 0.1) {
      this.pigSpi.changeAni('run');
    }
    else {
      this.pigSpi.changeAni('idle');
    }
  }

  // --- MAIN UPDATE/DRAW LOOP FOR PIG ---
  doAll(playerX, playerY, playerObj) {
    // Check if pig is already destroyed
    if (!this.pigSpi || !this.hitBoxPig) {
      return;
    }

    // --- DEATH ANIMATION AND CLEANUP ---
    if (this.dead) {
      // Update position for final death animation
      this.pigSpi.position.x = this.hitBoxPig.position.x - 2;
      this.pigSpi.position.y = this.hitBoxPig.position.y - 6.5;
      
      // Only continue if we're still showing death animation
      if (this.pigSpi.ani?.name === 'death') {
        if (this.pigSpi.ani.frame >= this.pigSpi.ani.lastFrame) {
          // Once death animation completes, destroy the pig
          this.destroy();
          return;
        }
        
        // Draw the final frames of death animation
        this.pigSpi.scale = 1.7;
        this.pigSpi.update();
        this.pigSpi.draw();
        return;
      }
    }

    // --- FREEZE IF PLAYER IS DEAD ---
    if (playerObj.isDead) {
      this.hitBoxPig.vel.x = 0;
      this.hitBoxPig.vel.y = 0;
      if (this.pigSpi.ani) {
        this.pigSpi.ani.play = false;
      }
      this.pigSpi.position.x = this.hitBoxPig.position.x - 2;
      this.pigSpi.position.y = this.hitBoxPig.position.y - 6.5;
      this.pigSpi.scale = 1.7;
      this.pigSpi.update();
      this.pigSpi.draw();
      return;
    }

    // --- NORMAL BEHAVIOR WHEN PLAYER IS ALIVE ---
    this.move(playerX, playerY);
    this.handleAttack(playerObj);
    this.handleAnimations();
    this.colliderAndhitBox();

    this.pigSpi.position.x = this.hitBoxPig.position.x - 2;
    this.pigSpi.position.y = this.hitBoxPig.position.y - 6.5;
    this.pigSpi.scale = 1.7;
    this.pigSpi.update();
    this.pigSpi.draw();
  }

  // --- GET PIG X/Y ---
  getX() {
    return this.hitBoxPig.x; 
  }
  getY() {
    return this.hitBoxPig.y; 
  }

  // --- REMOVE ALL SPRITES ---
  destroy() {
    this.hitBoxPig?.remove();
    this.hitBoxPig = null;
    this.pigSpi?.remove();
    this.pigSpi = null;
  }
}

// Expose Pig to global scope
window.Pig = Pig;
