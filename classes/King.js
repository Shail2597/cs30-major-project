// Create the player object with properties
let spi;
let floor1;
let rightWall1,leftWall1,ceilling1;

class King {
  constructor() {
    this.isJumping = false; // Track if the player is jumping
  }

  pre() {
    // Create the player sprite
    spi = new Sprite(windowWidth / 2, windowHeight / 2, 78, 58);
    spi.spriteSheet = 'assets/king_human_full.png';

    // Add animations for the player
    spi.addAnis({
      attack: { row: 0, frames: 3 },
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

    // Set the default animation to 'idle'
    spi.changeAni('idle');
    spi.anis.offset.y = 15; // Adjust the offset for the sprite
    allSprites.pixelPerfect = false;
  }

  spid() {
    // Create the floor sprite
    floor1 = new Sprite();
    floor1.y = 433;
    floor1.w = 870;
    floor1.h = 1;
    floor1.collider = STATIC;

    rightWall1 = new Sprite();
    rightWall1.x = 322-39;
    rightWall1.w = 1;
    rightWall1.h = 200;
    rightWall1.y = 336;
    rightWall1.collider = STA;

    leftWall1 = new Sprite();
    leftWall1.x = 316+800+39;
    leftWall1.w = 1;
    leftWall1.h = 200;
    leftWall1.y = 336;
    leftWall1.collider = STA;
  }

  handleInput() {
    // Handle horizontal movement
    if (keyIsDown(RIGHT_ARROW)) {
      spi.vel.x = 6;
      spi.mirror.x = false; // Face right (no mirroring)
      spi.changeAni('run');
    } else if (keyIsDown(LEFT_ARROW)) {
      spi.vel.x = -6;
      spi.mirror.x = true; // Face left (mirroring)
      spi.changeAni('run');
    } else {
      spi.vel.x = 0;
      spi.changeAni('idle');
    }

    // Handle jumping
    if (keyIsDown(UP_ARROW) && !this.isJumping) {
      spi.vel.y = -8; // Jump strength
      this.isJumping = true;
      spi.changeAni('jump');
    }

    // Transition to fall animation when falling
    if (this.isJumping && spi.vel.y > 0) {
      spi.changeAni('fall');
    }

    // Check if the player is on the ground
    if (spi.collides(floor1)) {
      this.isJumping = false; // Reset jumping state
    spi.changeAni('idle'); // Reset to idle animation when grounded
    }

    // Handle attack
    if (keyIsDown(32)) { // Space key
      spi.changeAni('attack');
    }
  }

  doAll() {
    // Handle input
    this.handleInput();

    // Update and draw the player sprite
    spi.update();
    spi.draw();
  }
}
// //let King;
// let spi;
// let floor1;

// class King {
//     constructor(){
//     // this.x = windowWidth/2;
//     // this.y = windowHeight/2;
//     // this.width= 100; // Increased width
//     // this.height= 100; // Increased height
//     // this.vel= { x: 0, y: 0 };
//     // this.mirrorX= 1; // 1 for normal; -1 for flipped
//     // this.currentAnimation= "idle";
//     // this.frameIndex= 0;
//     // this.frameDelay= 5; // Delay between frames
//     // // this.idleSpriteSheet= loadImage("assets/king_idle.png");
//     // // this.runningSpriteSheet= loadImage("assets/king_human_run.png");
//     // // this.jumpSprite= loadImage("assets/king_human_jump.png"); // Single-frame jump sprite
//     // this.idleFrames= 11;
//     // this.runningFrames= 8;
//     // this.isJumping= false; // Track if the player is jumping
//     }

// // updatePosition() {
// //       // Handle movement
// //       if (keyIsDown(LEFT_ARROW)) {
// //         this.vel.x = -5;
// //         this.mirrorX = -1; // Flip the sprite to face left
// //       } else if (keyIsDown(RIGHT_ARROW)) {
// //         this.vel.x = 5;
// //         this.mirrorX = 1; // Flip the sprite to face right
// //       } else {
// //         this.vel.x = 0;
// //       }
    
// //       // Handle jumping
// //       if (keyIsDown(UP_ARROW) && !this.isJumping) {
// //         this.vel.y = -10; // Jump strength
// //         this.isJumping = true;
// //       }
    
// //       // Apply gravity
// //       this.vel.y += 0.5; // Gravity strength
    
// //       // Update position
// //       this.x += this.vel.x;
// //       this.y += this.vel.y;
    
// //       // Constrain the player within lvl1 boundaries
// //       this.x = constrain(
// //         this.x,
// //         lvl1Bounds.topLeft.x + this.width / 2,
// //         lvl1Bounds.bottomRight.x - this.width / 2
// //       );
    
// //       if (this.y + this.height / 2 >= lvl1Bounds.bottomRight.y) {
// //         this.y = lvl1Bounds.bottomRight.y - this.height / 2;
// //         this.vel.y = 0; // Stop falling when on the ground
    
// //         // Only reset jumping state if the player is grounded
// //         if (this.isJumping) {
// //           this.isJumping = false;
// //         }
// //       } else {
// //         // If the player is not grounded, ensure the jumping state is active
// //         this.isJumping = true;
// //       }
// //     }

// // updateState() {
// //       let newAnimation;
    
// //       if (this.isJumping) {
// //         newAnimation = "jump";
// //       } else if (this.vel.x !== 0) {
// //         newAnimation = "running";
// //       } else {
// //         newAnimation = "idle";
// //       }
    
// //       if (newAnimation !== this.currentAnimation) {
// //         this.currentAnimation = newAnimation;
// //         this.frameIndex = 0;
// //       }
// //     }


// //     draw() {
// //       let spriteSheet;
// //       let totalFrames;
    
// //       // Determine the current animation
// //       if (this.currentAnimation === "idle") {
// //         spriteSheet = this.idleSpriteSheet;
// //         totalFrames = this.idleFrames;
// //       } else if (this.currentAnimation === "running") {
// //         spriteSheet = this.runningSpriteSheet;
// //         totalFrames = this.runningFrames;
// //       } else if (this.currentAnimation === "jump") {
// //         spriteSheet = this.jumpSprite; // Use the single-frame jump sprite
// //         totalFrames = 1; // Single frame
// //       }
    
// //       // Ensure the spriteSheet is valid
// //       if (!spriteSheet) {
// //         console.error("Sprite sheet not loaded for animation:", this.currentAnimation);
// //         return;
// //       }
    
// //       // Calculate the frame width and height
// //       let frameWidth = spriteSheet.width / totalFrames;
// //       let frameHeight = spriteSheet.height;
    
// //       // Update the frame index based on the frame delay (only for multi-frame animations)
// //       if (totalFrames > 1 && frameCount % this.frameDelay === 0) {
// //         this.frameIndex = (this.frameIndex + 1) % totalFrames;
// //       } else if (totalFrames === 1) {
// //         this.frameIndex = 0; // Ensure the frame index is always 0 for single-frame animations
// //       }
    
// //       // Draw the current frame
// //       push();
// //       translate(this.x, this.y);
// //       scale(this.mirrorX, 1); // Flip the sprite if necessary
// //       image(
// //         spriteSheet,
// //         -this.width / 2,
// //         -this.height / 2,
// //         this.width,
// //         this.height,
// //         this.frameIndex * frameWidth,
// //         0,
// //         frameWidth,
// //         frameHeight
// //       );
// //         pop();
// //   }

// //   doAll(){
// //     this.updatePosition();
// //     this.updateState();
// //     this.draw();
// //   }
// pre(){
//   spi = new Sprite( windowWidth/2, windowHeight/2, 100, 100);
//   spi.spriteSheet = 'assets/king_human_full.png';
// 	spi.anis.offset.x = 2;
// 	spi.anis.frameDelay = 8;
// 	spi.friction = 0;
//   spi.addAnis({
//     attack: { row: 0, frames: 3 },
//     dead: { row: 1, frames: 4 },
//     door_in: { row: 2, frames: 8, frameDelay: 14 },
//     door_out: { row: 3, frames: 8, frameDelay: 14 },
//     fall: { row: 4},
//     ground: {row :5},
//     hit: { row: 6, frames:2 },
//     idle: { row: 7, frames: 11},
//     jump:{row:8},
//     run :{row:9, frames:8}
//   });
// 	spi.changeAni('idle');
//   allSprites.pixelPerfect = true;

// }

//   spid(){



//     floor1 = new Sprite();
//     floor1.y = 445;
//     floor1.w = 893;
//     floor1.h = 1;
//     floor1.collider = STATIC;
//   }
// }


// //let King;
// let spi;
// let floor1;

// class King {
//     constructor(){
//     // this.x = windowWidth/2;
//     // this.y = windowHeight/2;
//     // this.width= 100; // Increased width
//     // this.height= 100; // Increased height
//     // this.vel= { x: 0, y: 0 };
//     // this.mirrorX= 1; // 1 for normal; -1 for flipped
//     // this.currentAnimation= "idle";
//     // this.frameIndex= 0;
//     // this.frameDelay= 5; // Delay between frames
//     // // this.idleSpriteSheet= loadImage("assets/king_idle.png");
//     // // this.runningSpriteSheet= loadImage("assets/king_human_run.png");
//     // // this.jumpSprite= loadImage("assets/king_human_jump.png"); // Single-frame jump sprite
//     // this.idleFrames= 11;
//     // this.runningFrames= 8;
//     // this.isJumping= false; // Track if the player is jumping
//     }

// // updatePosition() {
// //       // Handle movement
// //       if (keyIsDown(LEFT_ARROW)) {
// //         this.vel.x = -5;
// //         this.mirrorX = -1; // Flip the sprite to face left
// //       } else if (keyIsDown(RIGHT_ARROW)) {
// //         this.vel.x = 5;
// //         this.mirrorX = 1; // Flip the sprite to face right
// //       } else {
// //         this.vel.x = 0;
// //       }
    
// //       // Handle jumping
// //       if (keyIsDown(UP_ARROW) && !this.isJumping) {
// //         this.vel.y = -10; // Jump strength
// //         this.isJumping = true;
// //       }
    
// //       // Apply gravity
// //       this.vel.y += 0.5; // Gravity strength
    
// //       // Update position
// //       this.x += this.vel.x;
// //       this.y += this.vel.y;
    
// //       // Constrain the player within lvl1 boundaries
// //       this.x = constrain(
// //         this.x,
// //         lvl1Bounds.topLeft.x + this.width / 2,
// //         lvl1Bounds.bottomRight.x - this.width / 2
// //       );
    
// //       if (this.y + this.height / 2 >= lvl1Bounds.bottomRight.y) {
// //         this.y = lvl1Bounds.bottomRight.y - this.height / 2;
// //         this.vel.y = 0; // Stop falling when on the ground
    
// //         // Only reset jumping state if the player is grounded
// //         if (this.isJumping) {
// //           this.isJumping = false;
// //         }
// //       } else {
// //         // If the player is not grounded, ensure the jumping state is active
// //         this.isJumping = true;
// //       }
// //     }

// // updateState() {
// //       let newAnimation;
    
// //       if (this.isJumping) {
// //         newAnimation = "jump";
// //       } else if (this.vel.x !== 0) {
// //         newAnimation = "running";
// //       } else {
// //         newAnimation = "idle";
// //       }
    
// //       if (newAnimation !== this.currentAnimation) {
// //         this.currentAnimation = newAnimation;
// //         this.frameIndex = 0;
// //       }
// //     }


// //     draw() {
// //       let spriteSheet;
// //       let totalFrames;
    
// //       // Determine the current animation
// //       if (this.currentAnimation === "idle") {
// //         spriteSheet = this.idleSpriteSheet;
// //         totalFrames = this.idleFrames;
// //       } else if (this.currentAnimation === "running") {
// //         spriteSheet = this.runningSpriteSheet;
// //         totalFrames = this.runningFrames;
// //       } else if (this.currentAnimation === "jump") {
// //         spriteSheet = this.jumpSprite; // Use the single-frame jump sprite
// //         totalFrames = 1; // Single frame
// //       }
    
// //       // Ensure the spriteSheet is valid
// //       if (!spriteSheet) {
// //         console.error("Sprite sheet not loaded for animation:", this.currentAnimation);
// //         return;
// //       }
    
// //       // Calculate the frame width and height
// //       let frameWidth = spriteSheet.width / totalFrames;
// //       let frameHeight = spriteSheet.height;
    
// //       // Update the frame index based on the frame delay (only for multi-frame animations)
// //       if (totalFrames > 1 && frameCount % this.frameDelay === 0) {
// //         this.frameIndex = (this.frameIndex + 1) % totalFrames;
// //       } else if (totalFrames === 1) {
// //         this.frameIndex = 0; // Ensure the frame index is always 0 for single-frame animations
// //       }
    
// //       // Draw the current frame
// //       push();
// //       translate(this.x, this.y);
// //       scale(this.mirrorX, 1); // Flip the sprite if necessary
// //       image(
// //         spriteSheet,
// //         -this.width / 2,
// //         -this.height / 2,
// //         this.width,
// //         this.height,
// //         this.frameIndex * frameWidth,
// //         0,
// //         frameWidth,
// //         frameHeight
// //       );
// //         pop();
// //   }

// //   doAll(){
// //     this.updatePosition();
// //     this.updateState();
// //     this.draw();
// //   }
// pre(){
//   spi = new Sprite( windowWidth/2, windowHeight/2, 100, 100);
//   spi.spriteSheet = 'assets/king_human_full.png';
// 	spi.anis.offset.x = 2;
// 	spi.anis.frameDelay = 8;
// 	spi.friction = 0;
//   spi.addAnis({
//     attack: { row: 0, frames: 3 },
//     dead: { row: 1, frames: 4 },
//     door_in: { row: 2, frames: 8, frameDelay: 14 },
//     door_out: { row: 3, frames: 8, frameDelay: 14 },
//     fall: { row: 4},
//     ground: {row :5},
//     hit: { row: 6, frames:2 },
//     idle: { row: 7, frames: 11},
//     jump:{row:8},
//     run :{row:9, frames:8}
//   });
// 	spi.changeAni('idle');
//   allSprites.pixelPerfect = true;

// }

//   spid(){



//     floor1 = new Sprite();
//     floor1.y = 445;
//     floor1.w = 893;
//     floor1.h = 1;
//     floor1.collider = STATIC;
//   }
// }

