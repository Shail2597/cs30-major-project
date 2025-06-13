// --- CONSTANTS FOR PLAYER LOGIC ---
const GRAVITY = 0.4;
const MAX_FALL_SPEED = 8;
const cols = 20;
const rows = 14;
const tileSize = 64;

const PLAYER_ATTACK_COOLDOWN = 30;
const PLAYER_ATTACK_RANGE = 50;

const MAX_LIVES = 3;
const MAX_HITS = 5;

// --- KING PLAYER CLASS ---
class King {
  constructor() {
    // --- PLAYER STATE ---
    this.isJumping = false;
    this.hitBox = null;
    this.spi = null;
    this.hitBoxJump = null;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.health = MAX_HITS;
    this.hitCooldown = 0;
    this.attackTimer = 0;
    this.lives = MAX_LIVES;
    this.isDead = false;
    this.isSpawning = true;
    this.spawnPosition = null;

    this.spawnX = null;
    this.spawnY = null;
    this.initialX = null;
    this.initialY = null;
  }

  // --- SETUP SPRITES AND ANIMATIONS ---
  pre(spriteSheet) {
    // Setup hitboxes and main sprite
    this.hitBoxJump = new Sprite(0, 0, 35, 12);
    this.hitBox = new Sprite(0, 0, 45, 53);
    this.spi = new Sprite(0, 0, 78, 58);

    // Add all animations from sprite sheet
    this.spi.spriteSheet = spriteSheet;
    this.spi.addAnis({
      attack: { row: 0, frames: 3, frameDelay: 6 },
      dead: { row: 1, frames: 4, frameDelay: 10 },
      door_in: { row: 2, frames: 8, frameDelay: 14 },
      door_out: { row: 3, frames: 8, frameDelay: 14 },
      fall: { row: 4 },
      ground: { row: 5 },
      hit: { row: 6, frames: 2, frameDelay: 8 },
      idle: { row: 7, frames: 11 },
      jump: { row: 8 },
      run: { row: 9, frames: 8 },
    });
    this.spi.changeAni('idle');
    this.spi.anis.offset.y = 10;
    this.spi.rotationLock = true;
    this.spi.collider = 'NONE';

    this.hitBox.rotationLock = true;
    this.hitBox.visible = false;
    this.hitBoxJump.visible = false;
    this.hitBoxJump.rotationLock = true;
    this.hitBoxJump.collider = "NONE";
    this.hitBox.collider = "DYNAMIC";
    this.spi.visible = false;

    // Store spawn position after door_in animation
    setTimeout(() => {
      this.spawnPosition = {
        x: this.hitBox.position.x,
        y: this.hitBox.position.y
      };
      this.isSpawning = false;
      this.spi.changeAni('idle');
    }, 1000); // 1 second spawn animation

    // Store initial spawn position right after creating the hitBox
    this.initialX = this.hitBox.position.x;
    this.initialY = this.hitBox.position.y;

    allSprites.pixelPerfect = true;
    allSprites.visible = false;

    // Play spawn animation
    this.spi.changeAni('door_in');
    this.spi.ani.frame = 0;
    setTimeout(() => {
      this.isSpawning = false;
      this.spi.changeAni('idle');
    }, 1000); // 1 second spawn animation
  }

  // --- HANDLE PLAYER RESPAWN ---
  respawn() {
    if (this.lives <= 0) {
      this.isDead = true;
      this.spi.changeAni('dead');
      this.spi.ani.frame = this.spi.ani.lastFrame;
      return false;
    }

    this.isSpawning = true;
    this.isJumping = false;
    
    // Move to spawn position (after door_in animation)
    if (this.spawnPosition) {
      this.hitBox.position.x = this.spawnPosition.x;
      this.hitBox.position.y = this.spawnPosition.y;
    }
    else {
      // Fallback to center if spawn position not set
      const gridW = cols * tileSize;
      const gridH = rows * tileSize;
      const offsetX = (width - gridW) / 2;
      const offsetY = (height - gridH) / 2;
      this.hitBox.position.x = offsetX + gridW / 2;
      this.hitBox.position.y = offsetY + gridH / 2;
    }

    // Reset state
    this.health = MAX_HITS;
    this.hitCooldown = 0;
    this.spi.changeAni('door_in');
    this.spi.ani.frame = 0;
    this.hitBox.vel.x = 0;
    this.hitBox.vel.y = 0;
    
    // Delay before player can move
    setTimeout(() => {
      this.isSpawning = false;
      this.spi.changeAni('idle');
    }, 1000);
    
    return true;
  }

  // --- HANDLE PLAYER INPUT AND MOVEMENT ---
  handleInput(walls, pigs) {
    // Don't process input if dead or spawning
    if (this.isDead || this.isSpawning) {
      return;
    }

    // Handle attack/hit cooldowns
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

    // If in hit animation, don't allow movement
    if (this.spi.ani?.name === 'hit' && this.spi.ani.frame < this.spi.ani.lastFrame) {
      this.hitBox.vel.x = 0;
      return;
    }

    // --- ATTACK LOGIC ---
    if (keyIsDown(controls.Attack) && this.attackCooldown === 0 && this.attackTimer === 0) {
      this.spi.changeAni('attack');
      this.isAttacking = true;
      this.attackCooldown = PLAYER_ATTACK_COOLDOWN;
      this.attackTimer = 16;

      // Check for pigs in attack range
      if (Array.isArray(pigs)) {
        for (const pig of pigs) {
          if (pig && !pig.dead) {
            const dx = pig.getX() - this.hitBox.x;
            const dy = pig.getY() - this.hitBox.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const facingRight = !this.spi.mirror.x;
            const pigInFront = facingRight && dx > 0 || !facingRight && dx < 0;
            if (dist < PLAYER_ATTACK_RANGE && pigInFront) {
              pig.takeHit(this.hitBox.x);
            }
          }
        }
      }
    }

    // --- MOVEMENT LOGIC ---
    if (!this.isAttacking) {
      // Horizontal movement
      if (keyIsDown(controls.Right)) {
        this.hitBox.vel.x = 6;
        this.spi.mirror.x = false;
        this.spi.changeAni('run');
      }
      else if (keyIsDown(controls.Left)) {
        this.hitBox.vel.x = -6;
        this.spi.mirror.x = true;
        this.spi.changeAni('run');
      }
      else {
        this.hitBox.vel.x = 0;
        this.spi.changeAni('idle');
      }

      // Jumping
      if (keyIsDown(controls.Jump) && !this.isJumping) {
        this.hitBox.vel.y = -7;
        this.isJumping = true;
      }

      // Set animation for jump/fall
      if (this.hitBox.vel.y < 0) {
        this.spi.changeAni('jump');
      }
      else if (this.isJumping && this.hitBox.vel.y > 0) {
        this.spi.changeAni('fall');
      }
    }

    // --- GROUND AND PIG COLLISION CHECKS ---
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

    // --- STOMP PIGS ---
    if (Array.isArray(pigs)) {
      for (const pig of pigs) {
        if (
          pig &&
          pig.hitBoxPig &&
          this.hitBoxJump.overlap(pig.hitBoxPig) &&
          this.hitBox.vel.y > 0
        ) {
          if (this.hitBox.vel.y > 7) {
            pig.takeHit(this.hitBox.x);
            this.hitBox.vel.y = -3;
          }
        }
      }
    }

    // --- SPRITE POSITIONING ---
    if (this.spi.mirror.x) {
      this.spi.position.x = this.hitBox.position.x - 18;
      this.spi.position.y = this.hitBox.position.y - 24;
    }
    else {
      this.spi.position.x = this.hitBox.position.x + 18;
      this.spi.position.y = this.hitBox.position.y - 24;
    }

    // --- UPDATE JUMP HITBOX POSITION ---
    this.hitBoxJump.position.x = this.hitBox.position.x;
    this.hitBoxJump.position.y = this.hitBox.position.y + this.hitBox.height / 2 + this.hitBoxJump.height / 2;
    this.hitBoxJump.visible = false;

    // --- DEBUG COLOR FOR JUMP HITBOX ---
    if (this.hitBoxJump.overlap(walls)) {
      this.hitBoxJump.color = color(0, 255, 0, 100);
    }
    else {
      this.hitBoxJump.color = color(0, 0, 255, 100);
    }
  }

  // --- GET PLAYER X/Y ---
  getX() {
    return this.hitBox.x; 
  }
  getY() {
    return this.hitBox.y; 
  }

  // --- HANDLE DAMAGE TAKEN ---
  takeDamage(attackerX) {
    if (this.hitCooldown > 0 || this.isDead) {
      return; 
    }

    this.health--;
    this.spi.changeAni('hit');
    this.spi.ani.frame = 0;
    this.hitCooldown = 20;

    // Knockback direction
    if (typeof attackerX === "number") {
      const direction = this.hitBox.x < attackerX ? -1 : 1;
      this.hitBox.vel.x = direction * 4;
    }

    // If health runs out, lose a life and respawn or die
    if (this.health <= 0) {
      this.lives--;
      this.spi.changeAni('dead');
      this.spi.ani.frame = 0;

      if (this.lives > 0) {
        const deathAnimDuration = this.spi.ani.frameDelay * this.spi.ani.frames;
        setTimeout(() => {
          this.respawn(); 
        }, deathAnimDuration);
      }
      else {
        const deathAnimDuration = this.spi.ani.frameDelay * this.spi.ani.frames;
        setTimeout(() => {
          this.spi.ani.play = false;
          this.spi.ani.frame = this.spi.ani.lastFrame;
          this.hitBox.vel.x = 0;
          this.hitBox.vel.y = 0;
          this.isDead = true;
        }, deathAnimDuration);
      }
    }
  }

  // --- REMOVE ALL SPRITES ---
  destroy() {
    this.hitBox?.remove(); this.hitBox = null;
    this.spi?.remove(); this.spi = null;
    this.hitBoxJump?.remove(); this.hitBoxJump = null;
  }

  // --- MAIN UPDATE/DRAW LOOP FOR PLAYER ---
  doAll(walls, pigs) {
    if (!this.hitBox || !this.spi) {
      return; 
    }

    // If dead, just draw dead sprite
    if (this.isDead) {
      if (this.spi.mirror.x) {
        this.spi.position.x = this.hitBox.position.x - 18;
        this.spi.position.y = this.hitBox.position.y - 24;
      }
      else {
        this.spi.position.x = this.hitBox.position.x + 18;
        this.spi.position.y = this.hitBox.position.y - 24;
      }
      this.spi.update();
      this.spi.draw();
      this.spi.scale = 2;
      this.hitBox.vel.x = 0;
      this.hitBox.vel.y = 0;
      return;
    }

    // Handle input and movement
    this.handleInput(walls, pigs);

    // Update sprite position
    if (this.spi.mirror.x) {
      this.spi.position.x = this.hitBox.position.x - 18;
      this.spi.position.y = this.hitBox.position.y - 24;
    }
    else {
      this.spi.position.x = this.hitBox.position.x + 18;
      this.spi.position.y = this.hitBox.position.y - 24;
    }

    this.spi.update();
    this.spi.draw();
    this.spi.scale = 2;
  }
}
