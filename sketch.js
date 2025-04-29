// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let lvl1Image;
let lvl1XOffset, lvl1YOffset;
let p1;

let lvl1StartX, lvl1StartY;
let lvl1Bounds;

function preload() {
  lvl1Image = loadImage("assets/lvl 1.png");

  // Create the player object with properties
  p1 = {
    x: windowWidth / 2,
    y: windowHeight / 2,
    width: 100, // Increased width
    height: 100, // Increased height
    vel: { x: 0, y: 0 },
    mirrorX: 1, // 1 for normal, -1 for flipped
    currentAnimation: "idle",
    frameIndex: 0,
    frameDelay: 5, // Delay between frames
    idleSpriteSheet: loadImage("assets/king_human_idle.png"),
    runningSpriteSheet: loadImage("assets/king_human_run.png"),
    jumpSprite: loadImage("assets/king_human_jump.png"), // Single-frame jump sprite
    idleFrames: 11,
    runningFrames: 8,
    isJumping: false, // Track if the player is jumping
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize lvl1StartX and lvl1StartY after windowWidth and windowHeight are available
  lvl1StartX = (windowWidth - 893) / 2;
  lvl1StartY = (windowHeight - 192) / 2;

  // Define the rectangle boundaries for lvl1
  lvl1Bounds = {
    topLeft: { x: lvl1StartX, y: lvl1StartY },
    bottomRight: { x: lvl1StartX + 893, y: lvl1StartY + 192 },
  };

  calculateLvl1Offsets();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateLvl1Offsets();

  // Recalculate lvl1StartX and lvl1StartY on window resize
  lvl1StartX = (windowWidth - 793) / 2;
  lvl1StartY = (windowHeight - 192) / 2;

  // Update rectangle boundaries for lvl1
  lvl1Bounds = {
    topLeft: { x: lvl1StartX, y: lvl1StartY },
    bottomRight: { x: lvl1StartX + 793, y: lvl1StartY + 192 },
  };
}

function calculateLvl1Offsets() {
  lvl1XOffset = (windowWidth - lvl1Image.width) / 2;
  lvl1YOffset = (windowHeight - lvl1Image.height) / 2;
}

function draw() {
  background(62, 56, 80);

  // Draw lvl1
  image(lvl1Image, lvl1XOffset, lvl1YOffset);

  // Update player state and position
  updatePlayerState();
  updatePlayerPosition();

  // Draw the player
  drawSprite(p1);
}

function updatePlayerState() {
  let newAnimation;

  if (p1.isJumping) {
    newAnimation = "jump";
  } else if (p1.vel.x !== 0) {
    newAnimation = "running";
  } else {
    newAnimation = "idle";
  }

  if (newAnimation !== p1.currentAnimation) {
    p1.currentAnimation = newAnimation;
    p1.frameIndex = 0;
  }
}

function updatePlayerPosition() {
  // Handle movement
  if (keyIsDown(LEFT_ARROW)) {
    p1.vel.x = -5;
    p1.mirrorX = -1; // Flip the sprite to face left
  } else if (keyIsDown(RIGHT_ARROW)) {
    p1.vel.x = 5;
    p1.mirrorX = 1; // Flip the sprite to face right
  } else {
    p1.vel.x = 0;
  }

  // Handle jumping
  if (keyIsDown(UP_ARROW) && !p1.isJumping) {
    p1.vel.y = -10; // Jump strength
    p1.isJumping = true;
  }

  // Apply gravity
  p1.vel.y += 0.5; // Gravity strength

  // Update position
  p1.x += p1.vel.x;
  p1.y += p1.vel.y;

  // Constrain the player within lvl1 boundaries
  p1.x = constrain(
    p1.x,
    lvl1Bounds.topLeft.x + p1.width / 2,
    lvl1Bounds.bottomRight.x - p1.width / 2
  );

  if (p1.y + p1.height / 2 >= lvl1Bounds.bottomRight.y) {
    p1.y = lvl1Bounds.bottomRight.y - p1.height / 2;
    p1.vel.y = 0; // Stop falling when on the ground

    // Only reset jumping state if the player is grounded
    if (p1.isJumping) {
      p1.isJumping = false;
    }
  } else {
    // If the player is not grounded, ensure the jumping state is active
    p1.isJumping = true;
  }
}

function drawSprite(sprite) {
  let spriteSheet;
  let totalFrames;

  // Determine the current animation
  if (sprite.currentAnimation === "idle") {
    spriteSheet = sprite.idleSpriteSheet;
    totalFrames = sprite.idleFrames;
  } else if (sprite.currentAnimation === "running") {
    spriteSheet = sprite.runningSpriteSheet;
    totalFrames = sprite.runningFrames;
  } else if (sprite.currentAnimation === "jump") {
    spriteSheet = sprite.jumpSprite; // Use the single-frame jump sprite
    totalFrames = 1; // Single frame
  }

  // Ensure the spriteSheet is valid
  if (!spriteSheet) {
    console.error("Sprite sheet not loaded for animation:", sprite.currentAnimation);
    return;
  }

  // Calculate the frame width and height
  let frameWidth = spriteSheet.width / totalFrames;
  let frameHeight = spriteSheet.height;

  // Update the frame index based on the frame delay (only for multi-frame animations)
  if (totalFrames > 1 && frameCount % sprite.frameDelay === 0) {
    sprite.frameIndex = (sprite.frameIndex + 1) % totalFrames;
  } else if (totalFrames === 1) {
    sprite.frameIndex = 0; // Ensure the frame index is always 0 for single-frame animations
  }

  // Draw the current frame
  push();
  translate(sprite.x, sprite.y);
  scale(sprite.mirrorX, 1); // Flip the sprite if necessary
  image(
    spriteSheet,
    -sprite.width / 2,
    -sprite.height / 2,
    sprite.width,
    sprite.height,
    sprite.frameIndex * frameWidth,
    0,
    frameWidth,
    frameHeight
  );
  pop();
}