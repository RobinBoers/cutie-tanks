import Phaser from 'phaser'
import { CST } from "../CST";

export class playerSelectScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.PLAYERSELECT
        })
    }

    level = "default"
    skindex = CST.SKINS;
    currentSkin = [0,0,0,0];
    currentLevel = 0;
    playerSprites = [];
    customSettings = false;

    fireDelay = 10;
    fireTimer = this.fireDelay;

    init(data) {
        console.log(data[0]);

        if(data[1]) {
            for(var i = 0;i<data[1].length;i++) {
                this.currentSkin[i] = this.skindex.indexOf(data[1][i]);
            }
        }

        if(data[2]) {
            this.level = data[2];
            
            if(this.level == "city") {
                this.currentLevel = 0
            } else if(this.level == "forest") {
                this.currentLevel = 1
            } else if(this.level == "factory") {
                this.currentLevel = 2
            }
        }

        if(data[3]) {
            this.customSettings = true;
            this.options = data[3];
        }
    }

    players = [];
    joinedPlayers = [];
    placeholders = [];
    joinedPlayersNum = 0;

    create() {

        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        // this.add.image(0, 0, 'title_bg').setOrigin(0).setDepth(0).setScale(CST.UI.BACKGROUNDSCALE);

        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        // this.add.text(150, this.game.renderer.height * 0.1, 'Press down to join and change skin.', { font: '24px Courier', color: CST.UI.TEXTCOLOR });

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.1 + 20, 'press-down').setScale(2);

        // this.add.text(100, 420, 'Choose a level. Press start when ready.', { font: '24px Courier', color: CST.UI.TEXTCOLOR });

        this.add.image(this.game.renderer.width / 2, 420 + 10, 'choose-level').setScale(2);

        this.refreshLevels();
        
        // placeholder boxes

        for (var i = 0; i < 4; i++) {
            let playerBox = this.add.graphics();
            playerBox.fillStyle(CST.UI.CARDCOLOR, 1.0);

            let boxShadow = this.add.graphics();
            boxShadow.fillStyle(0x000000, 1.0);

            let offset = 2;

            playerBox.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(1);

            boxShadow.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, offset + this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(0);

            this.placeholders[i] = this.add.image((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + 90, this.game.renderer.height * 0.2 + 100, 'join_btn').setDepth(2).setScale(3.2);
        }

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

        // Spawn a new player when a controller connects
        this.input.gamepad.on('connected', function (pad) {
            
            console.log('Connected', pad.id + '.');

        }, this);

        this.input.gamepad.on("down", (pad, button) => {

            // Change skin
            if (button.index === 13 && this.joinedPlayers[pad.index] === true) {

                this.sound.play('btn_hover');

                this.currentSkin[pad.index] += 1;

                if (!this.skindex[this.currentSkin[pad.index]]) {
                    this.currentSkin[pad.index] = 0;
                }

                let skin = this.skindex[this.currentSkin[pad.index]];
                // let playerSkin = skin + (pad.index + 1);

                this.players[pad.index] = skin;

                this.playerSprites[pad.index].anims.play(skin + '_idle' + (pad.index + 1), true);

            }

            // Change skin
            if (button.index === 12 && this.joinedPlayers[pad.index] === true) {

                this.sound.play('btn_hover');

                this.currentSkin[pad.index] -= 1;

                if (this.currentSkin[pad.index] < 0) {
                    this.currentSkin[pad.index] = this.skindex.length - 1;
                }

                let skin = this.skindex[this.currentSkin[pad.index]];
                // let playerSkin = skin + (pad.index + 1);

                this.players[pad.index] = skin;

                this.playerSprites[pad.index].anims.play(skin + '_idle' + (pad.index + 1), true);

            }

            // When a player joins
            if (button.index === 13 && this.joinedPlayers[pad.index] !== true) {

                this.joinPlayer(pad.index);

            }

            // if (pad.index == 0) {
            // When player1 hits the back button
            if (button.index === 8 || button.index == 1) {

                // Stop title screen music (otherwise it will play twice)
                this.sound.stopAll();

                // Stop current scene
                this.scene.stop(CST.SCENES.PLAYERSELECT);

                // Play sound
                this.sound.play('btn_back');

                // Reset joined players
                this.joinedPlayers = [];

                // Go back to mode selection
                this.scene.start(CST.SCENES.MODE, ["Back to mode select. Exit player select."]);
            }

            // When player 1 hits the start button
            if ((button.index === 9 || button.index == 0) && this.joinedPlayersNum > 1) {

                // Stop music
                this.sound.stopAll();

                // Reset joined players for next time
                this.joinedPlayers = [];

                // Play sound
                this.sound.play('btn_click');

                // Start game
                if(this.customSettings == true) {
                    this.scene.start(CST.SCENES.GAME, [this.players, this.level, this.options]);
                } else {
                    this.scene.start(CST.SCENES.GAME, [this.players, this.level]);
                }
            }

            // Change level (to left)
            if(button.index == 14) {

                this.sound.play('btn_hover');

                if(this.currentLevel > 0) {
                    this.currentLevel -= 1;
                }

                this.refreshLevels();
 
            }

            if(button.index == 15) {

                this.sound.play('btn_hover');

                if(this.currentLevel < 2) {
                    this.currentLevel += 1;
                }

                this.refreshLevels();
 
            }

            // Random level (y button)
            if(button.index == 3) {
                this.sound.play('btn_hover');

                let maxLevels = 2;

                this.currentLevel = Math.floor(Math.random() * (maxLevels - 0 + 1) + 0);

                if(this.currentLevel == 0) {
                    this.level = "city"
                } else if(this.currentLevel == 1) {
                    this.level = "forest"
                } else if(this.currentLevel == 2) {
                    this.level = "factory"
                }

                this.add.image(95, 460, 'city_scene').setScale(.15).setOrigin(0, 0)
                this.add.image(105 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene').setScale(.15).setOrigin(0, 0)
                this.add.image(115 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene').setScale(.15).setOrigin(0, 0)
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
    
                    // Change selected level
                    let axisH = gamepad.axes[0].getValue();
                    if (axisH < -0.8 && this.fireTimer > this.fireDelay) {

                        this.fireTimer = 0;

                        this.sound.play('btn_hover');

                        if(this.currentLevel > 0) {
                            this.currentLevel -= 1;
                        }

                        this.refreshLevels();

                    } // left
                    if (axisH > 0.8 && this.fireTimer > this.fireDelay) {

                        this.fireTimer = 0;

                        this.sound.play('btn_hover')

                        if(this.currentLevel < 2) {
                            this.currentLevel += 1;
                        }
        
                        this.refreshLevels();

                    } // right

                    // Select skin (down)
                    let axisV = gamepad.axes[1].getValue();
                        
                    if (axisV > 0.8 && this.fireTimer > this.fireDelay && this.joinedPlayers[i] === true) {

                        this.fireTimer = 0;
                        this.sound.play('btn_hover');

                        this.currentSkin[i] += 1;

                        if (!this.skindex[this.currentSkin[i]]) {
                            this.currentSkin[i] = 0;
                        }

                        let skin = this.skindex[this.currentSkin[i]];
                        // let playerSkin = skin + (i + 1);

                        this.players[i] = skin;

                        this.playerSprites[i].anims.play(skin + '_idle' + (i + 1), true);

                    }
                    
                    // When a player joins
                    if (axisV > 0.8 && this.fireTimer > this.fireDelay && this.joinedPlayers[i] !== true) {

                        this.joinPlayer(i);
                       
                    }

                    // Select skin (up)
                    if (axisV < -0.8 && this.fireTimer > this.fireDelay && this.joinedPlayers[i] === true) {

                        this.fireTimer = 0;
                        this.sound.play('btn_hover');

                        this.currentSkin[i] -= 1;

                        if (this.currentSkin[i] < 0) {
                            this.currentSkin[i] = this.skindex.length - 1;
                        }

                        let skin = this.skindex[this.currentSkin[i]];
                        // let playerSkin = skin + (i + 1);

                        this.players[i] = skin;

                        this.playerSprites[i].anims.play(skin + '_idle' + (i + 1), true);

                    }
                }
            }        
        }
    }

    refreshLevels() {
        if(this.currentLevel == 0) {
            // this.add.image(80, 460, 'default_scene_sel').setScale(.15).setOrigin(0, 0)
            this.add.image(95, 460, 'city_scene_sel').setScale(.15).setOrigin(0, 0)
            this.add.image(105 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene').setScale(.15).setOrigin(0, 0)
            this.add.image(115 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene').setScale(.15).setOrigin(0, 0)
                
            this.level = "city"
        } else if(this.currentLevel == 1) {
            // this.add.image(80, 460, 'default_scene').setScale(.15).setOrigin(0, 0)
            this.add.image(95, 460, 'city_scene').setScale(.15).setOrigin(0, 0)
            this.add.image(105 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene_sel').setScale(.15).setOrigin(0, 0)
            this.add.image(115 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene').setScale(.15).setOrigin(0, 0)
                
            this.level = "forest"
        } else if(this.currentLevel == 2) {
            // this.add.image(80, 460, 'default_scene').setScale(.15).setOrigin(0, 0)
            this.add.image(95, 460, 'city_scene').setScale(.15).setOrigin(0, 0)
            this.add.image(105 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene').setScale(.15).setOrigin(0, 0)
            this.add.image(115 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene_sel').setScale(.15).setOrigin(0, 0)
                
            this.level = "factory"
        }
    }

    joinPlayer(i) {

        this.joinedPlayersNum += 1;

        let skin = this.skindex[this.currentSkin[i]];
        let playerSkin = skin + (i + 1);

        this.players[i] = skin;

        this.joinedPlayers[i] = true;

        this.sound.play('btn_hover');

        let playerBox = this.add.graphics();
        playerBox.fillStyle(CST.UI.CARDCOLOR, 1.0);

        let boxShadow = this.add.graphics();
        boxShadow.fillStyle(0x000000, 1.0);

        let offset = 2;

        playerBox.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(1);

        boxShadow.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, offset + this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(0);

        this.add.text((i + 1) * 20 +i * (this.game.renderer.width / 4 - 30) + 37, this.game.renderer.height * 0.2 + 200, 'Player ' + (i + 1), { font: '20px Courier', color: CST.UI.TEXTCOLOR }).setDepth(2);

        let playerSpriteBottom = this.add.graphics();
        playerSpriteBottom.fillStyle(0xffffff, 1.0);

        this.playerSprites[i] = this.add.sprite((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + 90, this.game.renderer.height * 0.2 + 100, playerSkin).setDepth(2).setScale(3.2);

        this.placeholders[i].setVisible(false);

        playerSpriteBottom.setDepth(4);
        playerSpriteBottom.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + 31, this.game.renderer.height * 0.2 + 153, 120, 3.2)

        this.playerSprites[i].anims.play(skin + '_idle' + (i + 1), true);
    }

}