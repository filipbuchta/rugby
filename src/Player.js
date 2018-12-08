import {areNear} from "./math";

export default class Player {

    x;
    y;
    velocityX;
    velocityY;
    direction;
    sprite;
    team;
    gotoTarget;
    movementX;
    movementY;
    quote;
    quoteTime;

    speed;
    maxSpeed;

    static TACKLE_DISTANCE = 20;

    constructor() {
        this.velocityX = 0;
        this.velocityY = 0;
        this.movementX = 0;
        this.movementY = 0;

        this.speed = 1 / 750;
        this.maxSpeed = 0.14;
        this.gotoTarget = null;
    }

    goto(obj) {
        this.gotoTarget = obj;
    }

    update(delta, fieldWidth, fieldHeight) {



        if (this.gotoTarget != null) {
            this.movementX = this.x > this.gotoTarget.x ? -1 : 1;
            this.movementY = this.y > this.gotoTarget.y ? -1 : 1;

            if (areNear(this, this.gotoTarget, 8)) {
                this.movementX = 0;
                this.movementY = 0;

                this.gotoTarget = null;
            }
        }



        let acceleration = this.speed * delta;

        let damping = 0.6;
        if (this.movementX === 0) {
            this.velocityX *= damping;
        } else {
            this.velocityX += (this.movementX > 0 ? acceleration : -acceleration);
            this.velocityX = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.velocityX));
        }
        if (this.movementY === 0) {
            this.velocityY *= damping;
        } else {
            this.velocityY += (this.movementY > 0 ? acceleration : -acceleration);
            this.velocityY = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, this.velocityY));
        }

        if (this.velocityX < 0.001 && this.velocityX > -0.001) {
            this.velocityX = 0;
        }

        if (this.velocityY < 0.001 && this.velocityY > -0.001) {
            this.velocityY = 0;
        }

        this.x += this.velocityX * delta;
        this.y += this.velocityY * delta;




        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = 0;
        }

        if (this.x > fieldWidth) {
            this.x = fieldWidth;
        }
        if (this.y > fieldHeight) {
            this.y = fieldHeight;
        }

        //console.log(this.x, this.velocityX, this.y, this.velocityY);
        if (this.velocityX > 0) {
            this.direction = true;
        } else if (this.velocityX < 0) {
            this.direction = false;
        }

        if (this.velocityY > 0 || this.velocityY < 0 || this.velocityX > 0 || this.velocityX < 0) {
            this.sprite.playAnimation("run");
        } else {
            this.sprite.playAnimation("idle");
        }

        this.sprite.direction = this.direction;

        this.sprite.update(delta);

        if (this.quote != null) {

            this.quoteTime -= delta;

            if (this.quoteTime < 0) {
                this.quote = null;
            }
        }
    }

    setQuote(quote) {
        this.quote = quote;
        this.quoteTime = 5000;
    }

    draw(ctx) {
        this.sprite.draw(ctx);

        if (this.quote != null) {

            ctx.translate(-5 - this.quote.length, -32);
            ctx.font = "6px 'Press Start 2P'";
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText(this.quote,0,0);
            ctx.fillStyle = 'white';
            ctx.fillText(this.quote,0,0);

        }

    }
}
