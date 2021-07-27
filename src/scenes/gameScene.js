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
    teamdex = [];
    teamsEnabled = false;

    init(data) {

        // Get skins (+joinedPlayers) and level
        // from playerSelectScene
        GAMEVARS.tempPlayers = data[0];
        this.level = data[1];

        // Custom settings
        // (for Freeplay Mode)
        if(data[2] && data[2] !== null) {
            let tempVars = data[2];
            GAMEVARS.maxHealth = tempVars[0];
            GAMEVARS.playerSpeed = tempVars[1];
            GAMEVARS.speedLimit = tempVars[2];
            GAMEVARS.knockback = tempVars[3];
            GAMEVARS.jumpSpeed = tempVars[4];
            GAMEVARS.cooldown = tempVars[5];
            GAMEVARS.invulnerable = tempVars[6];
        }

        // Teams for Teams Mode 
        if(data[3]) {
            this.teamdex = data[4];
            this.teamsEnabled = true;
        } else {
            this.teamsEnabled = false;
        }
    }

    playerCount = 0;

    create() {

        // Create groups for collisions and overlap stuff
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

        // Depending on the level, platforms (+jumppads and belts)
        // will spawn in different locations
        if (this.level == "factory") {
            this.add.image(400, 350, 'factory_bg').setScale(4);
            GAMEVARS.belts.create(50, 200, 'belt').anims.play('belt_run');
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
        } else { // Debug level as fallback
            this.add.image(400, 300, 'bg');
            GAMEVARS.platforms.create(600, 400, 'ground');
            GAMEVARS.platforms.create(50, 250, 'ground');
            GAMEVARS.platforms.create(750, 220, 'ground');
        }
        
        // @ts-ignore
        this.physics.add.collider(GAMEVARS.platforms, GAMEVARS.jumppads);
        // @ts-ignore
        this.physics.add.overlap(GAMEVARS.platforms, GAMEVARS.bombs, (platform, bomb) => {

            // Camera shake (disabled)
            // this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Sound
            this.sound.play('explosion');

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();
            
        }, null, this);
        // @ts-ignore
        this.physics.add.overlap(GAMEVARS.belts, GAMEVARS.bombs, (platform, bomb) => {

            // Camera shake (disabled)
            // this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Sound
            this.sound.play('explosion');

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();
            
        }, null, this);
        // @ts-ignore
        this.physics.add.collider(GAMEVARS.playersGroup, GAMEVARS.platforms);
        // @ts-ignore
        this.physics.add.collider(GAMEVARS.playersGroup, GAMEVARS.belts, (player) => {
            GAMEVARS.players[player.name].x += GAMEVARS.playerSpeed * .01;

        });
        // @ts-ignore
        this.physics.add.collider(GAMEVARS.playersGroup, GAMEVARS.playersGroup);
        // @ts-ignore
        this.physics.add.overlap(GAMEVARS.playersGroup, GAMEVARS.jumppads, (player) => {

            // Play sound
            this.sound.play('jump');

            GAMEVARS.players[player.name].setVelocityY(-GAMEVARS.jumpSpeed * 1.5);

        }, null, this);
        // @ts-ignore
        this.physics.add.overlap(GAMEVARS.playersGroup, GAMEVARS.bombs, (player, bomb) => {

            if (GAMEVARS.deadPlayers[player.name] === true) return;

            this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Knockback
            // @ts-ignore
            if (bomb.x > player.x) {
                // @ts-ignore
                player.x = player.x - GAMEVARS.knockback;
                // @ts-ignore
            } else if (bomb.x < player.x) {
                // @ts-ignore
                player.x = player.x + GAMEVARS.knockback;
            }

            // Play sound
            this.sound.play('explosion');

            // Damage player
            if(!GAMEVARS.invulnerable) GAMEVARS.playerHealth[player.name] -= 1;

            // Color the healthbar
            // @ts-ignore
            if(player.name == 0) color = CST.UI.COLORS.PLAYER1
            // @ts-ignore
            else if(player.name == 1) color = CST.UI.COLORS.PLAYER2
            // @ts-ignore
            else if(player.name == 2) color = CST.UI.COLORS.PLAYER3
            // @ts-ignore
            else if(player.name == 3) color = CST.UI.COLORS.PLAYER4

            // Redraw background
            // @ts-ignore
            this.add.graphics().fillStyle(CST.UI.CARDCOLOR, 1.0).fillRect((player.name + 1) * 20 + player.name * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4-20), 20);

            // Redraw health
            // @ts-ignore
            this.add.graphics().fillStyle(color, 1.0).fillRect((player.name + 1) * 20 + player.name * (this.game.renderer.width / 4 - 30 ), 10, (this.game.renderer.width / 4 -20) * (GAMEVARS.playerHealth[player.name] / GAMEVARS.maxHealth), 20);

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();

        }, null, this);

        // Add health bars at the top of the screen
        for (var i = 0; i < GAMEVARS.tempPlayers.length; i++) {

            // If the player didnt join, continue to the next one
            if(GAMEVARS.tempPlayers[i] === null || GAMEVARS.tempPlayers[i] === undefined) continue;

            this.playerCount += 1;
            
            // Create player at random location with scale 1.4 and bounce 0.2
            GAMEVARS.players[i] = GAMEVARS.playersGroup.create(Phaser.Math.Between(200, 600), Phaser.Math.Between(100, 500), GAMEVARS.tempPlayers[i]+(i+1)).setBounce(0.2).setScale(1.4);

            // Set skin
            GAMEVARS.playerSkins[i] = GAMEVARS.tempPlayers[i];
        
            // Set speed limit (for falling, 
            // the player cant ride that fast)
            GAMEVARS.players[i].body.maxSpeed = GAMEVARS.speedLimit;

            // Set name. This is used to identify the player
            // in other parts of the game.
            GAMEVARS.players[i].name = i;

            // Set health
            GAMEVARS.playerHealth[i] = GAMEVARS.maxHealth;

            // Color and offset for hp bar
            var color = CST.UI.CARDCOLOR;
            var offset = 2;

            // Color the healthbar
            if(i == 0) color = CST.UI.COLORS.PLAYER1
            else if(i == 1) color = CST.UI.COLORS.PLAYER2
            else if(i == 2) color = CST.UI.COLORS.PLAYER3
            else if (i == 3) color = CST.UI.COLORS.PLAYER4
            
            // Dropshadow
            this.add.graphics().fillStyle(0x000000, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, 10 + offset, (this.game.renderer.width / 4-20), 20);
 
            // Background (empty part)
            this.add.graphics().fillStyle(CST.UI.CARDCOLOR, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4-20), 20);

            // Health itself
            this.add.graphics().fillStyle(color, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4 - 20) * (GAMEVARS.playerHealth[i] / GAMEVARS.maxHealth), 20);

        }
        

        // Player animations

        for (var x = 1; x < 5; x++) {

            // Get list of skins
            let skins = CST.SKINS;

            // Create animations for all skins
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

        // Run the code for each joined player
        // This uses the pads to count players, but
        // it doesnt matter because there are always as much players
        // as there are pads.
        for (var i = 0; i < pads.length; i++) {

            // Get pad and current player
            var gamepad = pads[i];

            // Get player num 
            // (convert array index to normal count)
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
                GAMEVARS.platforms = {};
                GAMEVARS.cursors = "";
                GAMEVARS.playerHealth = [];
                GAMEVARS.deadPlayers = [];
                GAMEVARS.deadPlayerCount = 0;
                this.playerCount = 0;

                this.cameras.main.fadeOut(CST.UI.FADEDURATION, 0, 0, 0)

                this.scene.start(CST.SCENES.MENU, [false, null]);

                return;
            }
            
            // If the players health is equal ar lower than 0,
            // add him to the dead players list
            if (GAMEVARS.playerHealth[i] <= 0) GAMEVARS.deadPlayers[i] = true;
            else GAMEVARS.deadPlayers[i] = false;

            // If the player is dead, change sprite and continue
            if (GAMEVARS.deadPlayers[i] === true) {
                GAMEVARS.players[i].setVelocityX(0);
                GAMEVARS.players[i].body.pushable = false;
                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_dead' + tank, true);
                continue;
            }

            // Control player using d-pad
            // This moves and aims at the same time.
            if (gamepad.left) {
                GAMEVARS.players[i].setVelocityX(-GAMEVARS.playerSpeed);
                
                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_ride' + tank, true);
                GAMEVARS.players[i].setFlipX(true);
            } else if (gamepad.right) {
                GAMEVARS.players[i].setVelocityX(GAMEVARS.playerSpeed);

                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_ride' + tank, true);
                GAMEVARS.players[i].setFlipX(false);
            } else {
                GAMEVARS.players[i].setVelocityX(0);

                if (gamepad.axes.length && gamepad.axes[0].getValue() === 0 && gamepad.buttons[7].value < 0.7) GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_idle' + tank, true);
                else if(!gamepad.axes.length && gamepad.buttons[7].value < 0.7) GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_idle' + tank, true);
            }

            // Jump (only works if player is on the ground)
            if (gamepad.up && GAMEVARS.players[i].body.touching.down) {

                // This sets the ySpeed. This way there is no boost when jumping
                // on a jumppad and the speed is only decreased (is weird, so I disabled it)
                // GAMEVARS.players[i].setVelocityY(-GAMEVARS.jumpSpeed);

                // This adds the jumpSpeed to ySpeed, this way
                // the player gets a boost when jumping on a jumppad
                GAMEVARS.players[i].body.velocity.y += -GAMEVARS.jumpSpeed;
            }

            // Control player using analog stick
            // Movement only
            if (gamepad.axes.length >= 2)
            {
                let axisH = gamepad.axes[0].getValue();
                let axisV = gamepad.axes[1].getValue();

                if (axisH !== 0) {
                    GAMEVARS.players[i].setVelocityX(axisH * GAMEVARS.playerSpeed);
                    GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_ride' + tank, true);
                }

                // This weird hack is for my SNES controller.
                // For some reason the d-pad is identified as analog stick by
                // Phaser. I'm checking for the vendor and productid to identify this
                // type of controller and fix the issue :)
                if(gamepad.id.includes("0810") && gamepad.id.includes("e501")) {
                    if (-axisH > 0) GAMEVARS.players[i].setFlipX(true);
                    if (-axisH < 0) GAMEVARS.players[i].setFlipX(false);
                }

                // if(axisV < 0 && GAMEVARS.players[i].body.touching.down) GAMEVARS.players[i].setVelocityY(axisV * jumpSpeed);`
                if (axisV < -0.5 && GAMEVARS.players[i].body.touching.down) GAMEVARS.players[i].body.velocity.y += -GAMEVARS.jumpSpeed;
            }

            // Control player using analog stick
            // Aim only
            if (gamepad.axes.length >= 3)
            {
                let axisH = gamepad.axes[2].getValue();

                if (axisH > 0.8) GAMEVARS.players[i].setFlipX(false);
                if (axisH < -0.8) GAMEVARS.players[i].setFlipX(true);
            }

            // Firetimer is a cooldown for
            // shooting bombs
            GAMEVARS.fireTimer[i]++;
            
            // If the player presses A (Xbox controller) or right analog trigger, shoot ball
            if (gamepad.buttons[0].value === 1 || gamepad.buttons[7].value > 0.7) {   
                
                if (GAMEVARS.fireTimer[i] < GAMEVARS.cooldown) continue;

                GAMEVARS.fireTimer[i] = 0;

                // Shoot bomb to left
                if (GAMEVARS.players[i].flipX == true) {
                    // var bomb = GAMEVARS.bombs.create(GAMEVARS.players[i].x - 45, GAMEVARS.players[i].y - 5, 'bomb');

                    let bomb = GAMEVARS.bombs.create(GAMEVARS.players[i].x - 45, GAMEVARS.players[i].y - 5, 'bomb');
                    // var bomb = GAMEVARS.bombs.get(GAMEVARS.players[i].x - 45, GAMEVARS.players[i].y - 5);

                    if (!bomb) return;

                    bomb.setActive(true);
                    bomb.setVisible(true);
                    bomb.setVelocityX(-10 * GAMEVARS.playerSpeed);
                    bomb.setVelocityY(Phaser.Math.Between(200, -200));
                    bomb.setBounce(1);
                    bomb.setScale(2);

                    // Enable this to make the bomb
                    // collide with the borders of the map
                    // bomb.setCollideWorldBounds(true);
                }

                // Shoot bomb to right
                else {
                    let bomb = GAMEVARS.bombs.create(GAMEVARS.players[i].x + 45, GAMEVARS.players[i].y - 5, 'bomb');

                    if (!bomb) return;

                    bomb.setVelocityX(10 * GAMEVARS.playerSpeed);
                    bomb.setVelocityY(Phaser.Math.Between(200, -200));
                    bomb.setBounce(1);
                    bomb.setScale(2);

                    // Enable this to make the bomb
                    // collide with the borders of the map
                    // bomb.setCollideWorldBounds(true);
                }

                // Play animation and play sound
                GAMEVARS.players[i].anims.play(GAMEVARS.playerSkins[i]+'_shoot' + tank, true);
                this.sound.play('shoot');
            } 
        }

        // Screenwrapping
        this.physics.world.wrap(GAMEVARS.playersGroup, 10);     //32 padding

        // Reset count to recount
        GAMEVARS.deadPlayerCount = 0;

        // Count dead players
        for (let i = 0; i <= GAMEVARS.deadPlayers.length; i++) {
            if (GAMEVARS.deadPlayers[i] === true) GAMEVARS.deadPlayerCount += 1;
        }

        // Detect if only one player is alive
        if (GAMEVARS.deadPlayerCount >= this.playerCount - 1 && GAMEVARS.deadPlayerCount !== 0) {
            console.log("Only one player is still alive. Searching for winner.");

            // Cycle trough all players
            for (let i = 0; i <= GAMEVARS.deadPlayers.length; i++) {

                // If the player is still alive, he is the winner
                if (GAMEVARS.deadPlayers[i] === false) {
                    console.log("Found winner: "+(i+1));

                    // Get correct animation for
                    // the endScene
                    var skin = GAMEVARS.playerSkins[i] + "_idle" + (i + 1);
                    
                    // Stop current scene / game
                    this.scene.stop(CST.SCENES.GAME);

                    // Reset game
                    GAMEVARS.players = [];
                    GAMEVARS.deadPlayers = [];
                    GAMEVARS.platforms = {};
                    GAMEVARS.cursors = "";
                    GAMEVARS.playerHealth = [];
                    GAMEVARS.deadPlayers = [];
                    GAMEVARS.deadPlayerCount = 0;
                    this.playerCount = 0;

                    // Open endScene
                    this.scene.start(CST.SCENES.MENU, [true, i+1, skin, GAMEVARS.playerSkins, this.level, this.teamsEnabled]);
                }
            }
        }

    }

}