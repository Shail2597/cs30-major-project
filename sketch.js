// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let lvl1;
let xOffset, yOffset;

function preload() {
  lvl1 = loadImage("assets (final draft)/lvl 1.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateOffsets();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateOffsets();
}

function calculateOffsets() {
  // center the image in the canvas
  xOffset = (windowWidth  - lvl1.width)  / 2;
  yOffset = (windowHeight - lvl1.height) / 2;
}

function draw() {
  background(62, 56, 80, 255);

  image(lvl1, xOffset, yOffset);
  
}


