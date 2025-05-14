let door;
class Door {
  constructor() {
    this.isOpen = false;
  }


  pre(x,y) {
    door = new Sprite();
    door.origin.x = 1;
    door.origin.y = 1;
    door.x = x;
    door.y = y;
  }
}