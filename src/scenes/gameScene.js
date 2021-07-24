import Phaser from 'phaser'
import { CST } from "../CST";
import { GAMEVARS } from "../GAMEVARS"

export class gameScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.GAME
        })
    }

    level = "default";

    init(data) {
        GAMEVARS.tempPlayers = data[0];
        this.level = data[1];
    }

    create() {

        // Speed limit
        var speedLimit = 2000;
        var knockback = 70;
        var maxHealth = 1;

        GAMEVARS.playersGroup = this.physics.add.group();
        GAMEVARS.platforms = this.physics.add.staticGroup();
        GAMEVARS.belts = this.physics.add.staticGroup();
        GAMEVARS.jumppads = this.physics.add.group();
        GAMEVARS.bombs = this.physics.add.group({ maxSize: 20 }); // max 20 bombs at the same time in screen
        
        // Moving platform animations
        this.anims.create({
            key: 'belt_run',
            frames: this.anims.generateFrameNumbers('belt', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        if (this.level == "factory") {
            this.add.image(400, 350, 'factory_bg').setScale(4);
            GAMEVARS.belts.create(50, 200, 'belt').anims.play('belt_run');;
            GAMEVARS.platforms.create(800, 500, 'pipe');
            GAMEVARS.platforms.create(60, 500, 'pipe');
            GAMEVARS.belts.create(800, 600, 'belt').anims.play('belt_run');
            GAMEVARS.platforms.create(400, 300, 'pipe');

            GAMEVARS.jumppads.create(740, 400, 'jumppad').setScale(4);
        } else if (this.level == "city") {
            this.add.image(400, 200, 'city_bg');
            GAMEVARS.platforms.create(600, 400, 'stone');
            GAMEVARS.platforms.create(50, 250, 'stone');
            GAMEVARS.platforms.create(750, 220, 'stone');
            GAMEVARS.jumppads.create(430, 200, 'jumppad').setScale(4);
        } else if (this.level == "forest") {
            this.add.image(400, 260, 'forest_bg').setScale(3);
            GAMEVARS.platforms.create(50, 500, 'log');
            GAMEVARS.platforms.create(-50, 150, 'log'); // .setRotation(10)
            GAMEVARS.platforms.create(600, 300, 'log'); // .setRotation(-85)
            GAMEVARS.platforms.create(900, 100, 'log');
            GAMEVARS.jumppads.create(170, 400, 'jumppad').setScale(4);
        } else {
            this.add.image(400, 300, 'bg');
            GAMEVARS.platforms.create(600, 400, 'ground');
            GAMEVARS.platforms.create(50, 250, 'ground');
            GAMEVARS.platforms.create(750, 220, 'ground');
        }
        
        this.physics.add.collider(GAMEVARS.platforms, GAMEVARS.jumppads);
        this.physics.add.overlap(GAMEVARS.platforms, GAMEVARS.bombs, (platform, bomb) => {

            // this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Sound
            this.sound.play('explosion');

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();
            
        }, null, this);
        this.physics.add.collider(GAMEVARS.playersGroup, GAMEVARS.platforms);
        this.physics.add.collider(GAMEVARS.playersGroup, GAMEVARS.belts, (player) => {
            GAMEVARS.players[player.name].x += GAMEVARS.playerSpeed * .01;

        });
        this.physics.add.collider(GAMEVARS.playersGroup, GAMEVARS.playersGroup);
        this.physics.add.overlap(GAMEVARS.playersGroup, GAMEVARS.jumppads, (player) => {

            // Play sound
            this.sound.play('jump');

            GAMEVARS.players[player.name].setVelocityY(-GAMEVARS.jumpSpeed * 1.5);

        }, null, this);
        this.physics.add.overlap(GAMEVARS.playersGroup, GAMEVARS.bombs, (player, bomb) => {

            if (GAMEVARS.deadPlayers[player.name] === true) return;

            this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Knockback
            if (bomb.x > player.x) {
                player.x = player.x - knockback;
            } else if (bomb.x < player.x) {
                player.x = player.x + knockback;
            }

            // Play sound
            this.sound.play('explosion');

            // Damage player
            GAMEVARS.playerHealth[player.name] -= 1;

            if(player.name == 0) color = 0x507ECE
            else if(player.name == 1) color = 0xD53F2B
            else if(player.name == 2) color = 0x3E9F49
            else if(player.name == 3) color = 0x9000FF

            // Redraw background
            this.add.graphics().fillStyle(CST.UI.CARDCOLOR, 1.0).fillRect((player.name + 1) * 20 + player.name * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4-20), 20);

            // Redraw health
            this.add.graphics().fillStyle(color, 1.0).fillRect((player.name + 1) * 20 + player.name * (this.game.renderer.width / 4 - 30 ), 10, (this.game.renderer.width / 4 -20) * (0.1 * GAMEVARS.playerHealth[player.name]), 20);

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();

        }, null, this);

        // Add health bars at the top of the screen
        for (var i = 0; i < GAMEVARS.tempPlayers.length; i++) {
            GAMEVARS.players[i] = GAMEVARS.playersGroup.create(Phaser.Math.Between(200, 600), Phaser.Math.Between(100, 500), GAMEVARS.tempPlayers[i]+(i+1)).setBounce(0.2).setScale(1.4);

            GAMEVARS.playerSkins[i] = GAMEVARS.tempPlayers[i];
        
            GAMEVARS.players[i].body.maxSpeed = speedLimit;
            GAMEVARS.players[i].name = i;

            GAMEVARS.playerHealth[i] = maxHealth; // 10

            var color = CST.UI.CARDCOLOR;
            var offset = 2;

            if(i == 0) color = 0x507ECE
            else if(i == 1) color = 0xD53F2B
            else if(i == 2) color = 0x3E9F49
            else if (i == 3) color = 0x9000FF
            
            // Dropshadow
            this.add.graphics().fillStyle(0x000000, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, 10 + offset, (this.game.renderer.width / 4-20), 20);
 
            // Background (empty part)
            this.add.graphics().fillStyle(CST.UI.CARDCOLOR, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4-20), 20);

            // Health itself
            this.add.graphics().fillStyle(color, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4 - 20) * (0.1 * GAMEVARS.playerHealth[i]), 20);

        }
        

        // Player animations

        for (var x = 1; x < 5; x++) {

            let skins = CST.SKINS;

            for (var skin = 0; skin < skins.length; skin++) {
                this.anims.create({
                    key: skins[skin]+'_shoot'+x,
                    frames: this.anims.generateFrameNumbers(skins[skin]+x, { start: 3, end: 4 }),
                    frameRate: 10
                });
        
                this.anims.create({
                    key: skins[skin]+'_idle'+x,
                    frames: this.anims.generateFrameNumbers(skins[skin]+x, { start: 0, end: 1 }),
                    frameRate: 20
                });
        
                this.anims.create({
                    key: skins[skin]+'_dead'+x,
                    frames: [ { key: skins[skin]+x, frame: 5 } ],
                    frameRate: 20
                });
        
                this.anims.create({
                    key: skins[skin]+'_ride'+x,
                    frames: [ { key: skins[skin]+x, frame: 0 }, { key: skins[skin]+x, frame:  2 } ],
                    frameRate: 10
                });
            }
        }
        
    }

    update() {

        // If the bullets goes out of the screen,
        // delete it
        GAMEVARS.bombs.children.each(function(b) {
            if (b.active) {
                if (b.y < 0) {
                    b.destroy();
                }
                else if (b.x < 0) {
                    b.destroy();
                }

                if (b.y > this.game.renderer.height) {
                    b.destroy();
                }
                else if (b.x > this.game.renderer.width) {
                    b.destroy();
                }
            }
        }.bind(this));

        // Get all gamepads as array
        var pads = this.input.gamepad.gamepads;

        // If the players or pads aren't known, return
        // to prevent crashes
        if (!GAMEVARS.players || !pads) return;

        for (var i = 0; i < pads.length; i++) {

            // Get pad and current player
            var gamepad = pads[i];
            var tank = i + 1;

            // If player isnt loaded yet, continue
            if (!gamepad || !GAMEVARS.players[i]) continue;   

            // When player1 presses the back button,
            // end game
            if (gamepad.buttons[8].value === 1) { //&& i === 0
                console.log("Got exit signal from player " + 1 + ".");

                this.sound.play('btn_back');

                this.scene.stop(CST.SCENES.GAME);

                GAMEVARS.players = [];
                GAMEVARS.deadPlayers = [];
                GAMEVARS.platforms = "";
                GAMEVARS.cursors = "";
                GAMEVARS.playerHealth = [];
                GAMEVARS.deadPlayers = [];
                GAMEVARS.deadPlayerCount = [];


                this.cameras.main.fadeOut(CST.UI.FADEDURATION, 0, 0, 0)

                this.scene.start(CST.SCENES.MENU, [false, null]);

                return;
            }
            
            // If the players health is equal ar lower than 0,
            // add him to the dead players list
            if (GAMEVARS.playerHealth[i] <= 0) GAMEVARS.deadPlayers[i] = true;

            // If the player is dead, change sprite and continue
            if (GAMEVARS.deadPlayers[i] === true) {
                GAMEVARS.players[i].setVelocityX(0);
                GAMEVARS.players[i].body.pushable = false;
                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_dead' + tank, true);
                continue;
            }

            // Control player using d-pad
            if (gamepad.left) {
                GAMEVARS.players[i].setVelocityX(-GAMEVARS.playerSpeed);
                
                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_ride' + tank, true);
                GAMEVARS.players[i].setFlipX(true);
            }
            else if (gamepad.right) {
                GAMEVARS.players[i].setVelocityX(GAMEVARS.playerSpeed);

                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_ride' + tank, true);
                GAMEVARS.players[i].setFlipX(false);
            }
            else {
                GAMEVARS.players[i].setVelocityX(0);

                if (gamepad.axes.length && gamepad.axes[0].getValue() === 0 && gamepad.buttons[7].value < 0.7) GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_idle' + tank, true);
                else if(!gamepad.axes.length && gamepad.buttons[7].value < 0.7) GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_idle' + tank, true);
            }

            if (gamepad.up && GAMEVARS.players[i].body.touching.down) {
                // GAMEVARS.players[i].setVelocityY(-GAMEVARS.jumpSpeed);
                GAMEVARS.players[i].body.velocity.y += -GAMEVARS.jumpSpeed;
            }

            // Control player using analog stick
            // Movement only
            if (gamepad.axes.length >= 2)
            {
                var axisH = gamepad.axes[0].getValue();
                var axisV = gamepad.axes[1].getValue();

                if (axisH !== 0) {
                    GAMEVARS.players[i].setVelocityX(axisH * GAMEVARS.playerSpeed);
                    GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_ride' + tank, true);
                }

                // if (-axisH > 0) GAMEVARS.players[i].setFlipX(true);
                // if (-axisH < 0) GAMEVARS.players[i].setFlipX(false);

                // if(axisV < 0 && GAMEVARS.players[i].body.touching.down) GAMEVARS.players[i].setVelocityY(axisV * jumpSpeed);`
                if (axisV < -0.5 && GAMEVARS.players[i].body.touching.down) GAMEVARS.players[i].body.velocity.y += -GAMEVARS.jumpSpeed;
            }

            // Control player using analog stick
            // Aim only
            if (gamepad.axes.length >= 3)
            {
                var axisH = gamepad.axes[2].getValue();
                var axisV = gamepad.axes[3].getValue();

                // console.log(axisH);

                if (axisH > 0.8) GAMEVARS.players[i].setFlipX(false);
                if (axisH < -0.8) GAMEVARS.players[i].setFlipX(true);
            }

            // Firetimer is a cooldown for
            // shooting bombs
            GAMEVARS.fireTimer[i]++;
            
            // If the player presses A (Xbox controller), shoot ball
            if (gamepad.buttons[7].value > 0.7) {   
                
                if (GAMEVARS.fireTimer[i] < 20) continue;

                GAMEVARS.fireTimer[i] = 0;

                if (GAMEVARS.players[i].flipX == true) {
                    // var bomb = GAMEVARS.bombs.create(GAMEVARS.players[i].x - 45, GAMEVARS.players[i].y - 5, 'bomb');

                    var bomb = GAMEVARS.bombs.create(GAMEVARS.players[i].x - 45, GAMEVARS.players[i].y - 5, 'bomb');
                    // var bomb = GAMEVARS.bombs.get(GAMEVARS.players[i].x - 45, GAMEVARS.players[i].y - 5);

                    if (!bomb) return;

                    bomb.setActive(true);
                    bomb.setVisible(true);
                    bomb.setVelocityX(-10 * GAMEVARS.playerSpeed);
                    bomb.setVelocityY(Phaser.Math.Between(200, -200));
                    bomb.setBounce(1);
                    bomb.setScale(2);
                    // bomb.setCollideWorldBounds(true);
                }
                else {
                    var bomb = GAMEVARS.bombs.create(GAMEVARS.players[i].x + 45, GAMEVARS.players[i].y - 5, 'bomb');

                    if (!bomb) return;

                    bomb.setVelocityX(10 * GAMEVARS.playerSpeed);
                    bomb.setVelocityY(Phaser.Math.Between(200, -200));
                    bomb.setBounce(1);
                    bomb.setScale(2);
                    // bomb.setCollideWorldBounds(true);
                }

                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_shoot' + tank, true);
                this.sound.play('shoot');
            } 
        }

        // Screenwrapping
        this.physics.world.wrap(GAMEVARS.playersGroup, 10);     //32 padding

        // Reset count to recount
        GAMEVARS.deadPlayerCount = 0;

        // Count dead players
        for (var i = 0; i <= GAMEVARS.deadPlayers.length; i++) {
            if (GAMEVARS.deadPlayers[i] === true) GAMEVARS.deadPlayerCount += 1;
        }

        if (GAMEVARS.deadPlayerCount == GAMEVARS.players.length - 1 && GAMEVARS.deadPlayerCount !== 0) {
            console.log("Only one player is still alive. Searching for winner.");

            for (var i = 0; i <= GAMEVARS.deadPlayers.length; i++) {
                if (GAMEVARS.deadPlayers[i] !== true) {
                    console.log("Found winner.");

                    var skin = GAMEVARS.playerSkins[i] + "_idle" + (i + 1);
                    
                    console.log(skin)

                    this.scene.stop(CST.SCENES.GAME);

                    GAMEVARS.players = [];
                    GAMEVARS.deadPlayers = [];
                    GAMEVARS.platforms = "";
                    GAMEVARS.cursors = "";
                    GAMEVARS.playerHealth = [];
                    GAMEVARS.deadPlayers = [];
                    GAMEVARS.deadPlayerCount = 0;

                    this.scene.start(CST.SCENES.MENU, [true, i+1, skin, GAMEVARS.playerSkins]);
                }
            }
        }

    }

}