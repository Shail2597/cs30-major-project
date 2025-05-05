  // Create the player object with properties
//let King;
let spi;
let floor1;

class King {
    constructor(){
    this.x = windowWidth/2;
    this.y = windowHeight/2;
    this.width= 100; // Increased width
    this.height= 100; // Increased height
    this.vel= { x: 0, y: 0 };
    this.mirrorX= 1; // 1 for normal; -1 for flipped
    this.currentAnimation= "idle";
    this.frameIndex= 0;
    this.frameDelay= 5; // Delay between frames
    // this.idleSpriteSheet= loadImage("assets/king_idle.png");
    // this.runningSpriteSheet= loadImage("assets/king_human_run.png");
    // this.jumpSprite= loadImage("assets/king_human_jump.png"); // Single-frame jump sprite
    this.idleFrames= 11;
    this.runningFrames= 8;
    this.isJumping= false; // Track if the player is jumping
    }

updatePosition() {
      // Handle movement
      if (keyIsDown(LEFT_ARROW)) {
        this.vel.x = -5;
        this.mirrorX = -1; // Flip the sprite to face left
      } else if (keyIsDown(RIGHT_ARROW)) {
        this.vel.x = 5;
        this.mirrorX = 1; // Flip the sprite to face right
      } else {
        this.vel.x = 0;
      }
    
      // Handle jumping
      if (keyIsDown(UP_ARROW) && !this.isJumping) {
        this.vel.y = -10; // Jump strength
        this.isJumping = true;
      }
    
      // Apply gravity
      this.vel.y += 0.5; // Gravity strength
    
      // Update position
      this.x += this.vel.x;
      this.y += this.vel.y;
    
      // Constrain the player within lvl1 boundaries
      this.x = constrain(
        this.x,
        lvl1Bounds.topLeft.x + this.width / 2,
        lvl1Bounds.bottomRight.x - this.width / 2
      );
    
      if (this.y + this.height / 2 >= lvl1Bounds.bottomRight.y) {
        this.y = lvl1Bounds.bottomRight.y - this.height / 2;
        this.vel.y = 0; // Stop falling when on the ground
    
        // Only reset jumping state if the player is grounded
        if (this.isJumping) {
          this.isJumping = false;
        }
      } else {
        // If the player is not grounded, ensure the jumping state is active
        this.isJumping = true;
      }
    }

updateState() {
      let newAnimation;
    
      if (this.isJumping) {
        newAnimation = "jump";
      } else if (this.vel.x !== 0) {
        newAnimation = "running";
      } else {
        newAnimation = "idle";
      }
    
      if (newAnimation !== this.currentAnimation) {
        this.currentAnimation = newAnimation;
        this.frameIndex = 0;
      }
    }


    draw() {
      let spriteSheet;
      let totalFrames;
    
      // Determine the current animation
      if (this.currentAnimation === "idle") {
        spriteSheet = this.idleSpriteSheet;
        totalFrames = this.idleFrames;
      } else if (this.currentAnimation === "running") {
        spriteSheet = this.runningSpriteSheet;
        totalFrames = this.runningFrames;
      } else if (this.currentAnimation === "jump") {
        spriteSheet = this.jumpSprite; // Use the single-frame jump sprite
        totalFrames = 1; // Single frame
      }
    
      // Ensure the spriteSheet is valid
      if (!spriteSheet) {
        console.error("Sprite sheet not loaded for animation:", this.currentAnimation);
        return;
      }
    
      // Calculate the frame width and height
      let frameWidth = spriteSheet.width / totalFrames;
      let frameHeight = spriteSheet.height;
    
      // Update the frame index based on the frame delay (only for multi-frame animations)
      if (totalFrames > 1 && frameCount % this.frameDelay === 0) {
        this.frameIndex = (this.frameIndex + 1) % totalFrames;
      } else if (totalFrames === 1) {
        this.frameIndex = 0; // Ensure the frame index is always 0 for single-frame animations
      }
    
      // Draw the current frame
      push();
      translate(this.x, this.y);
      scale(this.mirrorX, 1); // Flip the sprite if necessary
      image(
        spriteSheet,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
        this.frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight
      );
        pop();
  }

  doAll(){
    this.updatePosition();
    this.updateState();
    this.draw();
  }
  spid(){
    spi = new Sprite( windowWidth/2, windowHeight/2, 100, 100);
    spi.spriteSheet = 'assets/king_human_full.png';
    spi.addAnis({
      attack: { row: 0, frames: 3 },
      dead: { row: 1, frames: 4 },
      door_in: { row: 2, frames: 8, frameDelay: 14 },
      door_out: { row: 3, frames: 8, frameDelay: 14 },
      fall: { row: 4},
      ground: {row :5},
      hit: { row: 6, frames:2 },
      idle: { row: 7, frames: 11},
      jump:{row:8},
      run :{row:9, frames:8}
    });
    spi.changeAni('idle');
    if (kb.pressing('left')) {
      spi.changeAni('run');
      spi.vel.x = -2;
      spi.scale.x = -1;
    } else if (kb.pressing('right')) {
      spi.changeAni('run');
      spi.vel.x = 2;
      spi.scale.x = 1;
    } else {
      spi.changeAni('idle');
      spi.vel.x = 0;
    }
    floor1 = new Sprite();
    floor1.y = 445;
    floor1.w = 893;
    floor1.h = 1;
    floor1.collider = STATIC;
  }
}


