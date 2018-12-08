import Sprite from "./Sprite";
import Camera from "./Camera";
import Ball from "./Ball";
import Player from "./Player";
import {distance, areNear, normalize} from "./math";

export const MAX_HEIGHT = 800;
export const winningArea = 40;


export default class Game {


    loadImage(assetName) {
        return new Promise((resolve, reject) => {
            var asset = new Image();
            asset.onerror = (ev) => {
                console.error("Unable to load image", assetName, ev);
                reject(ev.error);
            };
            asset.onload = (ev) => {
                this.assets[assetName] = asset;
                resolve(asset);
            };
            asset.src = "assets/" + assetName;
            if (asset.complete) {
                this.assets[assetName] = asset;
                resolve(asset);
            }
        });
    }

    loadJson(assetName) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open("GET", "assets/" + assetName, true);
            request.onerror = (ev) => {
                reject(new Error("JSON request failed: " + ev.message));
            };

            request.onreadystatechange = (ev) => {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        let asset;
                        try {
                            asset = JSON.parse(request.responseText);
                        } catch (e) {
                            if (e instanceof SyntaxError) {
                                reject(new Error("Invalid JSON content", e));
                            }

                            throw e;
                        }
                        this.assets[assetName] = asset;
                        resolve(asset);
                    } else if (request.status == 404) {
                        reject(new Error("JSON Asset not found"));
                    }
                }
            };
            request.send();
        });
    }

    constructor(canvas) {
        Game.keys = [];
        Game.lastKeys = [];

        this.selectedTeam = (Math.random() * 2) | 0;

        this.canvas = canvas;
        window.addEventListener('keydown', (event) => {
            if (!Game.keys[event.keyCode]) {
                Game.keys[event.keyCode] = true;
                ;
            }

        }, true);
        window.addEventListener('keyup', (event) => {

            if (Game.keys[event.keyCode]) {
                Game.keys[event.keyCode] = false;

            }
        }, true);

        this.context = this.canvas.getContext('2d');

        this.assets = {};
        this.assets["song.mp3"] = new Audio("assets/song.mp3");
        this.assets["song.mp3"].volume = 0.75;
        this.assets["blob.mp3"] = new Audio("assets/blob.mp3");
        this.assets["win.mp3"] = new Audio("assets/win.mp3");


        Promise.all([
            this.loadImage("lawyer.png"),
            this.loadImage("ball.png"),
            this.loadImage("doctor.png"),
            this.loadImage("field.png"),
            this.loadJson("playerSprite.json")
        ]).then(() => this.onAssetsLoaded());
    }


    onAssetsLoaded() {
        setInterval(
            () => {
                let sound = this.assets["song.mp3"];
                if (sound.currentTime === 0) {
                    sound.play();
                }
            }, 1000);

        this.assets["doctorSprite.json"] = JSON.parse(JSON.stringify(this.assets["playerSprite.json"]));

        this.assets["playerSprite.json"].image = this.assets["lawyer.png"];
        this.assets["doctorSprite.json"].image = this.assets["doctor.png"];


        this.score = [0, 0];

        this.startLevel();


        this.delta = 0;
        this.tick = this.tick.bind(this);
        requestAnimationFrame(this.tick);

    }

    startLevel() {
        this.gameEnd = false;

        this.players = [];
        for (let team = 0; team < 2; team++) {
            for (let playerNum = 0; playerNum < 3; playerNum++) {
                let player = new Player();
                player.index = this.players.length;
                player.sprite = new Sprite(this.assets[team === 0 ? "playerSprite.json" : "doctorSprite.json"]);
                player.team = team;
                player.x = 130 + (team) * 250 + ((team === 0 ? -1 : 1) * (playerNum % 2) * 30);
                // player.x = 250 + (team) * 5 + ((team === 0 ? 1 : -1) * (playerNum % 2) * 30);
                player.y = 60 + (playerNum + 1) * 40;
                // player.y = 100 + (playerNum + 1) * 40;
                player.direction = (team === 0);
                if (playerNum === 1) {
                    player.role = "defender";
                } else {
                    player.role = "attacker";
                }
                this.players.push(player);
            }
        }
        this.ball = new Ball();
        this.ball.sound = this.assets["blob.mp3"];
        this.ball.x = this.assets["field.png"].width / 2;
        this.ball.y = this.assets["field.png"].height / 2;
        // this.ballZ = MAX_HEIGHT - 40;
        this.ball.z = 0;
        this.ball.velocityX = 0;
        this.ball.velocityY = 0;
        this.ball.velocityZ = 0;
        this.ball.rotationSpeed = 0;
        this.ball.angle = 0;

        this.selectedPlayer = this.players[(this.selectedTeam * (this.players.length / 2) + (Math.random() * this.players.length / 2)) | 0];
        this.selectedPlayer.maxSpeed *= 1.2;
        Game.camera = new Camera();


        this.timer = 0;


        if (!window["debug"]) {
            if (this.score[0] > 2 || this.score[1] > 2) {

                for (let player of this.players) {
                    player.team = this.selectedPlayer.team;
                    player.role = "ending";
                }

                this.selectedPlayer = null;

            }
        }



        Game.keys = [];
    }

    tick(now) {
        requestAnimationFrame(this.tick);
        if (this.lastTick == null) {
            this.lastTick = now;
        }
        let timestep = 1000 / 60;

        this.delta += now - this.lastTick;
        this.lastTick = now;

        while (this.delta >= timestep) {
            this.update(timestep);
            this.delta -= timestep;
        }
        this.draw();
    }

    update(delta) {

        delta *= 1 / 2;


        // update players
        let fieldWidth = this.assets["field.png"].width;
        let fieldHeight = this.assets["field.png"].height;


        if (this.selectedPlayer != null) {
            if (Game.keys[32]) {
                if (this.ball.player === this.selectedPlayer) {

                    if ((this.selectedPlayer.direction && this.selectedPlayer.team === 0) || (!this.selectedPlayer.direction && this.selectedPlayer.team === 1)) {
                        this.kick();
                    } else {


                            this.passTo(this.selectedPlayer)


                    }
                }
            }


            if (Game.keys[39]) {
                this.selectedPlayer.movementX = 1;
            } else if (Game.keys[37]) {
                this.selectedPlayer.movementX = -1;
            } else {
                this.selectedPlayer.movementX = 0;
            }

            if (Game.keys[40]) {
                this.selectedPlayer.movementY = 1;
            } else if (Game.keys[38]) {
                this.selectedPlayer.movementY = -1;
            } else {
                this.selectedPlayer.movementY = 0;
            }
        }

        for (let player of this.players) {
;
            if (player === this.selectedPlayer) {

            } else { // AI
                // player.velocityX = Math.random();
                if (player.role === "ending") {

                    this.players.sort((a, b) => a.index - b.index);

                    for (let i = 0; i < this.players.length; i++) {
                        this.players[i].gotoTarget = {x: i * (fieldWidth / 6) + 32, y: fieldHeight / 2};
                    }

                    this.players[0].setQuote("Pujdes");
                    this.players[1].setQuote("se");
                    this.players[2].setQuote("mnou");
                    this.players[3].setQuote("na");
                    this.players[4].setQuote("veceri");
                    this.players[5].setQuote("?");

                } else if (player.role === "attacker") {
                    if (player === this.ball.player) { // if i have the ball
                        player.goto({x: player.team === 0 ? fieldWidth : 0, y: player.y + (Math.random() * 32) - 16}); // run to goal

                        if (Math.random() > 0.9995) {
                            player.direction = player.team === 1;
                            this.passTo(player)
                        }

                    } else if (this.ball.player != null) { // if someone else has the ball

                        if (this.ball.player.team === player.team) { // is it someone from my team?

                        } else { // is it someone from different teamteam?
                            player.goto(this.ball.player); //
                        }

                    } else { // no one has the ball
                        player.goto(this.ball);
                    }

                } else if (player.role === "defender") {

                    // i have a ball
                    if (player === this.ball.player) {
                        if ((player.team === 0 && player.x > fieldWidth / 2 - 32) || (player.team === 1 && player.x < fieldWidth / 2 + 32)) { // at the end of our field

                            player.direction = player.team === 0;
                            this.kick(); // kick ball
                        } else {
                            player.goto({x: fieldWidth / 2, y: fieldHeight / 2}); // run to the middle
                        }
                    } else {


                        const prediction = 1000;
                        // console.log(this.ballVelocityY);

                        player.goto({
                            x: player.team === 0 ? (winningArea + 45) : (fieldWidth - winningArea - 45),
                            y: this.ball.y + this.ball.velocityY * prediction
                        });

                        if ((player.team === 0 && this.ball.x < fieldWidth / 2) || (player.team === 1 && this.ball.x > fieldWidth / 2)) { // is the ball on our field?

                            if (this.ball.player == null) { // no one has the ball
                                // if i am nearest to ball, run to the ball, else run to the base

                                let myTeam = this.players.filter(p => p.team === player.team);
                                myTeam.sort((a, b) => distance(this.ball, a) - distance(this.ball, b));
                                if (myTeam[0] === player) {
                                    player.goto(this.ball);
                                }
                            } else if (this.ball.player.team !== player.team) { // enemy has the ball
                                player.goto(this.ball.player);

                            }
                        }
                    }
                }

            }


            player.update(delta, fieldWidth, fieldHeight);


            //   Game.camera.x = -player.x + this.canvas.clientWidth / 2 + player.spriteSheet.frameSize.width / 2;
            // Game.camera.y = 0;

//        Game.camera.x = Game.camera.x.clamp(-(this.map.map.width * 32 - this.canvas.clientWidth), 0);


        }

        // resolve player collisions
        for (let i = 0; i < this.players.length; i++) {
            for (let j = i + 1; j < this.players.length; j++) {

                if (this.players[i].team !== this.players[j].team && areNear(this.players[i], this.players[j], Player.TACKLE_DISTANCE)) {
                    this.tackle(this.players[i], this.players[j]);
                }
            }
        }


        // ball collision
        if (this.ball.player == null) {
            for (let player of this.players) {
                if (player.x > this.ball.x - Ball.ballWidth && player.x < this.ball.x + Ball.ballWidth &&
                    player.y > this.ball.y - Ball.ballHeight && player.y < this.ball.y + Ball.ballHeight &&
                    this.ball.x > winningArea && this.ball.x < fieldWidth - winningArea &&
                    this.ball.z < Ball.HOLDING_HEIGHT) {

                    this.ball.player = player;
                    break;
                }
            }
        }

        if (!this.gameEnd) {
            if (((this.ball.x < winningArea) || (this.ball.x > fieldWidth - winningArea))) {

                if (this.ball.player == null) {

                    this.ball.lastPlayer.setQuote("Faul");
                }
                else if ((this.ball.x < winningArea && this.ball.player.team === 0) || ((this.ball.x > fieldWidth - winningArea) && this.ball.player.team ===1)) {
                    this.ball.player.setQuote("Faul");
                } else {

                    for (let player of this.players.filter(p => p.team === this.ball.player.team)) {
                        const winQuotes = ["Hooray!", "Yes!", "Yeah!!"];

                        player.setQuote(winQuotes[(Math.random() * winQuotes.length) | 0]);

                    }

                    this.playSound("win.mp3");
                    this.score[this.ball.player.team]++;
                    this.winnersThrow();
                }

                setTimeout(() => this.startLevel(), 3000);


                this.gameEnd = true;
            }
        }


        // update ball
        this.ball.update(delta, fieldWidth, fieldHeight);

        this.players.sort((a, b) => a.y - b.y);


        Game.lastKeys = Game.keys.slice();
    }


    tackle(p1, p2) {
        const tackleStrength = 1.0;
        let dir = {x: p1.x - p2.x, y: p1.y - p2.y};
        dir = normalize(dir);
        dir.x *= tackleStrength * Math.random() * 2;
        dir.y *= tackleStrength * Math.random() * 2;
        p1.velocityX = dir.x;
        p1.velocityY = dir.y;
        p2.velocityX = dir.x * -1;
        p2.velocityY = dir.y * -1;


        if (this.ball.player === p1 || this.ball.player === p2) {

            if (Math.random() > 0.1) {
                const tauntQuotes = ["Hey!", "!!!", "Ugh!"];

                if (Math.random() > 0.8) {
                    this.ball.player.setQuote(tauntQuotes[(Math.random() * tauntQuotes.length) | 0]);
                }

                this.tackleDrop();
            }
        }
    }


    passTo(fromPlayer) {
        let toPlayer = this.players
            .filter((p) => fromPlayer.team === p.team && ((fromPlayer.team === 0 && p.x < fromPlayer.x) || (fromPlayer.team === 1 && p.x > fromPlayer.x)))
            .sort((p) => fromPlayer.team === 1 ? p.x - fromPlayer.x : fromPlayer.x - p.x)[0];

        if (toPlayer != null) {

            this.ball.throw(toPlayer.x, toPlayer.y, 1, 0.3);
        }
    }

    tackleDrop() {
        this.ball.throw(this.ball.x + 0.00001 * (Math.random() * 2 - 1), this.ball.y + 0.00001 * (Math.random() * 2 - 1), 1, 0.2);
    }

    kick() {
        this.ball.throw(this.ball.x + 2 * (this.ball.player.team === 0 ? 1 : -1), this.ball.y + (Math.random() * 2 - 1), 2, 0.25);
    }

    winnersThrow() {
        this.ball.throw(this.ball.x + 1 * (this.ball.player.team === 0 ? 1 : -1), this.ball.y, -2, 0.2);
    }

    draw() {
        let ctx = this.context;
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);


        // ctx.setTransform(1, 0, 0, 1, Game.camera.x, Game.camera.y);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.save();
        ctx.translate(0, 100); // shift ui


        ctx.drawImage(this.assets["field.png"], 0, 0);


        for (let player of this.players) {
            ctx.save();
            ctx.translate(player.x | 0, player.y | 0);


            if (this.selectedPlayer === player) {
                ctx.strokeStyle = "#CC4444";
                ctx.beginPath();
                ctx.ellipse(0, -1, 12, 4, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }

            player.draw(ctx);


            ctx.restore();
        }


        // draw ball
        ctx.save();

        ctx.translate(this.ball.x | 0, (this.ball.y | 0));


        let size = (MAX_HEIGHT - this.ball.z) / MAX_HEIGHT;

        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.ellipse(0, 0, 5 * size, 2 * size, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.translate(0, -2)


        ctx.translate(0, -(this.ball.z | 0));

        ctx.rotate(this.ball.angle);
        ctx.translate(-this.assets["ball.png"].width / 2, -this.assets["ball.png"].width / 2)
        ctx.drawImage(this.assets["ball.png"], 0, 0);


        ctx.restore();




        // draw ui
        ctx.restore();


        ctx.save();
        ctx.strokeStyle = "white";
        ctx.fillStyle = "white";
        ctx.font = "24px 'Press Start 2P'";

        ctx.fillText("LAWYERS vs DOCTORS", 60, 50);

        ctx.fillText(this.score[0], 130, 90);
        ctx.fillText(this.score[1], this.canvas.width - 140, 90);

        ctx.restore();

    }


    playSound(soundName) {

        let sound = this.assets[soundName];
        sound.currentTime = 0;
        sound.play();
    }
}
