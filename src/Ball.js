

export default class Ball {
    x;
    y;
    z;
    velocityX;
    velocityY;
    velocityZ;

    rotationSpeed;
    angle;

    player;

    sound;

    static ballWidth = 13;
    static ballHeight = 9;
    static ballDampening = 0.6;
    static HOLDING_HEIGHT = 10;


    throw(targetX, targetY, velocityZ, throwStrength) {
        let velocityX = targetX - this.x;
        let velocityY = targetY - this.y;

        let length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);


        this.velocityX = (velocityX / length) * throwStrength;
        this.velocityY = (velocityY / length) * throwStrength;
        this.velocityZ = (velocityZ) * throwStrength;

        this.rotationSpeed = 1 / 50;

        this.lastPlayer = this.player;
        this.player = null;

        this.sound.currentTime = 0;
        this.sound.play();

    }


    update(delta, fieldWidth, fieldHeight) {

        if (this.player != null) {
            this.x = this.player.x + (this.player.direction ? 5 : -5);
            this.z = Ball.HOLDING_HEIGHT;
            this.y = this.player.y;
            this.velocityX = this.player.velocityX;
            this.velocityY = this.player.velocityY;
            this.angle = Math.PI / 4 * (this.player.direction ? -1 : 1);
        }
        else {
            this.velocityZ -= 1 / 400 * delta; // gravity;

            this.x += this.velocityX * delta;
            this.y += this.velocityY * delta;
            this.z += this.velocityZ * delta;
            if (this.x < Ball.ballWidth) {
                this.x = Ball.ballWidth;
            }
            if (this.y < Ball.ballHeight) {
                this.y = Ball.ballHeight;
            }

            if (this.x > fieldWidth - Ball.ballWidth) {
                this.x = fieldWidth - Ball.ballWidth;
            }
            if (this.y > fieldHeight - Ball.ballHeight) {
                this.y = fieldHeight - Ball.ballHeight;
            }

            if (this.z < 0) {
                this.z = 0;


                this.velocityX *= Ball.ballDampening;
                this.velocityY *= Ball.ballDampening;
                this.velocityZ *= Ball.ballDampening;

                this.rotationSpeed *= Ball.ballDampening;

                this.velocityZ *= -1;

            }


            this.angle += this.rotationSpeed * delta;

        }
    }
}
