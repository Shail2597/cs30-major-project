  // Create the player object with properties
//let King;
class King {
    constructor(){
    this.x= windowWidth / 2;
    this.y= windowHeight / 2;
    this.width= 100; // Increased width
    this.height= 100; // Increased height
    this.vel= { x: 0, y: 0 };
    this.mirrorX= 1; // 1 for normal; -1 for flipped
    this.currentAnimation= "idle";
    this.frameIndex= 0;
    this.frameDelay= 5; // Delay between frames
    this.idleSpriteSheet= loadImage("assets/king_human_idle.png");
    this.runningSpriteSheet= loadImage("assets/king_human_run.png");
    this.jumpSprite= loadImage("assets/king_human_jump.png"); // Single-frame jump sprite
    this.idleFrames= 11;
    this.runningFrames= 8;
    this.isJumping= false; // Track if the player is jumping
    }

updatePosition() {
      // Handle movement
      if (keyIsDown(LEFT_ARROW)) {
        King.vel.x = -5;
        King.mirrorX = -1; // Flip the sprite to face left
      } else if (keyIsDown(RIGHT_ARROW)) {
        King.vel.x = 5;
        King.mirrorX = 1; // Flip the sprite to face right
      } else {
        King.vel.x = 0;
      }
    
      // Handle jumping
      if (keyIsDown(UP_ARROW) && !King.isJumping) {
        King.vel.y = -10; // Jump strength
        King.isJumping = true;
      }
    
      // Apply gravity
      King.vel.y += 0.5; // Gravity strength
    
      // Update position
      King.x += King.vel.x;
      King.y += King.vel.y;
    
      // Constrain the player within lvl1 boundaries
      King.x = constrain(
        King.x,
        lvl1Bounds.topLeft.x + King.width / 2,
        lvl1Bounds.bottomRight.x - King.width / 2
      );
    
      if (King.y + King.height / 2 >= lvl1Bounds.bottomRight.y) {
        King.y = lvl1Bounds.bottomRight.y - King.height / 2;
        King.vel.y = 0; // Stop falling when on the ground
    
        // Only reset jumping state if the player is grounded
        if (King.isJumping) {
          King.isJumping = false;
        }
      } else {
        // If the player is not grounded, ensure the jumping state is active
        King.isJumping = true;
      }
    }

updateState() {
      let newAnimation;
    
      if (King.isJumping) {
        newAnimation = "jump";
      } else if (King.vel.x !== 0) {
        newAnimation = "running";
      } else {
        newAnimation = "idle";
      }
    
      if (newAnimation !== King.currentAnimation) {
        King.currentAnimation = newAnimation;
        King.frameIndex = 0;
      }
    }


    draw() {
      let spriteSheet;
      let totalFrames;
    
      // Determine the current animation
      if (King.currentAnimation === "idle") {
        spriteSheet = King.idleSpriteSheet;
        totalFrames = King.idleFrames;
      } else if (King.currentAnimation === "running") {
        spriteSheet = King.runningSpriteSheet;
        totalFrames = King.runningFrames;
      } else if (King.currentAnimation === "jump") {
        spriteSheet = King.jumpSprite; // Use the single-frame jump sprite
        totalFrames = 1; // Single frame
      }
    
      // Ensure the spriteSheet is valid
      if (!spriteSheet) {
        console.error("Sprite sheet not loaded for animation:", King.currentAnimation);
        return;
      }
    
      // Calculate the frame width and height
      let frameWidth = spriteSheet.width / totalFrames;
      let frameHeight = spriteSheet.height;
    
      // Update the frame index based on the frame delay (only for multi-frame animations)
      if (totalFrames > 1 && frameCount % King.frameDelay === 0) {
        King.frameIndex = (King.frameIndex + 1) % totalFrames;
      } else if (totalFrames === 1) {
        King.frameIndex = 0; // Ensure the frame index is always 0 for single-frame animations
      }
    
      // Draw the current frame
      push();
      translate(King.x, King.y);
      scale(King.mirrorX, 1); // Flip the sprite if necessary
      image(
        spriteSheet,
        -King.width / 2,
        -King.height / 2,
        King.width,
        King.height,
        King.frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight
      );
      pop();
  }
}