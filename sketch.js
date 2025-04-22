// Platformer Game
// Hosain Javadi and Shail Chaudhari
// April 16th, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
let lvl=1;
let lvl1;

function preload(){
    lvl1 = loadImage("assets (final draft)/lvl 1.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  image(lvl1,0,0,width,height);
}

function draw() {
  //background(220);
}
