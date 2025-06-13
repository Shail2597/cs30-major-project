// class/PowerUp.js

class PowerUp {
  constructor(x = 0, y = 0) {
    // world position
    this.spawnX    = x;
    this.spawnY    = y;
    // p5.play Sprite
    this.hitBox    = null;  
    this.powerSpi  = null;
    this.collected = false;
    this.finished  = false;
  }

  /**
   * Mirror Pig.pre; pass in the same spriteSheet you loaded for Pig
   * @param {SpriteSheet} spriteSheet — the sheet from loadImage + new SpriteSheet
   */
  pre(spriteSheet) {
    // invisible hitBox for overlap
    this.hitBox = new Sprite(this.spawnX, this.spawnY, 18, 14);
    this.hitBox.collider = 'none';
    this.hitBox.visible  = false;

    // visible power-up sprite
    this.powerSpi = new Sprite(this.spawnX, this.spawnY, 18, 14);
    this.powerSpi.spriteSheet = spriteSheet;

    // two animations: idle (row 0, 8 frames), disappear (row 1, 2 frames)
    this.powerSpi.addAnis({
      idle:      { row: 0, frames: 8, frameDelay: 6 },
      disappear: { row: 1, frames: 2, frameDelay: 8 }
    });
    this.powerSpi.changeAni('idle');
    this.powerSpi.rotationLock = true;
    this.powerSpi.collider     = 'none';
    this.powerSpi.scale        = 2; // scale up for visibility
  }

  /**
   * Resets & places at world (x,y)
   */
  spawn(x, y) {
    this.spawnX    = x;
    this.spawnY    = y;
    this.hitBox.position.set(x, y);
    this.powerSpi.position.set(x, y);
    this.powerSpi.visible = true;
    this.collected        = false;
    this.finished         = false;
    this.powerSpi.changeAni('idle');
  }

  /**
   * Called every frame—mirrors Pig.doAll but much simpler:
   * - advance animation
   * - on overlap with player.spi → collect
   * - once disappear finishes → remove both sprites
   */
  update(player) {
    if (this.finished) {
      return;
    }

    // advance the disappear or idle animation
    this.powerSpi.update();

    // on first overlap
    if (!this.collected && this.hitBox.overlap(player.spi)) {
      this.collected = true;
      this.powerSpi.changeAni('disappear');

      // only add a life if the player has fewer than 3
      if (typeof player.lives === 'number' && player.lives < 3) {
        player.lives++;
      }
    }

    // when disappear reaches its last frame, clean up
    const ani = this.powerSpi.ani;
    if (this.collected && ani.frame >= ani.lastFrame) {
      this.finished = true;
      this.hitBox.remove();
      this.powerSpi.remove();
    }
  }


  /**
   * Draw the power-up sprite
   */
  draw() {
    if (!this.finished) {
      this.powerSpi.draw();
    }
  }

  /**
   * Convenience to destroy early if needed
   */
  destroy() {
    this.hitBox?.remove();
    this.powerSpi?.remove();
    this.finished = true;
  }
}

// Expose globally like Pig.js does
window.PowerUp = PowerUp;
