let pigSpi;
let hitBoxPig;
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
  }

  pre() {
    // Suppose your frame size is 64x64:
    hitBoxPig = new Sprite(this.spawnX, this.spawnY, 34, 28);
    pigSpi    = new Sprite(hitBoxPig.x, hitBoxPig.y, 34, 28);
    pigSpi.spriteSheet = 'asset/pig.png';
    pigSpi.addAnis({
      death:  { row: 0, frames: 4 },
      fall:   { row: 1 },
      ground: { row: 2 },
      hit:    { row: 3, frames: 2 },
      idle:   { row: 4, frames: 11 },
      jump:   { row: 5, frames: 1 },
      run:    { row: 6, frames: 6 },
      attack: { row: 7, frames: 5 },
    });
    pigSpi.changeAni('idle');
    allSprites.pixelPerfect = true;
    hitBoxPig.rotationLock = true;
    pigSpi.rotationLock = true;
    hitBoxPig.collider = "dynamic";
    pigSpi.visible = true;
    hitBoxPig.visible = false;
  }

  move(playerX, playerY) {
    if (this.dead) {
      hitBoxPig.vel.x = 0;
      // Do not set vel.y to 0, let gravity act
      return;
    }

    // Calculate distance to player
    const dx = playerX - hitBoxPig.x;
    const dy = playerY - hitBoxPig.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    // Activate if player is close enough
    if (!this.activated && distToPlayer < PIG_ACTIVATION_DISTANCE) {
      this.activated = true;
    }

    if (this.activated) {
      // Move towards player if not attacking
      if (distToPlayer > PIG_ATTACK_RANGE) {
        const angle = Math.atan2(dy, dx);
        hitBoxPig.vel.x = Math.cos(angle) * PIG_SPEED;
        // Do not set vel.y here, let gravity act
        this.isAttacking = false;
      }
      else {
        // In attack range
        hitBoxPig.vel.x = 0;
        // Do not set vel.y here, let gravity act
        this.isAttacking = true;
      }
    }
    else {
      // Idle state
      hitBoxPig.vel.x = 0;
      // Do not set vel.y here, let gravity act
      this.isAttacking = false;
    }
  }

  handleAttack(playerObj) {
    if (this.dead) {
      return;
    }

    // Pig attack logic (attack only if cooldown is 0)
    if (this.isAttacking && this.attackCooldown <= 0) {
      pigSpi.changeAni('attack');
      // You can add logic here to reduce player health, e.g.:
      // playerObj.takeDamage();
      this.attackCooldown = PIG_ATTACK_COOLDOWN;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    // Pig hit logic (playerObj should call this when attacking)
    if (this.hitCooldown > 0) {
      this.hitCooldown--;
    }
  }

  takeHit() {
    if (this.dead || this.hitCooldown > 0) {
      return;
    }
    this.health--;
    pigSpi.changeAni('hit');
    this.hitCooldown = 20; // brief invulnerability
    if (this.health <= 0) {
      this.dead = true;
      pigSpi.changeAni('death');
      // Optionally: remove pig after animation
    }
  }

  colliderAndhitBox() {
    pigSpi.collider = "NONE";
    pigSpi.position.x = hitBoxPig.position.x;
    pigSpi.position.y = hitBoxPig.position.y;
  }

  handleAnimations() {
    if (this.dead) return;

    // Set mirror
    if (hitBoxPig.vel.x > 0) pigSpi.mirror.x = false;
    if (hitBoxPig.vel.x < 0) pigSpi.mirror.x = true;

    // Only change animation if needed
    if (this.isAttacking) {
      if (pigSpi.ani?.name !== 'attack') {
        pigSpi.changeAni('attack');
      }
    } else if (this.activated) {
      if (Math.abs(hitBoxPig.vel.x) > 0.1) {
        if (pigSpi.ani?.name !== 'run') {
          pigSpi.changeAni('run');
        }
      } else {
        if (pigSpi.ani?.name !== 'idle') {
          pigSpi.changeAni('idle');
        }
      }
    }
  }

  doAll(playerX, playerY, playerObj) {
    if (!pigSpi) {
      return;
    } // Guard: don't run if not initialized
    this.move(playerX, playerY);
    this.handleAttack(playerObj);
    this.handleAnimations();
    this.colliderAndhitBox();
    pigSpi.update();
    pigSpi.draw();
    pigSpi.scale = 1.7;
  }

  // --- Add these methods for King to call ---
  getX() {
    return hitBoxPig.x; 
  }
  getY() {
    return hitBoxPig.y; 
  }
}
