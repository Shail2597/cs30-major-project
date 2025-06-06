const GRAVITY = 0.4;
const MAX_FALL_SPEED = 8;
const cols     = 20;
const rows     = 14;
const tileSize = 64;

const PLAYER_ATTACK_COOLDOWN = 30; // frames (0.5s at 60fps)
const PLAYER_ATTACK_RANGE = 50;    // pixels

class King {
  constructor() {
    this.isJumping = false;
    this.hitBox    = null;
    this.spi       = null;
    this.hitBoxJump= null;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.health = 3; // Example player health
    this.hitCooldown = 0; // For pig attacks
    this.attackTimer = 0;
  }

  pre(spriteSheet) {
    // Create hitBox and visible sprite
    this.hitBoxJump = new Sprite(0, 0, 40, 12); // wider and a bit thicker
    this.hitBox = new Sprite(0, 0, 45, 53);
    this.spi    = new Sprite(0, 0, 78, 58);

    // Assign spritesheet and animations
    this.spi.spriteSheet = spriteSheet;
    this.spi.addAnis({
      attack: { row: 0, frames: 3, frameDelay: 6 },
      dead: { row: 1, frames: 4, frameDelay: 10 }, // <-- add frameDelay
      door_in: { row: 2, frames: 8, frameDelay: 14 },
      door_out: { row: 3, frames: 8, frameDelay: 14 },
      fall: { row: 4 },
      ground: { row: 5 },
      hit: { row: 6, frames: 2, frameDelay: 8 },   // <-- add frameDelay
      idle: { row: 7, frames: 11 },
      jump: { row: 8 },
      run: { row: 9, frames: 8 },
    });
    this.spi.changeAni('idle');
    this.spi.anis.offset.y = 10;
    this.spi.rotationLock  = true;
    this.spi.collider      = 'NONE';
    

    this.hitBox.rotationLock = true;
    this.hitBox.visible      = true;
    this.hitBoxJump.visible  = true;
    this.hitBoxJump.rotationLock = true;
    this.hitBoxJump.collider = "NONE"; // Use KINEMATIC for jump hitbox
    //this.hitBoxJump.addSensor(0, 0, 40, 12); // Wider and a bit thicker for jump hitbox
    this.hitBox.collider = "DYNAMIC"; // Use DYNAMIC for main hitbox
    this.spi.visible = true;

    allSprites.pixelPerfect = true;
    allSprites.visible = true;
  }

  respawn() {
    // center of the grid
    this.isJumping = true;
    const gridW   = cols * tileSize;
    const gridH   = rows * tileSize;
    const offsetX = (width  - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    this.hitBox.position.x = offsetX + gridW/2;
    this.hitBox.position.y = offsetY + gridH/2;
    this.isJumping = false;
    this.health = 3;
    this.hitCooldown = 0;
  }

  handleInput(walls, pigs) {
  // --- PLAYER ATTACK LOGIC WITH COOLDOWN ---
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    if (this.hitCooldown > 0) {
      this.hitCooldown--;
    }
    if (this.attackTimer > 0) {
      this.attackTimer--;
      this.isAttacking = true;
    }
    else {
      this.isAttacking = false;
    }

    // --- Prevent overriding 'hit' animation while hit ---
    if (this.spi.ani?.name === 'hit' && this.spi.ani.frame < this.spi.ani.lastFrame) {
      this.hitBox.vel.x = 0;
      return;
    }

    // Attack input
    if (keyIsDown(32) && this.attackCooldown === 0 && this.attackTimer === 0) { // Space bar
      this.spi.changeAni('attack');
      this.isAttacking = true;
      this.attackCooldown = PLAYER_ATTACK_COOLDOWN;
      this.attackTimer = 16; // frameDelay * frames (adjust as needed)

      // Check if any pig is in range and alive
      if (Array.isArray(pigs)) {
        for (const pig of pigs) {
          if (pig && !pig.dead) {
            const dx = pig.getX() - this.hitBox.x;
            const dy = pig.getY() - this.hitBox.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Only attack if pig is in range AND in facing direction
            const facingRight = !this.spi.mirror.x;
            const pigIsInFront = facingRight && dx > 0 || !facingRight && dx < 0;
            if (dist < PLAYER_ATTACK_RANGE && pigIsInFront) {
              pig.takeHit(this.hitBox.x);
            }
          }
        }
      }
    }

    // Only allow movement/jump animations if not attacking
    if (!this.isAttacking) {
    // Horizontal movement
      if (keyIsDown(RIGHT_ARROW)) {
        this.hitBox.vel.x = 6;
        this.hitBox.mirror.x = false;
        this.spi.mirror.x = false;
        this.spi.changeAni('run');
      }
      else if (keyIsDown(LEFT_ARROW)) {
        this.hitBox.vel.x = -6;
        this.spi.mirror.x = true;
        this.spi.changeAni('run');
      }
      else {
        this.hitBox.vel.x = 0;
        this.spi.changeAni('idle');
      }

      // Jumping
      if (keyIsDown(UP_ARROW) && !this.isJumping ) {
        this.hitBox.vel.y = -7; // jump strength
        this.isJumping = true;
      }

      // Animations
      if (this.hitBox.vel.y < 0) {
        this.spi.changeAni('jump');
      }
      else if (this.isJumping && this.hitBox.vel.y > 0) {
        this.spi.changeAni('fall');
      }
    }

    // Reset jump when on ground and falling or not moving up
    let onGround = this.hitBoxJump.overlap(walls) && this.hitBox.vel.y >= 0;
    let onPig = false;
    if (Array.isArray(pigs)) {
      for (const pig of pigs) {
        if (pig && pig.hitBoxPig && this.hitBoxJump.overlap(pig.hitBoxPig) && this.hitBox.vel.y >= 0) {
          onPig = true;
          break;
        }
      }
    }
    if (onGround || onPig) {
      this.isJumping = false;
    }

    // --- King stomps pig from above ---
    if (Array.isArray(pigs)) {
      for (const pig of pigs) {
        if (
          pig && pig.hitBoxPig &&
          this.hitBoxJump.overlap(pig.hitBoxPig) &&
          this.hitBox.vel.y > 0 // King is falling
        ) {
          pig.takeHit(this.hitBox.x);
          this.hitBox.vel.y = -8; // Bounce King upward
        }
      }
    }

    if (mouseIsPressed) {
      allSprites.debug = true;
    }

    this.hitBox.visible = false;

    // Sprite follows hitbox
    if (this.spi.mirror.x) {
      this.spi.position.x = this.hitBox.position.x - 18;
      this.spi.position.y = this.hitBox.position.y - 24;
    }
    else {
      this.spi.position.x = this.hitBox.position.x + 18;
      this.spi.position.y = this.hitBox.position.y - 24;
    }
    this.hitBoxJump.position.x = this.hitBox.position.x;
    this.hitBoxJump.position.y = this.hitBox.position.y + this.hitBox.height / 2 + this.hitBoxJump.height / 2;
    this.hitBoxJump.visible = true; // Debug

    if (this.hitBoxJump.overlap(walls)) {
      this.hitBoxJump.color = color(0,255,0,100); // turn sensor green when overlapping
    }
    else {
      this.hitBoxJump.color = color(0,0,255,100); // blue otherwise
    }
    this.hitBoxJump.position.y = this.hitBox.position.y + this.hitBox.height / 2 + this.hitBoxJump.height / 2;
    this.hitBoxJump.visible = true; 
  }

  // Helper for pig to get player position
  getX() {
    return this.hitBox.x; 
  }
  getY() {
    return this.hitBox.y; 
  }

  takeDamage(attackerX) {
    if (this.hitCooldown > 0 || this.health <= 0) {
      return;
    }
    this.health--;
    this.spi.changeAni('hit');
    this.hitCooldown = 20; // was 30, now more responsive

    // Knockback if attackerX is provided
    if (typeof attackerX === "number") {
      const direction = this.hitBox.x < attackerX ? -1 : 1;
      this.hitBox.vel.x = direction * 14;
    }

    if (this.health <= 0) {
      this.spi.changeAni('dead');
      // Optionally: handle player death here
    }
  }

  destroy() {
    // Remove each p5.play Sprite so it really goes away:
    if (this.hitBox && typeof this.hitBox.remove === 'function') {
      this.hitBox.remove();
      this.hitBox = null;
    }
    if (this.spi && typeof this.spi.remove === 'function') {
      this.spi.remove();
      this.spi = null;
    }
    if (this.hitBoxJump && typeof this.hitBoxJump.remove === 'function') {
      this.hitBoxJump.remove();
      this.hitBoxJump = null;
    }
    // (If you added any other sprites inside King, remove them here, too.)
  }

  doAll(walls, pigs) {
    if (!this.hitBox || !this.spi) {
      return;
    }
    this.handleInput(walls, pigs);
    this.spi.update();
    this.spi.draw();
    this.spi.scale = 2;
  }
}