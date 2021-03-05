import Phaser from 'phaser'
import { CST } from "../CST";

export class menuScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.MENU
        })
    }

    init(data) {
        if (data[0] === true) {
            this.scene.start(CST.SCENES.END, [data[1], data[2]]);
        }
    }

    create() {

        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        // this.add.image(0, 0, 'title_bg').setOrigin(0).setDepth(0).setScale(CST.UI.BACKGROUNDSCALE);

        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.2, 'title_text').setDepth(1).setScale(3);

        let playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.2 + 100, 'play_btn').setDepth(1).setScale(2);

        this.add.text(this.game.renderer.width / 2.57, this.game.renderer.height * 0.8, 'Press start', { font: '24px Courier', fill: CST.UI.TEXTCOLOR });

        // this.sound.pauseOnBlur = false;
        // let titleMusic = this.sound.add('title_music', {
        //     loop: true
        // });

        // titleMusic.play();

        playButton.setInteractive();

        playButton.on("pointerover", () => {
            playButton.setScale(2.5);
            this.sound.play('btn_hover');
        })
        
        playButton.on("pointerout", () => {
            playButton.setScale(2);
        })

        playButton.on("pointerup", () => {
            playButton.setScale(1.5);
            this.cameras.main.fadeOut(CST.UI.FADEDURATION, 0, 0, 0)
            this.sound.play('btn_click');
        })

        this.input.gamepad.on("down", (pad, button) => {

            if (button.index === 9) {

                playButton.setScale(1.5);
                this.cameras.main.fadeOut(CST.UI.FADEDURATION, 0, 0, 0)
                // this.sound.play('btn_hover');

                // setTimeout(200, () => {
                    this.sound.play('btn_click');
                // })

            }

        })

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start(CST.SCENES.PLAYERSELECT, "Open player select.");
        })

    }

    update() {
        this.background.tilePositionX += CST.UI.BACKGROUNDSPEED;
    }
}