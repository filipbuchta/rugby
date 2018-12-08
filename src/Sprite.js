
export default class Sprite {

    constructor(spriteSheet) {
        this.spriteSheet = spriteSheet;
        this.direction = false;
    }


    update(delta) {
        if (this.currentAnimation == null) {
            return;
        }


        this.timer += delta;
        if (this.timer > 50) {
            this.timer = 0;

            this.frame++;
            if (this.frame >= this.currentAnimation.firstFrame + this.currentAnimation.frameCount) {
                if (this.currentAnimation.loop) {
                    this.frame = this.currentAnimation.firstFrame;
                } else {
                    this.frame = this.currentAnimation.firstFrame + this.currentAnimation.frameCount - 1;

                }
            }

        }



    }

    draw(ctx) {
        let animation = this.currentAnimation;

        let sourceX = ((this.frame % (this.spriteSheet.image.width / this.spriteSheet.frameSize.width)) | 0) * this.spriteSheet.frameSize.width;
        let sourceY = ((this.frame / (this.spriteSheet.image.width / this.spriteSheet.frameSize.width)) | 0) * this.spriteSheet.frameSize.height;

        if (this.direction) {
            ctx.save();
            //ctx.translate(this.spriteSheet.frameSize.width / 32, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(this.spriteSheet.image,
            sourceX, sourceY, this.spriteSheet.frameSize.width, this.spriteSheet.frameSize.height,
            - this.spriteSheet.frameSize.width / 2, - this.spriteSheet.frameSize.height, this.spriteSheet.frameSize.width, this.spriteSheet.frameSize.height);
        if (this.direction) {
            ctx.restore();
        }
    }

    playAnimation(name) {
        if (this.currentAnimation != this.spriteSheet.animations[name]) {
            this.timer = 0;
            this.currentAnimation = this.spriteSheet.animations[name];
            this.frame = this.currentAnimation.firstFrame;
        }
    }
}