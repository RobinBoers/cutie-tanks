import Phaser from 'phaser'
import { CST } from "../CST";
import { GAMEVARS } from "../GAMEVARS"

export class gameScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.GAME
        })
    }

    init(data) {

        // Reset variables used
        // in game logic

        // Level used (changed 
        // later based on input from previous scene)
        this.level = "default";

        // Teams stuff
        this.teamdex = [];
        this.teamsEnabled = false;

        // Player counts
        this.playerCount = 0;
        this.playerCountT1 = 0;
        this.playerCountT2 = 0;
        this.deadPlayerCount = 0;

        // Lists with player states
        this.players = [];
        this.tempPlayers = [];
        this.deadPlayers = [];

        // Skins
        this.playerSkins = [];
        this.playerHealth = [];

        // Groups for Phaser stuff
        this.playersGroup = {};
        this.platforms = {};
        this.belts = {};
        this.jumppads = {};
        this.bombs = {};

        this.fireTimer = [0,0,0,0];

        // Get skins (+joinedPlayers) and level
        // from playerSelectScene
        this.tempPlayers = data[0];
        this.level = data[1];

        // Custom settings
        // (for Freeplay Mode)
        if(data[2]) {
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
            this.teamdex = data[3];
            this.teamsEnabled = true;

            // Count how many players per team. Is later
            // used to check if the game is over yet.
            for(let i = 0; i < this.teamdex.length; i++) {
                if(this.teamdex[i] == 0) {
                    this.playerCountT1 += 1;
                } else if(this.teamdex[i] == 1) {
                    this.playerCountT2 += 1;
                }
            }

        }
    }

    create() {

        // Create groups for collisions and overlap stuff
        this.playersGroup = this.physics.add.group();
        this.platforms = this.physics.add.staticGroup();
        this.belts = this.physics.add.staticGroup();
        this.jumppads = this.physics.add.group();
        this.bombs = this.physics.add.group({ maxSize: 20 }); // max 20 bombs at the same time in screen
        
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
            this.belts.create(50, 200, 'belt').anims.play('belt_run');
            this.platforms.create(800, 500, 'pipe');
            this.platforms.create(60, 500, 'pipe');
            this.belts.create(800, 600, 'belt').anims.play('belt_run');
            this.platforms.create(400, 300, 'pipe');
            this.jumppads.create(740, 400, 'jumppad').setScale(4);
        } else if (this.level == "city") {
            this.add.image(400, 200, 'city_bg');
            this.platforms.create(600, 400, 'stone');
            this.platforms.create(50, 250, 'stone');
            this.platforms.create(750, 220, 'stone');
            this.jumppads.create(430, 200, 'jumppad').setScale(4);
        } else if (this.level == "forest") {
            this.add.image(400, 260, 'forest_bg').setScale(3);
            this.platforms.create(50, 500, 'log');
            this.platforms.create(-50, 150, 'log'); // .setRotation(10)
            this.platforms.create(600, 300, 'log'); // .setRotation(-85)
            this.platforms.create(900, 100, 'log');
            this.jumppads.create(170, 400, 'jumppad').setScale(4);
        } else { // Debug level as fallback
            this.add.image(400, 300, 'bg');
            this.platforms.create(600, 400, 'ground');
            this.platforms.create(50, 250, 'ground');
            this.platforms.create(750, 220, 'ground');
        }
        
        // @ts-ignore
        this.physics.add.collider(this.platforms, this.jumppads);
        // @ts-ignore
        this.physics.add.overlap(this.platforms, this.bombs, (platform, bomb) => {

            // Camera shake (disabled)
            // this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Sound
            this.sound.play('explosion');

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();
            
        }, null, this);
        // @ts-ignore
        this.physics.add.overlap(this.belts, this.bombs, (platform, bomb) => {

            // Camera shake (disabled)
            // this.cameras.main.shake(GAMEVARS.shakeDuration, GAMEVARS.shakeAmount);

            // Sound
            this.sound.play('explosion');

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();
            
        }, null, this);
        // @ts-ignore
        this.physics.add.collider(this.playersGroup, this.platforms);
        // @ts-ignore
        this.physics.add.collider(this.playersGroup, this.belts, (player) => {
            this.players[player.name].x += GAMEVARS.playerSpeed * .01;

        });
        // @ts-ignore
        this.physics.add.collider(this.playersGroup, this.playersGroup);
        // @ts-ignore
        this.physics.add.overlap(this.playersGroup, this.jumppads, (player) => {

            // Play sound
            this.sound.play('jump');

            this.players[player.name].setVelocityY(-GAMEVARS.jumpSpeed * 1.5);

        }, null, this);
        // @ts-ignore
        this.physics.add.overlap(this.playersGroup, this.bombs, (player, bomb) => {

            if (this.deadPlayers[player.name] === true) return;

            // Friendly fire
            if(this.teamsEnabled) {
                console.log(player.name);
                console.log(bomb.name);
                console.log(this.teamdex[player.name]);
                console.log(this.teamdex[bomb.name]);
                if(this.teamdex[player.name] == this.teamdex[bomb.name]) return;
            }

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
            if(!GAMEVARS.invulnerable) this.playerHealth[player.name] -= 1;

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
            this.add.graphics().fillStyle(color, 1.0).fillRect((player.name + 1) * 20 + player.name * (this.game.renderer.width / 4 - 30 ), 10, (this.game.renderer.width / 4 -20) * (this.playerHealth[player.name] / GAMEVARS.maxHealth), 20);

            // Remove bomb
            // to make space for new bombs
            bomb.destroy();

        }, null, this);

        // Add health bars at the top of the screen
        for (var i = 0; i < this.tempPlayers.length; i++) {

            // If the player didnt join, continue to the next one
            if(this.tempPlayers[i] === null || this.tempPlayers[i] === undefined) continue;

            this.playerCount += 1;
            
            // Create player at random location with scale 1.4 and bounce 0.2
            this.players[i] = this.playersGroup.create(Phaser.Math.Between(200, 600), Phaser.Math.Between(100, 500), this.tempPlayers[i]+(i+1)).setBounce(0.2).setScale(1.4);

            // Set skin
            this.playerSkins[i] = this.tempPlayers[i];
        
            // Set speed limit (for falling, 
            // the player cant ride that fast)
            this.players[i].body.maxSpeed = GAMEVARS.speedLimit;

            // Set name. This is used to identify the player
            // in other parts of the game.
            this.players[i].name = i;

            // Set health
            this.playerHealth[i] = GAMEVARS.maxHealth;

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
            this.add.graphics().fillStyle(color, 1.0).fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), 10, (this.game.renderer.width / 4 - 20) * (this.playerHealth[i] / GAMEVARS.maxHealth), 20);

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
        this.bombs.children.each(function(b) {
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
        if (!this.players || !pads) return;

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
            if (!gamepad || !this.players[i]) continue;   

            // When player1 presses the back button,
            // end game
            if (gamepad.buttons[8].value === 1) { //&& i === 0
                console.log("Got exit signal from player " + 1 + ".");

                this.sound.play('btn_back');

                this.scene.stop(CST.SCENES.GAME);

                this.playerHealth = [];
                this.deadPlayerCount = 0;

                this.cameras.main.fadeOut(CST.UI.FADEDURATION, 0, 0, 0)

                this.scene.start(CST.SCENES.MENU, [false, null]);

                return;
            }
            
            // If the players health is equal ar lower than 0,
            // add him to the dead players list
            if (this.playerHealth[i] <= 0) this.deadPlayers[i] = true;
            else this.deadPlayers[i] = false;

            // If the player is dead, change sprite and continue
            if (this.deadPlayers[i] === true) {
                this.players[i].setVelocityX(0);
                this.players[i].body.pushable = false;
                this.players[i].anims.play(this.playerSkins[i]+'_dead' + tank, true);
                continue;
            }

            // Control player using d-pad
            // This moves and aims at the same time.
            if (gamepad.left) {
                this.players[i].setVelocityX(-GAMEVARS.playerSpeed);
                
                this.players[i].anims.play(this.playerSkins[i]+'_ride' + tank, true);
                this.players[i].setFlipX(true);
            } else if (gamepad.right) {
                this.players[i].setVelocityX(GAMEVARS.playerSpeed);

                this.players[i].anims.play(this.playerSkins[i]+'_ride' + tank, true);
                this.players[i].setFlipX(false);
            } else {
                this.players[i].setVelocityX(0);

                if (gamepad.axes.length && gamepad.axes[0].getValue() === 0 && gamepad.buttons[7].value < 0.7) this.players[i].anims.play(this.playerSkins[i]+'_idle' + tank, true);
                else if(!gamepad.axes.length && gamepad.buttons[7].value < 0.7) this.players[i].anims.play(this.playerSkins[i]+'_idle' + tank, true);
            }

            // Jump (only works if player is on the ground)
            if (gamepad.up && this.players[i].body.touching.down) {

                // This sets the ySpeed. This way there is no boost when jumping
                // on a jumppad and the speed is only decreased (is weird, so I disabled it)
                // this.players[i].setVelocityY(-GAMEVARS.jumpSpeed);

                // This adds the jumpSpeed to ySpeed, this way
                // the player gets a boost when jumping on a jumppad
                this.players[i].body.velocity.y += -GAMEVARS.jumpSpeed;
            }

            // Control player using analog stick
            // Movement only
            if (gamepad.axes.length >= 2)
            {
                let axisH = gamepad.axes[0].getValue();
                let axisV = gamepad.axes[1].getValue();

                if (axisH !== 0) {
                    this.players[i].setVelocityX(axisH * GAMEVARS.playerSpeed);
                    this.players[i].anims.play(this.playerSkins[i]+'_ride' + tank, true);
                }

                // This weird hack is for my SNES controller.
                // For some reason the d-pad is identified as analog stick by
                // Phaser. I'm checking for the vendor and productid to identify this
                // type of controller and fix the issue :)
                if(gamepad.id.includes("0810") && gamepad.id.includes("e501")) {
                    if (-axisH > 0) this.players[i].setFlipX(true);
                    if (-axisH < 0) this.players[i].setFlipX(false);
                }

                // if(axisV < 0 && this.players[i].body.touching.down) this.players[i].setVelocityY(axisV * jumpSpeed);`
                if (axisV < -0.5 && this.players[i].body.touching.down) this.players[i].body.velocity.y += -GAMEVARS.jumpSpeed;
            }

            // Control player using analog stick
            // Aim only
            if (gamepad.axes.length >= 3)
            {
                let axisH = gamepad.axes[2].getValue();

                if (axisH > 0.8) this.players[i].setFlipX(false);
                if (axisH < -0.8) this.players[i].setFlipX(true);
            }

            // Firetimer is a cooldown for
            // shooting bombs
            this.fireTimer[i]++;
            
            // If the player presses A (Xbox controller) or right analog trigger, shoot ball
            if (gamepad.buttons[0].value === 1 || gamepad.buttons[7].value > 0.7) {   
                
                if (this.fireTimer[i] < GAMEVARS.cooldown) continue;

                this.fireTimer[i] = 0;

                // Shoot bomb to left
                if (this.players[i].flipX == true) {
                    // var bomb = this.bombs.create(this.players[i].x - 45, this.players[i].y - 5, 'bomb');

                    let bomb = this.bombs.create(this.players[i].x - 45, this.players[i].y - 5, 'bomb');
                    // var bomb = this.bombs.get(this.players[i].x - 45, this.players[i].y - 5);

                    if (!bomb) return;

                    bomb.name = i;
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
                    let bomb = this.bombs.create(this.players[i].x + 45, this.players[i].y - 5, 'bomb');

                    if (!bomb) return;

                    bomb.name = i;
                    bomb.setActive(true);
                    bomb.setVisible(true);
                    bomb.setVelocityX(10 * GAMEVARS.playerSpeed);
                    bomb.setVelocityY(Phaser.Math.Between(200, -200));
                    bomb.setBounce(1);
                    bomb.setScale(2);

                    // Enable this to make the bomb
                    // collide with the borders of the map
                    // bomb.setCollideWorldBounds(true);
                }

                // Play animation and play sound
                this.players[i].anims.play(this.playerSkins[i]+'_shoot' + tank, true);
                this.sound.play('shoot');
            } 
        }

        // Screenwrapping
        this.physics.world.wrap(this.playersGroup, 10);     //32 padding

        // Reset count to recount
        this.deadPlayerCount = 0;

        // Count dead players
        for (let i = 0; i <= this.deadPlayers.length; i++) {
            if (this.deadPlayers[i] === true) this.deadPlayerCount += 1;
        }

        // Check if a team had won the game
        let teamWon = false;

        if(this.teamsEnabled) {

            let deadPlayersT1 = 0;
            let deadPlayersT2 = 0;

            // Count players in team one that are dead
            for(let i = 0; i < this.teamdex.length; i++) {
                if(this.teamdex[i] == 0) {
                    if(this.deadPlayers[i] === true) {
                        deadPlayersT1 += 1;
                    }
                } else {
                    if(this.deadPlayers[i] === true) {
                        deadPlayersT2 += 1;
                    }
                }
            }

            if(deadPlayersT1 >= this.playerCountT1 || deadPlayersT2 >= this.playerCountT2) {
                teamWon = true;
            }
        }

        // Detect if only one player is alive
        if ((this.deadPlayerCount >= this.playerCount - 1 && this.deadPlayerCount !== 0) || teamWon) {
            console.log("Only one player is still alive or all players of a team are dead. Searching for winner.");

            // Cycle trough all players
            for (let i = 0; i <= this.deadPlayers.length; i++) {

                // If the player is still alive, he is the winner
                if (this.deadPlayers[i] === false) {
                    console.log("Found winner: "+(i+1));

                    // Get winning team if teams are enabled
                    let winningTeam;

                    if(this.teamsEnabled) {
                        console.log(this.teamdex);
                        winningTeam = this.teamdex[i];
                        console.log("Found winning team: " + winningTeam);
                    }

                    // Get correct animation for
                    // the endScene
                    var skin = this.playerSkins[i] + "_idle" + (i + 1);

                    let winningSkins = [];

                    if(this.teamsEnabled) {

                        // Get skins of winning team
                        for(let x = 0;x<5;x++) {
                            if(this.teamdex[x] == winningTeam) {
                                winningSkins.push(this.playerSkins[x] + "_idle" + (x + 1));
                            }
                        }

                    }
                    
                    // Stop current scene / game
                    this.scene.stop(CST.SCENES.GAME);

                    // Reset game
                    this.playerHealth = [];
                    this.deadPlayerCount = 0;

                    // Open endScene
                    if(this.teamsEnabled && winningSkins.length > 1) {
                        this.scene.start(CST.SCENES.MENU, [true, i+1, winningSkins, this.playerSkins, this.level, this.teamsEnabled, true]);
                    } else {
                        this.scene.start(CST.SCENES.MENU, [true, i+1, skin,         this.playerSkins, this.level, this.teamsEnabled, false]);
                    }
                }
            }
        }

    }

}