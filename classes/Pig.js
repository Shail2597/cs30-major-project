let pigSpi;
let hitBoxPig;
let perlinTimeX = 0;
let perlinTimeY = 1000;
let perlinDeltaTime = 0.00000005;
const MAX_SPEED = 3;  // adjust for how fast the pig can drift
const DELAY = 0.3;

class Pig {
  constructor() {
    this.isJumping = false;
  }

  pre() {
    hitBoxPig = new Sprite((windowWidth/2) + windowWidth/4, windowHeight/2, 34, 30);
    pigSpi    = new Sprite(hitBoxPig.x, hitBoxPig.y, 34, 28);
    pigSpi.spriteSheet = 'assets/pig.png';
    pigSpi.addAnis({
    death:  { row: 0, frames: 4 },
    fall:   { row: 1 },
    ground: { row: 2 },
    hit:    { row: 3 },
    idle:   { row: 4, frames: 11 },
    jump:   { row: 5 },
    run:    { row: 6, frames: 6 },
    attack: { row: 7, frames: 5 },
    });
    pigSpi.changeAni('idle');
    allSprites.pixelPerfect = true;
    hitBoxPig.rotationLock = true; // Lock the rotation of the hitbox
    pigSpi.rotationLock = true; // Lock the rotation of the sprite
}

move() {
    // generate a smoothed velocity from Perlin noise
    const vx = map(noise(perlinTimeX), 0, 1, -MAX_SPEED, MAX_SPEED);
    const vy = map(noise(perlinTimeY*DELAY), 0, 15, -MAX_SPEED, MAX_SPEED);

    // apply it to position…
    hitBoxPig.position.x += vx;
    hitBoxPig.position.y += vy;

    perlinTimeX += perlinDeltaTime;
    perlinTimeY += perlinDeltaTime;
  }

  colliderAndhitBox() {
    pigSpi.collider = "NONE";
    // center the sprite on the hitbox
    pigSpi.position.x = hitBoxPig.position.x + (pigSpi.mirror.x ? 5 : -5);
    pigSpi.position.y = hitBoxPig.position.y - 9;
  }
  spid(){
    
  }

  handleAnimations() {

    if (hitBoxPig.vel.x > 0) {
      // moving right
      pigSpi.mirror.x = false;      // facing right
      pigSpi.changeAni('run');
    }
    if (hitBoxPig.vel.x < 0) {
      // moving left
      pigSpi.mirror.x = true;       // facing left
      pigSpi.changeAni('run');
    }
    if (hitBoxPig.vel.y < 0 && !this.isJumping) {
        // jumping
        this.isJumping = true;
        pigSpi.changeAni('jump');
    }
    if (hitBoxPig.vel.y > 0 && this.isJumping) {
      // falling
      pigSpi.changeAni('fall');
    }
    if (hitBoxPig.collides(walls)) {
      // nearly stationary
      this.isJumping = false;
      pigSpi.changeAni('idle');
    }
  }

  doAll() {
    this.handleAnimations();
    this.move();
    this.colliderAndhitBox();
    pigSpi.update();
    pigSpi.draw();
    pigSpi.scale = 1.7;
  }
}
