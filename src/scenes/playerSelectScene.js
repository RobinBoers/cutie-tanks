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
    currentSkin = [];
    playerSprites = [];

    init(data) {
        console.log(data);
    }

    create() {

        this.add.image(0, 0, 'title_bg').setOrigin(0).setDepth(0);

        let players = [];
        let joinedPlayers = [];
        let placeholders = [];

        this.add.text(150, this.game.renderer.height * 0.1, 'Press down to join and change skin.', { font: '24px Courier', fill: '#000' });

        this.add.text(100, 420, 'Choose a level. Press start when ready.', { font: '24px Courier', fill: '#000' });

        this.level = "default";

        this.add.image(80, 460, 'default_scene_sel').setScale(.15).setOrigin(0,0)
        this.add.image(90 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene').setScale(.15).setOrigin(0,0)
        this.add.image(100 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene').setScale(.15).setOrigin(0, 0)
        
        // placeholder boxes

        for (var i = 0; i < 4; i++) {
            let playerBox = this.add.graphics();
            playerBox.fillStyle(0x2E2A2C, 1.0);

            let boxShadow = this.add.graphics();
            boxShadow.fillStyle(0x000000, 1.0);

            let offset = 2;

            playerBox.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(1);

            boxShadow.fillRect((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + offset, offset + this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(0);

            placeholders[i] = this.add.image((i + 1) * 20 + i * (this.game.renderer.width / 4 - 30) + 90, this.game.renderer.height * 0.2 + 100, 'join_btn').setDepth(2).setScale(3.2);
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
            if (button.index === 13 && joinedPlayers[pad.index] === true) {

                this.sound.play('btn_hover');

                this.currentSkin[pad.index] += 1;

                if (!this.skindex[this.currentSkin[pad.index]]) {
                    this.currentSkin[pad.index] = 0;
                }

                let skin = this.skindex[this.currentSkin[pad.index]];
                let playerSkin = skin + (pad.index + 1);

                players[pad.index] = skin;

                this.playerSprites[pad.index].anims.play(skin +'_idle' + (pad.index + 1), true);

            }

            // Change skin
            if (button.index === 12 && joinedPlayers[pad.index] === true) {

                this.sound.play('btn_hover');

                this.currentSkin[pad.index] -= 1;

                if (this.currentSkin[pad.index] < 0) {
                    this.currentSkin[pad.index] = this.skindex.length;
                }

                let skin = this.skindex[this.currentSkin[pad.index]];
                let playerSkin = skin + (pad.index + 1);

                players[pad.index] = skin;

                this.playerSprites[pad.index].anims.play(skin +'_idle' + (pad.index + 1), true);

            }

            // When a player joins
            if (button.index === 13 && joinedPlayers[pad.index] !== true) {

                this.currentSkin[pad.index] = 0;

                let skin = this.skindex[this.currentSkin[pad.index]];
                let playerSkin = skin + (pad.index + 1);

                players[pad.index] = skin;

                joinedPlayers[pad.index] = true;

                this.sound.play('btn_hover');

                let playerBox = this.add.graphics();
                playerBox.fillStyle(0x2E2A2C, 1.0);

                let boxShadow = this.add.graphics();
                boxShadow.fillStyle(0x000000, 1.0);

                let offset = 2;

                playerBox.fillRect((pad.index + 1) * 20 + pad.index * (this.game.renderer.width / 4 - 30), this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(1);

                boxShadow.fillRect((pad.index + 1) * 20 + pad.index * (this.game.renderer.width / 4 - 30) + offset, offset + this.game.renderer.height * 0.2, this.game.renderer.width / 4 - 20, 240).setDepth(0);

                this.add.text((pad.index + 1) * 20 + pad.index * (this.game.renderer.width / 4 - 30) + 37, this.game.renderer.height * 0.2 + 200, 'Player ' + (pad.index + 1), { font: '20px Courier', fill: '#fff' }).setDepth(2);

                let playerSpriteBottom = this.add.graphics();
                playerSpriteBottom.fillStyle(0xffffff, 1.0);

                this.playerSprites[pad.index] = this.add.sprite((pad.index + 1) * 20 + pad.index * (this.game.renderer.width / 4 - 30) + 90, this.game.renderer.height * 0.2 + 100, playerSkin).setDepth(2).setScale(3.2);

                placeholders[pad.index].setVisible(false);

                playerSpriteBottom.setDepth(4);
                playerSpriteBottom.fillRect((pad.index + 1) * 20 + pad.index * (this.game.renderer.width / 4 - 30) + 31, this.game.renderer.height * 0.2 + 153, 120, 3.2)

                this.playerSprites[pad.index].anims.play(skin +'_idle' + (pad.index + 1), true);

            }

            // if (pad.index == 0) {
                // When player1 hits the back button
                if (button.index === 8) {

                    // Stop title screen music (otherwise it will play twice)
                    this.sound.stopAll();

                    // Stop current scene
                    this.scene.stop(CST.SCENES.PLAYERSELECT);

                    // Play sound
                    this.sound.play('btn_back');

                    // Reset joined players
                    joinedPlayers = [];

                    // Go back to main menu
                    this.scene.start(CST.SCENES.MENU, "Exit player select.");
                }

                // When player 1 hits the start button
                if (button.index === 9 && players.length > 1) {

                    // Stop music
                    this.sound.stopAll();

                    // Reset joined players for next time
                    joinedPlayers = [];

                    // Ply sound
                    this.sound.play('btn_click');

                    // Start game
                    this.scene.start(CST.SCENES.GAME, [players, this.level]);
                }

                // When player1 hits the a button (select default level)
                if (button.index === 0) {

                    this.sound.play('btn_hover');

                    this.add.image(80, 460, 'default_scene_sel').setScale(.15).setOrigin(0,0)
                    this.add.image(90 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene').setScale(.15).setOrigin(0,0)
                    this.add.image(100 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene').setScale(.15).setOrigin(0, 0)
                    
                    this.level = "default"
                    
                }

                // When player1 hits the x button (select forest level)
                if (button.index === 2) {

                    this.sound.play('btn_hover');

                    this.add.image(80, 460, 'default_scene').setScale(.15).setOrigin(0,0)
                    this.add.image(90 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene_sel').setScale(.15).setOrigin(0,0)
                    this.add.image(100 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene').setScale(.15).setOrigin(0, 0)
                    
                    this.level = "forest"

                }

                // When player1 hits the y button (select factory level)
                if (button.index === 3) {

                    this.sound.play('btn_hover');

                    this.add.image(80, 460, 'default_scene').setScale(.15).setOrigin(0,0)
                    this.add.image(90 + 1 * (this.game.renderer.width / 4), 460, 'forest_scene').setScale(.15).setOrigin(0,0)
                    this.add.image(100 + 2 * (this.game.renderer.width / 4), 460, 'factory_scene_sel').setScale(.15).setOrigin(0, 0)
                    
                    this.level = "factory"
                    
                }
            // }
            

        })

    }

}