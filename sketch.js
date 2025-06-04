let mg;
let ml;
let state = "intro"; // or 'mapEditor', 'mapLoader'
let introImg;
let otherButton0, otherButton1, otherButton2, backButton;

function preload() {
  introImg = loadImage("asset/introWindow.png");
  mg = new MapGenerator({
    cols: 20,
    rows: 14,
    tileSize: 64,
    bgCount: 47,
    wallCount: 47,
    decCount: 23,
  });
  mg.preload();
  ml = new MapLoader({
    cols: 20,
    rows: 14,
    tileSize: 64,
    bgCount: 47,
    wallCount: 47,
    decCount: 23,
  });
  ml.preload();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  if (state === "intro") {
    setupIntroScreen();
  }
}

function draw() {
  background(62, 56, 80);
  if (state === "intro") {
    imageMode(CORNER);
    image(introImg, 0, 0, width, height);
  }
  else if (state === "mapEditor") {
    mg.draw();
  }
  else if (state === "mapLoader") {
    ml.draw();
  }
}

function setupIntroScreen() {
  otherButton0 = createButton("Start Map Editor");
  otherButton0.position(width/2 - 100, height/2 +  60);
  otherButton0.size(200, 40);
  otherButton0.style("background-color", "#6a0dad");
  otherButton0.style("color", "#ffffff");
  otherButton0.style("border", "none");
  otherButton0.style("border-radius", "8px");
  otherButton0.style("padding", "8px 0px");
  otherButton0.style("font-size", "16px");
  otherButton0.style("font-family", "Arial, sans-serif");
  otherButton0.style("cursor", "pointer");
  otherButton0.mousePressed(changeToMapEditor);

  otherButton1 = createButton("Map Loader");
  otherButton1.position(width/2 - 100, height/2 + 110);
  otherButton1.size(200, 40);
  otherButton1.style("background-color", "#6a0dad");
  otherButton1.style("color", "#ffffff");
  otherButton1.style("border", "none");
  otherButton1.style("border-radius", "8px");
  otherButton1.style("padding", "8px 0px");
  otherButton1.style("font-size", "16px");
  otherButton1.style("font-family", "Arial, sans-serif");
  otherButton1.style("cursor", "pointer");
  otherButton1.mousePressed(changeToMapLoader);

  otherButton2 = createButton("Adventure Mode");
  otherButton2.position(width/2 - 100, height/2 + 10);
  otherButton2.size(200, 40);
  otherButton2.style("background-color", "#6a0dad");
  otherButton2.style("color", "#ffffff");
  otherButton2.style("border", "none");
  otherButton2.style("border-radius", "8px");
  otherButton2.style("padding", "8px 0px");
  otherButton2.style("font-size", "16px");
  otherButton2.style("font-family", "Arial, sans-serif");
  otherButton2.style("cursor", "pointer");

  otherButton0.mouseOver(() => {
    otherButton0.style('background-color', '#8541ee');
  });
  otherButton0.mouseOut(() => {
    otherButton0.style('background-color', '#6a0dad');
  });

  otherButton1.mouseOver(() => {
    otherButton1.style('background-color', '#8541ee');
  });
  otherButton1.mouseOut(() => {
    otherButton1.style('background-color', '#6a0dad');
  });
  
  otherButton2.mouseOver(() => {
    otherButton2.style('background-color', '#8541ee');
  });
  otherButton2.mouseOut(() => {
    otherButton2.style('background-color', '#6a0dad');
  });
}

function changeToMapEditor() {
  otherButton0.remove();
  otherButton1.remove();
  otherButton2.remove();
  state = "mapEditor";
  mg.setup();
}

function changeToMapLoader() {
  otherButton0.remove();
  otherButton1.remove();
  otherButton2.remove();
  state = "mapLoader";
  ml.setup();
}

function mousePressed() {
  if (state === "mapEditor") {
    mg.mousePressed();
  }
}
