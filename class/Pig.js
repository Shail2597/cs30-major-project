const PIG_ACTIVATION_DISTANCE = 250;
const PIG_SPEED = 2.2;
const PIG_ATTACK_RANGE = 40;
const PIG_ATTACK_COOLDOWN = 60; // frames (1 second at 60fps)
const PIG_MAX_HEALTH = 3;

class Pig {
  constructor(x = windowWidth/2 + windowWidth/4, y = windowHeight/2) {
    this.isJumping = false;
    this.activated = false;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.health = PIG_MAX_HEALTH;
    this.dead = false;
    this.hitCooldown = 0; // Prevents taking multiple hits instantly
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
    allSprites.pixelPerfect = true;
    this.hitBoxPig.rotationLock = true;
    this.pigSpi.rotationLock = true;
    this.hitBoxPig.collider = "dynamic";
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
      if (distToPlayer > PIG_ATTACK_RANGE) {
        const angle = Math.atan2(dy, dx);
        this.hitBoxPig.vel.x = Math.cos(angle) * PIG_SPEED;
        this.isAttacking = false;
      }
      else {
        this.hitBoxPig.vel.x = 0;
        this.isAttacking = true;
      }
    }
    else {
      this.hitBoxPig.vel.x = 0;
      this.isAttacking = false;
    }
  }

  handleAttack(playerObj) {
    if (this.dead) {
      return;
    }
    if (this.isAttacking && this.attackCooldown <= 0) {
      this.pigSpi.changeAni('attack');
      if (playerObj && typeof playerObj.takeDamage === "function") {
        playerObj.takeDamage(this.hitBoxPig.x);
      }
      this.attackCooldown = PIG_ATTACK_COOLDOWN;
    }
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
    this.hitCooldown = 20; // brief invulnerability
    this.pigSpi.changeAni('hit');
    
    // Force animation to start from beginning
    this.pigSpi.ani.frame = 0;

    // Knockback: push pig away from attacker (king)
    if (typeof attackerX === "number") {
      const direction = this.hitBoxPig.x < attackerX ? -1 : 1;
      this.hitBoxPig.vel.x = direction * 18; // Increased from 12 to 18
    }

    if (this.health <= 0) {
      this.dead = true;
      this.pigSpi.changeAni('death');
    }
  }

  colliderAndhitBox() {
    this.pigSpi.collider = "NONE";
    this.pigSpi.position.x = this.hitBoxPig.position.x-2;
    this.pigSpi.position.y = this.hitBoxPig.position.y-6.5;
  }

  handleAnimations() {
    if (this.dead) {
      return;
    }

    // Handle hit animation with proper state tracking
    if (this.pigSpi.ani?.name === 'hit') {
      if (this.pigSpi.ani.frame < this.pigSpi.ani.lastFrame) {
        return; // Keep playing hit animation until it's done
      }
    }

    // After hit animation is done or for other states
    if (this.hitCooldown > 0) {
      // Force hit animation to play
      if (this.pigSpi.ani?.name !== 'hit') {
        this.pigSpi.changeAni('hit');
      }
      return;
    }

    // Regular animation states
    if (this.isAttacking) {
      this.pigSpi.changeAni('attack');
    }
    else if (Math.abs(this.hitBoxPig.vel.x) > 0.1) {
      this.pigSpi.changeAni('run');
    }
    else {
      this.pigSpi.changeAni('idle');
    }

    // Handle movement direction
    if (this.hitBoxPig.vel.x > 0.1) {
      this.pigSpi.mirror.x = true;
    }
    else if (this.hitBoxPig.vel.x < -0.1) {
      this.pigSpi.mirror.x = false;
    }
  }

  doAll(playerX, playerY, playerObj) {
    if (!this.pigSpi) {
      return;
    }
    this.move(playerX, playerY);
    this.handleAttack(playerObj);
    this.handleAnimations();
    this.colliderAndhitBox();

    // If dead, play death animation then remove
    if (this.dead) {
      this.pigSpi.update();
      this.pigSpi.draw();
      this.pigSpi.scale = 1.7;
      // Remove after death animation finishes
      if (this.pigSpi.ani?.name === 'death' && this.pigSpi.ani.frame === this.pigSpi.ani.lastFrame) {
        this.pigSpi.remove();
        this.hitBoxPig.remove();
      }
      return;
    }

    this.pigSpi.update();
    this.pigSpi.draw();
    this.pigSpi.scale = 1.7;
  }

  getX() {
    return this.hitBoxPig.x;
  }
  getY() {
    return this.hitBoxPig.y;
  }

  destroy() {
    if (this.pigSpi && typeof this.pigSpi.remove === 'function') {
      this.pigSpi.remove();
      this.pigSpi = null;
    }
    if (this.hitBoxPig && typeof this.hitBoxPig.remove === 'function') {
      this.hitBoxPig.remove();
      this.hitBoxPig = null;
    }
  }
}

window.Pig = Pig;
