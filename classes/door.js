let door;
class Door {
  constructor() {
    this.isOpen = false;
  }


  pre() {
    door = new Sprite();
    door.w = 46;
    door.h = 56;
    door.spriteSheet = 'assets/door.png';
    door.addAnis({
      idle: {row: 0},
      open: { row: 1, frames: 5, frameDelay: 6 },
      close: { row: 2, frames: 4, frameDelay: 6 },
    });
    door.changeAni('idle');

  }
  show(x,y){
    door.x = x;
    door.y = y;
    door.collider = STATIC;
    door.offset.x = -46;
    door.offset.y = -56;
    door.scale = 2.5;
  }
}