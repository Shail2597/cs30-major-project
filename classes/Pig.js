let pigSpi;

class Pig {
    constructor(){
        this.isJumping= false;
    }

    pre() {
    pigSpi = new Sprite((windowWidth/2)+windowWidth/4, windowHeight / 2, 34, 28);
    pigSpi.spriteSheet = 'assets/pig.png';

    pigSpi.addAnis({
        death: {row: 0, frames: 4},
        fall: {row: 1},
        ground: {row: 2},
        hit: {row: 3},
        idle: {row: 4, frames: 11},
        jump: {row: 5},
        run: {row: 6, frames: 6},
        attack: {row: 7, frames: 5},
    });

    pigSpi.changeAni('idle');
    pigSpi.anis.offSet.y = 7.5;
    allSprite.pixelPerfect = false;
    }

    spid() {
        floor1 = new Sprite();
        floor1.y = 433;
        floor1.w = 870;
        floor1.h = 1;
        floor1.collider = STATIC;
    }

    doAll(){
        pigSpi.update();
        pigSpi.draw();
        pigSpi.scale = 2;
    }
}