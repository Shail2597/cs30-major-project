let mg;
let ml;
let state = "intro"; // or 'mapEditor', 'mapLoader'
let introImg;
let startButton, otherButton1, otherButton2;

function preload() {
  introImg = loadImage("asset/introWindow.png");
  mg = new MapGenerator({
    cols: 20,
    rows: 14,
    tileSize: 64,
    bgCount: 47,
    wallCount: 47,
    decCount: 20,
  });
  mg.preload();
  ml = new MapLoader({
    cols: 20,
    rows: 14,
    tileSize: 64,
    bgCount: 47,
    wallCount: 47,
    decCount: 20,
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
  background(220);
  if (state === "intro") {
    imageMode(CENTER);
    image(introImg, width / 2, height / 2);
  }
  else if (state === "mapEditor") {
    mg.draw();
  }
  else if (state === "mapLoader") {
    ml.draw();
  }
}

function setupIntroScreen() {
  startButton = createButton("Start Map Editor");
  startButton.position(width / 2 - 60, height - 200);
  startButton.mousePressed(() => {
    changeToMapEditor();
  });

  otherButton1 = createButton("Map Loader");
  otherButton1.position(width / 2 - 60, height - 160);
  otherButton1.mousePressed(() => {
    changeToMapLoader();
  });

  otherButton2 = createButton("Option 3");
  otherButton2.position(width / 2 - 60, height - 120);
}

function changeToMapEditor() {
  startButton.remove();
  otherButton1.remove();
  otherButton2.remove();
  state = "mapEditor";
  mg.setup();
}

function changeToMapLoader() {
  startButton.remove();
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
