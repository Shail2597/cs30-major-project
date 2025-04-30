class Pig {
    constructor(x,y){
        this.x = x;
        this.y=y;
        this.width=100;
        this.height=100;
        this.vel={x:0,y:0};
        this.mirrorX= 1, // 1 for normal, -1 for flipped
        this.currentAnimation= "idle",
        this.frameIndex= 0,
        this.frameDelay= 5, // Delay between frames
        this.idleSpriteSheet= loadImage("assets/king_human_idle.png"),
        this.runningSpriteSheet= loadImage("assets/king_human_run.png"),
        this.jumpSprite= loadImage("assets/king_human_jump.png"), // Single-frame jump sprite
        this.idleFrames= 11,
        this.runningFrames= 8,
        this.isJumping= false,
    }
}