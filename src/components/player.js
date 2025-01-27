import { WALLS, PLAYER } from './util/constants';
import { overlap } from './util/overlap';

export default class Player {
    constructor(dimensions){
        this.dimensions = dimensions;
        this.playerPosY = dimensions.height/2;
        this.playerPosX = dimensions.width/8;
        this.angle = Math.log(this.playerPosY,this.playerPosX);
        this.movement = {wKey: false, aKey: false, sKey: false, dKey: false};
        this.kills = 0;
        this.gun = document.getElementById('pistol');
        this.hat = document.getElementById('hat');
        this.timeOfDamage = 0;
    }

    animate(ctx){
        this.move();
        this.collisionCheck();
        this.drawPlayer(ctx);
    }

    drawPlayer(ctx){
        const posX = this.playerPosX;
        const posY = this.playerPosY

        ctx.save();
        
        ctx.setTransform(1, 0, 0, 1, posX, posY);
        ctx.rotate(this.angle);
        
        //main body
        ctx.beginPath();
        ctx.arc(0, 0, PLAYER.PLAYER_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = "brown";
        ctx.fill();
        ctx.stroke();
        
        //weapon
        ctx.drawImage(this.gun, 5, - 3, 28, 19);

        //accessory
        ctx.drawImage(this.hat, -38, -42, 80, 55);
        
        ctx.restore();
    }

    loseLife(zombies, level){
        const player = this.playerBounds();
        for (let i = 0; i < zombies.length; i++) {
            const zombie = zombies[i].zombieBounds();
            const damageDelta = Date.now() - this.timeOfDamage > 1000;
            if (overlap(player, zombie).type !== null && damageDelta) {
                level.lives--;
                this.zombieAttackSound();
                this.timeOfDamage = Date.now();
                return;
            }
        }
    }

    zombieAttackSound() {
        const sound = document.getElementById('zomb-sound');
        sound.play();
    }

    playerBounds(){
        const midX = this.playerPosX;
        const midY = this.playerPosY;
        const radius = PLAYER.PLAYER_RADIUS;
        return {
            top: midY - radius, bottom: midY + radius,
            left: midX - radius, right: midX + radius 
        }
    }

    collisionCheck() {
        const pBound = this.playerBounds();

        WALLS.forEach(wall => {
            const wallRect = {};
            wallRect.left = wall.posX;
            wallRect.right = wall.posX + wall.width;
            wallRect.top = wall.posY;
            wallRect.bottom = wall.posY + wall.height;

            const radius = PLAYER.PLAYER_RADIUS;
            const collision = overlap(pBound, wallRect);

            switch (collision.type) {
                case "rightBot":
                    if (pBound.right > wallRect.left + 5) {
                        //Five is added to wallRect to adjust for animation time
                        this.playerPosY = collision.bot - radius;
                    } else {
                        this.playerPosX = collision.right - radius;
                    }
                    break;
                case "leftBot":
                    if (pBound.left < wallRect.right - 5) {
                        this.playerPosY = collision.bot - radius;
                    } else {
                        this.playerPosX = collision.left + radius;
                    }
                    break;
                case "rightTop":
                    if (pBound.right > wallRect.left + 5) {
                        this.playerPosY = collision.top + radius;
                    } else {
                        this.playerPosX = collision.right - radius;
                    }
                    break;
                case "leftTop":
                    if (pBound.left < wallRect.right - 5) {
                        this.playerPosY = collision.top + radius;
                    } else {
                        this.playerPosX = collision.left + radius;
                    }
                    break;
            }
        })
    }

    look(dir) {
        // This method takes in xy of mouse pos to return angle
        //x,y relative to players position
        let dy = dir.y - this.playerPosY;
        let dx = dir.x - this.playerPosX;
        this.angle = Math.atan2(dy, dx);
    }

    move(){
        let move = this.movement;
        const speed = PLAYER.PLAYER_SPEED;
        const radius = PLAYER.PLAYER_RADIUS;
        const height = this.dimensions.height;
        const width = this.dimensions.width;

        //boundary checks
        //non boolean checks
        const upBound = this.playerPosY - speed - radius;
        const lowBound = this.playerPosY + speed + radius;
        const leftBound = this.playerPosX - speed - radius;
        const rightBound = this.playerPosX + speed + radius;

        //boolean checks
        const upLeftBound = upBound + 0.5 * speed > 0 &&
                            leftBound - 0.5 * speed > 0;
        const upRightBound = upBound + 0.5 * speed > 0 &&
                            rightBound - 0.5 * speed < width;
        const lowLeftBound = lowBound - 0.5 * speed < height &&
                            leftBound - 0.5 * speed > 0;
        const lowRightBound = lowBound - 0.5 * speed < height &&
                            rightBound - 0.5 * speed < width;

        if (move["wKey"] && move["aKey"]) {
            if (upLeftBound) {
                this.playerPosX -= 0.5 * speed;
                this.playerPosY -= 0.5 * speed;
            }
        } else if (move["wKey"] && move["dKey"]) {
            if (upRightBound) {
                this.playerPosX += 0.5 * speed;
                this.playerPosY -= 0.5 * speed;
            }
        } else if (move["sKey"] && move["aKey"]) {
            if (lowLeftBound) {
                this.playerPosX -= 0.5 * speed;;
                this.playerPosY += 0.5 * speed;
            }
        } else if (move["sKey"] && move["dKey"]) {
            if (lowRightBound) {
                this.playerPosX += 0.5 * speed;
                this.playerPosY += 0.5 * speed;
            }
        } else if (move["wKey"]) {
            if (upBound > 0) this.playerPosY -= speed;
        } else if (move["sKey"]) {
            if (lowBound < height) this.playerPosY += speed;
        } else if (move["aKey"]) {
            if (leftBound > 0) this.playerPosX -= speed;
        } else if (move["dKey"]) {
            if (rightBound < width) this.playerPosX += speed;
        }
    }

}