import Phaser from 'phaser'
import { CST } from "../CST";

export class teamsScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.TEAMS
        })
    }

    teamdex = [null,null,null,null];
    teamtext = [];
    boxes = [];
    fireDelay = 10;
    fireTimer = this.fireDelay;

    players = [];
    level = "default";
    options = [];
    customSettings = false;
    joinedPlayersNum = 0;

    init(data) {
        console.log("Openend team select.");
        this.players = data[0];
        this.level = data[1];

        if(data[2]) {
            this.customSettings = true;
            this.options = data[3];
        }
    }

    create() {

        // Cool fade-in effect
        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        // Add background
        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.1 + 20, 'choose-team').setScale(2);

        // Create animations
        for (var x = 1; x < 5; x++) {

            let skins = CST.SKINS;

            for (var skin = 0; skin < skins.length; skin++) {
                this.anims.create({
                    key: skins[skin]+'_shoot'+x,
                    frames: this.anims.generateFrameNumbers(skins[skin]+x, { start: 3, end: 4 }),
                    frameRate: 5
                });
        
                this.anims.create({
                    key: skins[skin]+'_idle'+x,
                    frames: this.anims.generateFrameNumbers(skins[skin]+x, { start: 0, end: 1 }),
                    frameRate: 5,
                    repeat: -1
                });
        
                this.anims.create({
                    key: skins[skin]+'_dead'+x,
                    frames: [ { key: skins[skin]+x, frame: 5 } ],
                    frameRate: 5
                });
        
                this.anims.create({
                    key: skins[skin]+'_ride'+x,
                    frames: [ { key: skins[skin]+x, frame: 0 }, { key: skins[skin]+x, frame:  2 } ],
                    frameRate: 5
                });
            }
        }

        // Add player boxes
        // for(let i = 0;i<4;i++) {

        //     let offset = 2;

        //     this.boxes[i] = this.add.graphics();
        //     this.boxes[i].fillStyle(CST.UI.CARDCOLOR, 1.0);

        //     let boxShadow = this.add.graphics();
        //     boxShadow.fillStyle(0x000000, 1.0);

        //     this.boxes[i].fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.3, this.game.renderer.width / 4 - 20, 240).setDepth(1);

        //     boxShadow.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, offset + this.game.renderer.height * 0.3, this.game.renderer.width / 4 - 20, 240).setDepth(0);
        // }

        // Add player sprites
        for(let i = 0;i<this.players.length;i++) {
            if(this.players[i] !== null && this.players[i] !== undefined) {

                this.joinedPlayersNum += 1;

                // Add little line at the bottom, because
                // the skins itself dont have a bottom
                let playerSpriteBottom = this.add.graphics();
                playerSpriteBottom.fillStyle(0xffffff, 1.0);
                
                this.teamdex[i] = 2;

                let offset = 2;

                this.boxes[i] = this.add.graphics();
                this.boxes[i].fillStyle(CST.UI.CARDCOLOR, 1.0);

                let boxShadow = this.add.graphics();
                boxShadow.fillStyle(0x000000, 1.0);

                this.boxes[i].fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.3, this.game.renderer.width / 4 - 20, 240).setDepth(1);

                boxShadow.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, offset + this.game.renderer.height * 0.3, this.game.renderer.width / 4 - 20, 240).setDepth(0);

                // Add skins itself
                let sprite = this.add.sprite((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + 90, this.game.renderer.height * 0.3 + 100, this.players[i]).setDepth(2).setScale(3.2);

                // Add the line itself and move it to the foreground
                playerSpriteBottom.setDepth(4);
                playerSpriteBottom.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + 31, this.game.renderer.height * 0.3 + 153, 120, 3.2)

                this.teamtext[i] = this.add.text((i + 1) * 20 +i * (this.game.renderer.width / 4 - 30) + 25, this.game.renderer.height * 0.3 + 200, 'Choose team', { font: '20px Courier', color: CST.UI.TEXTCOLOR }).setDepth(2);

                // Play animation
                sprite.anims.play(this.players[i] + '_idle' + (i + 1), true);

                this.updateTeams();

            }
        }

        this.input.gamepad.on("down", (pad, button) => {

            let i = pad.index;
            console.log("Player " + (i+1) + " pressed a button.");

            // if (pad.index == 0) {
            // When player1 hits the back button (or b)
            if (button.index === 8 || button.index == 1) {

                // Stop title screen music (otherwise it will play twice)
                this.sound.stopAll();

                // Stop current scene
                this.scene.stop(CST.SCENES.MODE);

                // Play sound
                this.sound.play('btn_back');

                // Go back to main menu
                this.scene.start(CST.SCENES.MENU, [false]);
            }

            // When player 1 hits the start button (or a)
            if (button.index === 9 || button.index === 0) {

                // Stop music
                this.sound.stopAll();

                // Play sound
                this.sound.play('btn_click');

                let playerCount = 0;
                let team1 = 0;
                let team2 = 0;
                let notAllPlayersJoinedYet = false;

                for(let i = 0;i<5;i++) {
                    if(this.teamdex[i] === 0 || this.teamdex[i] === 1) playerCount += 1;

                    if(this.teamdex[i] === 0) team1 += 1;
                    else if(this.teamdex[i] === 1) team2 += 1;

                    if(this.teamdex[i] === 2) notAllPlayersJoinedYet = true;
                }

                // The game can only start if all players have joined a team
                if(playerCount > 1 && notAllPlayersJoinedYet == false) {

                    // Both teams need at least one player
                    if(team1 > 0 && team2 > 0) {

                        console.log("Teamdex in teamsScene: ");
                        console.log(this.teamdex);

                        // Apply custom settings if used 
                        // (I might add teams as an option to Freeplay)
                        if(this.customSettings == true) {
                            this.scene.start(CST.SCENES.GAME, [this.players, this.level, this.options, this.teamdex]);
                        } else this.scene.start(CST.SCENES.GAME, [this.players, this.level, false, this.teamdex]);

                    }
                }                
                
            }

            // Change mode
            if(button.index == 12) {

                this.sound.play('btn_hover');

                if (this.teamdex[i] == 0) this.teamdex[i] = 1;
                else this.teamdex[i] = 0;

                this.updateTeams();
            }

            // Change mode
            if(button.index == 13) {

                this.sound.play('btn_hover');

                if (this.teamdex[i] == 0) this.teamdex[i] = 1;
                else this.teamdex[i] = 0;

                this.updateTeams();
            }
            

        }, this);

    }

    update() {
        this.background.tilePositionX += CST.UI.BACKGROUNDSPEED;

        this.fireTimer += 1;

        for(let i = 0;i < 5;i++) {

            let gamepad = this.input.gamepad.gamepads[i];

            if(gamepad) {

                if(gamepad.axes.length >= 2) {
    
                    // Change mode
                    let axisV = gamepad.axes[1].getValue();
                    if (axisV < -0.8 && this.fireTimer > this.fireDelay) {

                        this.fireTimer = 0;

                        this.sound.play('btn_hover');

                        if (this.teamdex[i] == 0) this.teamdex[i] = 1;
                        else this.teamdex[i] = 0;

                        this.updateTeams();

                    } // left
                    if (axisV > 0.8 && this.fireTimer > this.fireDelay) {

                        this.fireTimer = 0;

                        this.sound.play('btn_hover');

                        if (this.teamdex[i] == 0) this.teamdex[i] = 1;
                        else this.teamdex[i] = 0;

                        this.updateTeams();  

                    } // right
                }
            }        
        }
    }

    updateTeams() {
        for(let i = 0;i<4;i++) {

            if(!this.boxes[i]) continue;

            // Choose color for the box
            if(this.teamdex[i] === 0) {
                this.boxes[i].fillStyle(CST.UI.COLORS.TEAM1, 1.0);
            } else if(this.teamdex[i] === 1) {
                this.boxes[i].fillStyle(CST.UI.COLORS.TEAM2, 1.0);
            } else if(this.teamdex[i] === 2) {
                this.boxes[i].fillStyle(CST.UI.CARDCOLOR, 1.0);
            } else {
                this.boxes[i].fillStyle(CST.UI.INACTIVE_CARDCOLOR, 1.0);
            }

            // Text to show what team a player is in
            if(this.teamdex[i] !== null && this.teamdex[i] !== 2) {
                this.teamtext[i].text = "Team "+(this.teamdex[i] + 1);
                this.teamtext[i].x = (i + 1) * 20 +i * (this.game.renderer.width / 4 - 30) + 25 + 27;
            }

            // Color the box :)
            this.boxes[i].fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.3, this.game.renderer.width / 4 - 20, 240).setDepth(1);

        }
    }

}