// Create the player object with properties
let spi;
let floor1;
let x1, y1, x2, y2, x3, y3, x4, y5, x6, x7, x8, x9, x10;
let box_vertical;
let box_horizontal;
let left_wall;
let right_wall;
let hitBox;




class King {
  constructor() {
    this.isJumping = false; // Track if the player is jumping
  }

  pre() {
    // Create the player sprite
    hitBox = new Sprite(windowWidth / 2, windowHeight / 2, 45, 53);
    spi = new Sprite(hitBox.x, hitBox.y, 78, 58);
    spi.spriteSheet = 'assets/king_human_full.png';

    // Add animations for the player
    spi.addAnis({
      attack: { row: 0, frames: 3, frameDelay: 6},
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
    allSprites.pixelPerfect = true; // Enable pixel-perfect collision detection
    spi.rotationLock = true; // Lock the rotation of the sprite
    spi.collider = "NONE";
    hitBox.rotationLock = true; // Lock the rotation of the hitbox
  }
  
  spid(x1, y1, x2, x3, y3, x4, y4, y5, x6, x7, y2, y6 ) {  
    // Create the floor sprite
    //floor1 = new Sprite(x1, y1, x2, y2, STATIC);
    floor1 = new Sprite(x1, y1, x2, 0, STATIC);
    left_wall = new Sprite(x6-34, y2, 0, y6, STATIC);
    right_wall = new Sprite(x7+34, y2, 0, y6, STATIC);
    box_vertical = new Sprite(x3-34, y3, 0, y4, STATIC);
    box_horizontal = new Sprite(x3-34, y5, x4, 0, STATIC);
    
    //Set the properties of the floor sprite
    // floor1.visible = false;
    // left_wall.visible = false;
    // right_wall.visible = false;
    // box_vertical.visible = false;
    // box_horizontal.visible = false;
  }
  
  handleInput() {
    // Handle horizontal movement
    if (keyIsDown(RIGHT_ARROW)) {
      hitBox.vel.x = 6;
      hitBox.mirror.x = false; // Face right (no mirroring)
      spi.mirror.x = false; // Face right (no mirroring)
      spi.changeAni('run');
    } else if (keyIsDown(LEFT_ARROW)) {
      spi.vel.x = -6;
      spi.vel.x = -6;
      spi.mirror.x = true; // Face left (mirroring)
      spi.changeAni('run');
    } else {
      hitBox.vel.x = 0;
      spi.changeAni('idle');
    }
    
    if (keyIsDown(UP_ARROW) && !this.isJumping) {
      hitBox.vel.y = -6; // Jump strength
      this.isJumping = true;
    }
    if (hitBox.vel.y < 0) {
      spi.changeAni('jump');
    }

    // Transition to fall animation when falling
    if (this.isJumping && hitBox.vel.y > 0) {
      spi.changeAni('fall');
    }

    // Check if the player is on the ground
    if (hitBox.collides(floor1)) {
      this.isJumping = false; // Reset jumping state
      spi.changeAni('idle'); // Reset to idle animation when grounded
    }
    
    // Handle attack
    if (keyIsDown(32)) { // Space key
      spi.changeAni('attack');
    }
    if(mouseIsPressed) {
      allSprites.debug = true; // Enable debug mode for the sprite
    }
  }
  
  doAll() {
    // Handle input
    this.handleInput();
    //spi.scale = 1.5; // Adjust the scale factor as needed

    // Update and draw the player sprite
    spi.update();
    spi.draw();
    spi.scale = 1.7; // Adjust the scale factor as needed
  }
}
