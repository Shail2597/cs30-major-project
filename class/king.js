const GRAVITY = 0.4;
const MAX_FALL_SPEED = 8;
const cols     = 20;
const rows     = 14;
const tileSize = 64;

class King {
  constructor() {
    this.isJumping = false;
    this.hitBox    = null;
    this.spi       = null;
    this.hitBoxJump= null;
  }

  pre() {
    // Create hitBox and visible sprite
    this.hitBoxJump = new Sprite(0, 0, 20, 1);
    this.hitBox = new Sprite(0, 0, 45, 53);
    this.spi    = new Sprite(0, 0, 78, 58);

    // Assign spritesheet and animations
    this.spi.spriteSheet = 'asset/king_human_full.png';
    this.spi.addAnis({
      attack:  { row: 0, frames: 3,  frameDelay: 6  },
      dead:    { row: 1, frames: 4             },
      door_in: { row: 2, frames: 8,  frameDelay: 14 },
      door_out:{ row: 3, frames: 8,  frameDelay: 14 },
      fall:    { row: 4                    },
      ground:  { row: 5                    },
      hit:     { row: 6, frames: 2             },
      idle:    { row: 7, frames:11             },
      jump:    { row: 8                    },
      run:     { row: 9, frames: 8             }
    });
    this.spi.changeAni('idle');
    this.spi.anis.offset.y = 10;
    this.spi.rotationLock  = true;
    this.spi.collider      = 'NONE';
    

    this.hitBox.rotationLock = true;
    this.hitBox.visible      = false;

    this.hitBox.collider = "dynamic";
    this.hitBoxJump.rotationLock = true;

    allSprites.pixelPerfect = true;
  }

  respawn() {
    // center of the grid
    const gridW   = cols * tileSize;
    const gridH   = rows * tileSize;
    const offsetX = (width  - gridW) / 2;
    const offsetY = (height - gridH) / 2;

    this.hitBox.position.x = offsetX + gridW/2;
    this.hitBox.position.y = offsetY + gridH/2;
    this.isJumping = false;
  }

  handleInput(walls) {
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
    if (keyIsDown(UP_ARROW) && !this.isJumping) {
      this.hitBox.vel.y = -12; // jump strength
      this.isJumping = true;
    }

    // Apply gravity
    this.hitBox.vel.y += GRAVITY;

    // Limit fall speed
    if (this.hitBox.vel.y > MAX_FALL_SPEED) {
      this.hitBox.vel.y = MAX_FALL_SPEED;
    }

    // Animations
    if (this.hitBox.vel.y < 0) {
      this.spi.changeAni('jump');
    }
    else if (this.isJumping && this.hitBox.vel.y > 0) {
      this.spi.changeAni('fall');
    }

    // Ground collision
    if (this.hitBoxJump.collides(walls)&& this.hitBox.vel.x === 0) {
      this.hitBox.vel.y = 0;
      this.spi.changeAni('idle');
    }
    
    // Reset jump when on ground
    if (this.hitBoxJump.collides(walls)) {
      this.isJumping = false;
    }

    // Attack
    if (keyIsDown(32)) {
      this.spi.changeAni('attack');
    }

    if (mouseIsPressed) {
      allSprites.debug = true;
    }

    this.hitBox.visible = false;

    // Sprite follows hitbox
    if (this.spi.mirror.x) {
      this.spi.position.x = this.hitBox.position.x - 18;
      this.spi.position.y = this.hitBox.position.y - 24;
      this.hitBoxJump.position.x = this.hitBox.position.x;
      this.hitBoxJump.position.y = this.hitBox.position.y+27;
    }
    else {
      this.spi.position.x = this.hitBox.position.x + 18;
      this.spi.position.y = this.hitBox.position.y - 24;
      this.hitBoxJump.position.x = this.hitBox.position.x;
      this.hitBoxJump.position.y = this.hitBox.position.y+27;
    }
  }


  doAll(walls) {
    this.handleInput(walls);
    this.spi.update();
    this.spi.draw();
    // console.log(this.spi.position.x, this.spi.position.y);
    // console.log(this.spi.ani);
    console.log(this.isJumping);
    this.spi.scale = 2;
  }
}