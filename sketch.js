// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let level = 1;

let lvl1Image;
let lvl1door;
let lvl1XOffset, lvl1YOffset;

let lvl2Image;
let lvl2StartX, lvl2StartY;
let lvl2width = 792;
let lvl2height = 229;
let lvl2XOffset, lvl2YOffset;

let lvl1bounds = {
  lvl1width : 797,
  lvl1height : 143,
  lvl1boxwidth : 75 ,
  lvl1boxheight : 63.5
};

let lvl1StartX, lvl1StartY;
let lvl1width = 797;
let lvl1height = 143;
let lvl1boxwidth = 75 ;
let lvl1boxheight = 63.5;
let lvl1boxstartX ;
let lvl1boxendX ;
let lvl1boxstartY ;



let player;
let enemy1lvl1;

function preload() {
  // Load level 1 image
  lvl1Image = loadImage("assets/lvl 1.png");

  // Load level 2 image
  lvl2Image = loadImage("assets/lvl 2.png");

  // Initialize the player object and call its pre() method
  lvl1door = new Door();
  lvl1door.pre(100,100)
  player = new King();
  player.pre();

  enemy1lvl1 = new Pig();
  enemy1lvl1.pre();
}

function setup() {
  // Create the canvas
  createCanvas(windowWidth, windowHeight);

  // Calculate offsets for level 1 and level 2
  calculateLvl1Offsets();
  calculateLvl2Offsets();

  // Initialize physics world
  world.gravity.y = 11;

  // Initialize level 1 boundaries
  calculatelvl1Bounds();
}

function windowResized() {
  // Resize canvas and recalculate offsets
  resizeCanvas(windowWidth, windowHeight);
  calculateLvl1Offsets();
  calculateLvl2Offsets();

  // Update level 1 boundaries
  lvl1StartX = width / 2;
  lvl1StartY = (height - lvl1height) / 2;
  calculatelvl1Bounds();
}

function calculateLvl1Offsets() {
  // Ensure lvl1Image is loaded before accessing its dimensions
  if (lvl1Image) {
    lvl1XOffset = (width - lvl1Image.width) / 2;
    lvl1YOffset = (height - lvl1Image.height) / 2;
  }
}

function calculateLvl2Offsets() {
  if (lvl2Image) {
    lvl2XOffset = (width - lvl2Image.width) / 2;
    lvl2YOffset = (height - lvl2Image.height) / 2;
  }
}

function draw() {
  // Set background color
  background(62, 56, 80);

  if (level === 1) {
    // Draw level 1 image
    if (lvl1Image) {
      image(lvl1Image, lvl1XOffset, lvl1YOffset);
    }

    // Update and draw the player sprite
  }
  else if (level === 2) {
    // Draw level 2 image
    if (lvl2Image) {
      image(lvl2Image, lvl2XOffset, lvl2YOffset);
    }
  }
  player.doAll();
  enemy1lvl1.doAll();
  console.log(mouseX, mouseY);
}

function keyPressed() {
  if (key === '1') {
    level = 1; // Switch to level 1
    calculatelvl1Bounds();
  }
  else if (key === '2') {
    level = 2; // Switch to level 2
    calculatelvl1Bounds();

    // Clear all sprites and colliders
  }
}

function calculatelvl1Bounds(){
  if (level === 1) {
    lvl1bounds = {
      lvl1width : 797,
      lvl1height : 143,
      lvl1boxwidth : 75 ,
      lvl1boxheight : 63.5
    };
    lvl1bounds.lvl1StartX = width / 2;
    lvl1bounds.lvl1StartY = (height - lvl1bounds.lvl1height) / 2 + lvl1bounds.lvl1height;
    lvl1bounds.lvl1boxstartX = lvl1bounds.lvl1StartX - lvl1bounds.lvl1width / 2;
    lvl1bounds.lvl1boxendX = lvl1bounds.lvl1boxstartX + lvl1bounds.lvl1boxwidth;
    lvl1bounds.lvl1boxstartY = lvl1bounds.lvl1StartY - lvl1bounds.lvl1boxheight;

    player.spawnWalls(
      level,
      lvl1bounds.lvl1StartX,
      lvl1bounds.lvl1StartY,
      lvl1bounds.lvl1width,
      lvl1bounds.lvl1boxendX,
      lvl1bounds.lvl1boxstartY + lvl1bounds.lvl1boxheight / 2,
      lvl1bounds.lvl1boxwidth,
      lvl1bounds.lvl1boxheight,
      lvl1bounds.lvl1boxstartY, 
      lvl1bounds.lvl1boxstartX,
      lvl1bounds.lvl1boxstartX + lvl1bounds.lvl1width,
      lvl1bounds.lvl1StartY - lvl1bounds.lvl1height/2,
      lvl1bounds.lvl1height + 100,
      lvl1bounds.lvl1StartY - lvl1bounds.lvl1height
    );
    enemy1lvl1.spid();
  }
  else if (level === 2) {
    lvl2StartX = (width - lvl2width) / 2;
    lvl2StartY = (height - lvl2height) / 2 + 50;
    player.spawnWalls(
      level,
      lvl2StartX,
      lvl2StartY
    );
  }
}
