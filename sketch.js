// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let lvl1Image;
let lvl1XOffset, lvl1YOffset;

let lvl1bounds = {
  lvl1width : 797,
  lvl1height : 143,
  lvl1boxwidth : 75 ,
  lvl1boxheight : 63.5
}

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
  
  // Initialize the player object and call its pre() method
  player = new King();
  player.pre();

  enemy1lvl1 = new Pig();
  enemy1lvl1.pre();
}  

function setup() {
  // Create the canvas
  createCanvas(windowWidth, windowHeight);
  

  calculatelvl1Bounds();

  // Calculate offsets for level 1
  calculateLvl1Offsets();

  // Initialize physics world
  world.gravity.y = 11;
  // Initialize the floor
}

function windowResized() {
  // Resize canvas and recalculate offsets
  resizeCanvas(windowWidth, windowHeight);
  calculateLvl1Offsets();

  // Update level boundaries
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
  enemy1lvl1.doAll();
}

function calculatelvl1Bounds(){
  lvl1bounds = {
    lvl1width : 797,
    lvl1height : 143,
    lvl1boxwidth : 75 ,
    lvl1boxheight : 63.5
  };
  lvl1bounds.lvl1StartX = width / 2;
  lvl1bounds.lvl1StartY = ((height - lvl1bounds.lvl1height) / 2) + lvl1bounds.lvl1height;
  lvl1bounds.lvl1boxstartX = lvl1bounds.lvl1StartX - (lvl1bounds.lvl1width / 2);
  lvl1bounds.lvl1boxendX = lvl1bounds.lvl1boxstartX + lvl1bounds.lvl1boxwidth;
  lvl1bounds.lvl1boxstartY = lvl1bounds.lvl1StartY - lvl1bounds.lvl1boxheight;

  player.spawnWalls(
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
    lvl1bounds.lvl1StartY - (lvl1bounds.lvl1height/2),
    lvl1bounds.lvl1height  
  );
  enemy1lvl1.spid();
}
