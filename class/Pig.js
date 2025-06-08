const PIG_ACTIVATION_DISTANCE = 250;
const PIG_SPEED = 2.2;
const PIG_ATTACK_RANGE = 45;  // Slightly increased
const PIG_ATTACK_COOLDOWN = 45;  // Slightly decreased
const PIG_MAX_HEALTH = 3;

class Pig {
  constructor(x = windowWidth / 2 + windowWidth / 4, y = windowHeight / 2) {
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
    this.hitBoxPig.collider = "dynamic";  // Keep this as dynamic
    this.hitBoxPig.debug = true;
    this.pigSpi.visible = false;
    this.hitBoxPig.visible = true;
  }

  move(playerX, playerY) {
    if (this.dead || this.pigSpi.ani?.name === 'hit') {
      this.hitBoxPig.vel.x = 0;
      return;
    }

    const dx = playerX - this.hitBoxPig.x;
    const dy = playerY - this.hitBoxPig.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    if (!this.activated && distToPlayer < PIG_ACTIVATION_DISTANCE) {
      this.activated = true;
    }

    if (this.activated) {
      const onGround = this.hitBoxPig.vel.y === 0;
      const kingIsAbove = dy < -30;
      const kingIsCloseX = Math.abs(dx) < 60;

      let wallInFront = false;
      let edgeAhead = false;

      const checkX = this.hitBoxPig.x + Math.sign(dx) * 20;
      const checkY = this.hitBoxPig.y + 10;
      const groundCheckY = this.hitBoxPig.y + 30;

      wallInFront = allSprites.some(s => s !== this.hitBoxPig && s.collider === "static" && Math.abs(s.x - checkX) < 20 && Math.abs(s.y - checkY) < 30);
      edgeAhead = !allSprites.some(s => s !== this.hitBoxPig && s.collider === "static" && Math.abs(s.x - checkX) < 20 && Math.abs(s.y - groundCheckY) < 10);

      if (onGround && kingIsAbove && kingIsCloseX && (wallInFront || edgeAhead)) {
        this.hitBoxPig.vel.y = -7;
        this.isJumping = true;
      }

      // Improve attack range check
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
        const angle = Math.atan2(dy, dx);
        this.hitBoxPig.vel.x = Math.cos(angle) * PIG_SPEED;
        this.isAttacking = false;
      }

      this.pigSpi.mirror.x = dx > 0;
    }
    else {
      this.hitBoxPig.vel.x = 0;
      this.isAttacking = false;
    }
  }

  handleAttack(playerObj) {
    if (this.dead || !playerObj || !playerObj.hitBox) {
      return;
    }

    const dx = playerObj.hitBox.x - this.hitBoxPig.x;
    const dy = playerObj.hitBox.y - this.hitBoxPig.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only start new attack if:
    // 1. In attack mode
    // 2. Cooldown is done
    // 3. Within range
    // 4. Not currently in attack animation
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

  takeHit(attackerX) {
    if (this.dead || this.hitCooldown > 0) {
      return;
    }
    this.health--;
    this.hitCooldown = 20;
    this.pigSpi.changeAni('hit');
    this.pigSpi.ani.frame = 0;

    const direction = this.hitBoxPig.x < attackerX ? -1 : 1;
    this.hitBoxPig.vel.x = direction * 24; // Increased from 18 to 24
    this.hitBoxPig.vel.y = -3; // Add small upward bounce

    if (this.health <= 0) {
      this.dead = true;
      this.pigSpi.changeAni('death');
    }
  }

  colliderAndhitBox() {
    this.pigSpi.collider = "NONE";
    this.pigSpi.position.x = this.hitBoxPig.position.x - 2;
    this.pigSpi.position.y = this.hitBoxPig.position.y - 6.5;
  }

  handleAnimations() {
    if (this.dead) {
      return;
    }

    // Priority handling for animations
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

  doAll(playerX, playerY, playerObj) {
    // Check if pig is already destroyed
    if (!this.pigSpi || !this.hitBoxPig) {
      return;
    }

    // Check if pig is dead
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

    // If player is dead, freeze the pig's animation and movement
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

    // Normal behavior when player is alive
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

  getX() {
    return this.hitBoxPig.x; 
  }
  getY() {
    return this.hitBoxPig.y; 
  }

  destroy() {
    this.hitBoxPig?.remove();
    this.hitBoxPig = null;
    this.pigSpi?.remove();
    this.pigSpi = null;
  }
}

window.Pig = Pig;
