import Phaser from 'phaser'
import { CST } from "../CST";

export class endScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.END
        })
    }

    init(data) {
        this.winner = data[0]; // not used anymore. id of the player in normal digits (0 -> 1)
        this.skin = data[1]; // skin the winner used
        this.oldSkins = data[2]; // skins prev selected, remembered for the next round
        this.level = data[3]; // level prev selected, remembered for the next round
        this.teamsEnabled = data[4]; // if teams are enabled or not, remembered for next round
        this.winningTeam = data[5]; // id of the winning team
    }

    create() {

        // Cool fade-in effect
        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        // Create animations
        for (var x = 1; x < 5; x++) {

            let skins = CST.SKINS;

            for (var skin = 0; skin < skins.length; skin++) {
                this.anims.create({
                    key: skins[skin] + '_shoot' + x,
                    frames: this.anims.generateFrameNumbers(skins[skin] + x, { start: 3, end: 4 }),
                    frameRate: 5
                });
        
                this.anims.create({
                    key: skins[skin] + '_idle' + x,
                    frames: this.anims.generateFrameNumbers(skins[skin] + x, { start: 0, end: 1 }),
                    frameRate: 5,
                    repeat: -1
                });
        
                this.anims.create({
                    key: skins[skin] + '_dead' + x,
                    frames: [{ key: skins[skin] + x, frame: 5 }],
                    frameRate: 5
                });
        
                this.anims.create({
                    key: skins[skin] + '_ride' + x,
                    frames: [{ key: skins[skin] + x, frame: 0 }, { key: skins[skin] + x, frame: 2 }],
                    frameRate: 5
                });
            }
        }

        // Add background
        this.add.image(0, 0, 'title_bg_still').setOrigin(0).setDepth(0).setScale(CST.UI.BACKGROUNDSCALE);

        // this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        // this.add.text(20, this.game.renderer.height * 0.1, `Player ${this.winner} has won!`, { font: '30px Courier', fill: '#000' });
        
        // Add box
        let playerBox = this.add.graphics();
        playerBox.fillStyle(CST.UI.CARDCOLOR, 1.0);

        // Boxshadow
        let boxShadow = this.add.graphics();
        boxShadow.fillStyle(0x000000, 1.0);

        let offset = 2;

        playerBox.fillRect(this.game.renderer.width / 2.57 - 20, this.game.renderer.height * 0.2, this.game.renderer.width / 4, 250).setDepth(1);
        boxShadow.fillRect(this.game.renderer.width / 2.57 - 20 + offset, offset + this.game.renderer.height * 0.2, this.game.renderer.width / 4, 250).setDepth(0);

        // Add text (WINNER! or WINNERS! if playing in teams)
        if(this.winningTeam === true) {
            this.add.text(this.game.renderer.width / 2.57 - 20 + 55, this.game.renderer.height * 0.2 + 210, 'WINNERS!', { font: '20px Courier', color: CST.UI.TEXTCOLOR }).setDepth(2)
        } else this.add.text(this.game.renderer.width / 2.57 - 20 + 55, this.game.renderer.height * 0.2 + 210, 'WINNER!', { font: '20px Courier', color: CST.UI.TEXTCOLOR }).setDepth(2);

        if(this.winningTeam === true) {

            console.log(this.skin.length);

            // If there is a winning team, the skin is an array.
            // Loop trough it and show every players sprite
            for(let i = 0;i<this.skin.length;i++) {

                // Another line, because the sprite itself doesnt
                // have a bottom
                let playerSpriteBottom = this.add.graphics();
                playerSpriteBottom.fillStyle(0xffffff, 1.0);

                // Add sprite
                let player = this.add.sprite(this.game.renderer.width / 2.57 - 20 + 100 + -10 + 20*i, this.game.renderer.height * 0.2 + 110 + -10 + 10*i, this.skin[i]).setDepth(2+i).setScale(3.2);
                
                // Play animation
                player.anims.play(this.skin[i], true);

                // Add the line at the bottom
                playerSpriteBottom.setDepth(3+i);
                playerSpriteBottom.fillRect(this.game.renderer.width / 2.57 - 20 + 41 -10 +20*i, this.game.renderer.height * 0.2 + 163 + -10 +10*i, 120, 3.2)
            }

        } else {
            // Another line, because the sprite itself doesnt
            // have a bottom
            let playerSpriteBottom = this.add.graphics();
            playerSpriteBottom.fillStyle(0xffffff, 1.0);

            // Add sprite
            let player = this.add.sprite(this.game.renderer.width / 2.57 - 20 + 100, this.game.renderer.height * 0.2 + 110, this.skin).setDepth(2).setScale(3.2);
            
            // Play animation
            player.anims.play(this.skin, true);

            // Add the line at the bottom
            playerSpriteBottom.setDepth(4);
            playerSpriteBottom.fillRect(this.game.renderer.width / 2.57 - 20 + 41, this.game.renderer.height * 0.2 + 163, 120, 3.2)
        }

        // Text at the bottom
        this.add.text(this.game.renderer.width / 2.57, this.game.renderer.height * 0.8, 'Press start', { font: '24px Courier', color: CST.UI.TEXTCOLOR });

        // Music (not used)
        this.sound.pauseOnBlur = false;
        // let titleMusic = this.sound.add('title_music', {
        //     loop: true
        // });

        // titleMusic.play();

        this.input.gamepad.on("down", (pad, button) => {

            // If the player clicks start, A or B,
            // go back to menu (and that will redirect to player select)
            if (button.index === 9 || button.index == 0 || button.index == 1) {

                this.sound.play('btn_click');
                this.scene.start(CST.SCENES.PLAYERSELECT, ["Open player select.", this.oldSkins, this.level, false, this.teamsEnabled]);

            }

        });

    }
}