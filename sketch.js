// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let lvl1Image;
let lvl1XOffset, lvl1YOffset;

let lvl1StartX, lvl1StartY;
let lvl1Bounds;

let player;

function preload() {
  // Load level 1 image
  lvl1Image = loadImage("assets/lvl 1.png");

  // Initialize the player object and call its pre() method
  player = new King();
  player.pre();
}

function setup() {
  // Create the canvas
  createCanvas(windowWidth, windowHeight);

  // Initialize level boundaries
  lvl1StartX = (windowWidth - 893) / 2;
  lvl1StartY = (windowHeight - 192) / 2;

  lvl1Bounds = {
    topLeft: { x: lvl1StartX, y: lvl1StartY },
    bottomRight: { x: lvl1StartX + 893, y: lvl1StartY + 192 },
  };

  // Calculate offsets for level 1
  calculateLvl1Offsets();

  // Initialize physics world
  world.gravity.y = 10;

  // Initialize the floor
  player.spid();
}

function windowResized() {
  // Resize canvas and recalculate offsets
  resizeCanvas(windowWidth, windowHeight);
  calculateLvl1Offsets();

  // Update level boundaries
  lvl1StartX = (windowWidth - 893) / 2;
  lvl1StartY = (windowHeight - 192) / 2;

  lvl1Bounds = {
    topLeft: { x: lvl1StartX, y: lvl1StartY },
    bottomRight: { x: lvl1StartX + 893, y: lvl1StartY + 192 },
  };
}

function calculateLvl1Offsets() {
  // Ensure lvl1Image is loaded before accessing its dimensions
  if (lvl1Image) {
    lvl1XOffset = (windowWidth - lvl1Image.width) / 2;
    lvl1YOffset = (windowHeight - lvl1Image.height) / 2;
  }
}

function draw() {
  // Set background color
  background(62, 56, 80);

  // Draw level 1 image
  if (lvl1Image) {
    image(lvl1Image, lvl1XOffset, lvl1YOffset);
  }

  // Log mouse position for debugging
  console.log(mouseX, mouseY);

  // Update and draw the player sprite
  player.doAll();
}


