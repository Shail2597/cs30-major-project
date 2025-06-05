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
      attack: { row: 0, frames: 3, frameDelay: 6},
      dead: { row: 1, frames: 4 },
      door_in: { row: 2, frames: 8, frameDelay: 14 },
      door_out: { row: 3, frames: 8, frameDelay: 14 },
      fall: { row: 4 },
      ground: { row: 5 },
      hit: { row: 6, frames: 2 },
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
    } else {
      this.isAttacking = false;
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
            if (dist < PLAYER_ATTACK_RANGE) {
              pig.takeHit();
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

    // // Ground collision
    // if (this.hitBoxJump.collides(walls)&& this.hitBox.vel.x === 0) {
    //   this.hitBox.vel.y = 0;
    //   this.spi.changeAni('idle');
    // }
  
    // Reset jump when on ground and falling or not moving up
    if (this.hitBoxJump.overlap(walls) && this.hitBox.vel.y >= 0) {
      this.isJumping = false;
    }

    // --- HANDLE PIG ATTACKING PLAYER ---
    if (Array.isArray(pigs)) {
      for (const pig of pigs) {
        if (pig && pig.isAttacking && this.hitCooldown === 0 && !pig.dead) {
          const dx = pig.getX() - this.hitBox.x;
          const dy = pig.getY() - this.hitBox.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < PIG_ATTACK_RANGE) {
            this.health--;
            this.spi.changeAni('hit');
            this.hitCooldown = 30; // brief invulnerability
            if (this.health <= 0) {
              this.spi.changeAni('dead');
            // Optionally: handle player death
            }
          }
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
    this.hitBoxJump.position.y = this.hitBox.position.y + (this.hitBox.height / 2) + (this.hitBoxJump.height / 2);
    this.hitBoxJump.visible = true; 
  }

  // Helper for pig to get player position
  getX() {
    return this.hitBox.x; 
  }
  getY() {
    return this.hitBox.y; 
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