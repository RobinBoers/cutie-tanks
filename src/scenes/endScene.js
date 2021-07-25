import Phaser from 'phaser'
import { CST } from "../CST";

export class endScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.END
        })
    }

    winner = null
    skin = null
    oldSkins = null

    init(data) {
        this.winner = data[0];
        this.skin = data[1];
        this.oldSkins = data[2];
        this.level = data[3];
    }

    create() {

        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

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

        this.add.image(0, 0, 'title_bg_still').setOrigin(0).setDepth(0).setScale(CST.UI.BACKGROUNDSCALE);

        // this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        // this.add.text(20, this.game.renderer.height * 0.1, `Player ${this.winner} has won!`, { font: '30px Courier', fill: '#000' });
        
        let playerBox = this.add.graphics();
        playerBox.fillStyle(CST.UI.CARDCOLOR, 1.0);

        let boxShadow = this.add.graphics();
        boxShadow.fillStyle(0x000000, 1.0);

        let offset = 2;

        playerBox.fillRect(this.game.renderer.width / 2.57 - 20, this.game.renderer.height * 0.2, this.game.renderer.width / 4, 250).setDepth(1);
        boxShadow.fillRect(this.game.renderer.width / 2.57 - 20 + offset, offset + this.game.renderer.height * 0.2, this.game.renderer.width / 4, 250).setDepth(0);

        this.add.text(this.game.renderer.width / 2.57 - 20 + 55, this.game.renderer.height * 0.2 + 210, 'WINNER!', { font: '20px Courier', fill: CST.UI.TEXTCOLOR }).setDepth(2);

        let playerSpriteBottom = this.add.graphics();
        playerSpriteBottom.fillStyle(0xffffff, 1.0);

        let player = this.add.sprite(this.game.renderer.width / 2.57 - 20 + 100, this.game.renderer.height * 0.2 + 110, this.skin).setDepth(2).setScale(3.2);
        
        player.anims.play(this.skin, true);

        playerSpriteBottom.setDepth(4);
        playerSpriteBottom.fillRect(this.game.renderer.width / 2.57 - 20 + 41, this.game.renderer.height * 0.2 + 163, 120, 3.2)

        this.add.text(this.game.renderer.width / 2.57, this.game.renderer.height * 0.8, 'Press start', { font: '24px Courier', fill: CST.UI.TEXTCOLOR });

        this.sound.pauseOnBlur = false;
        // let titleMusic = this.sound.add('title_music', {
        //     loop: true
        // });

        // titleMusic.play();

        this.input.gamepad.on("down", (pad, button) => {

            if (button.index === 9) {

                this.cameras.main.fadeOut(CST.UI.FADEDURATION, 0, 0, 0)
                // this.sound.play('btn_hover');

                // setTimeout(200, () => {
                this.sound.play('btn_click');
                // })

            }

        })

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(CST.SCENES.PLAYERSELECT, ["Open player select.", this.oldSkins, this.level]);
        })

    }
}