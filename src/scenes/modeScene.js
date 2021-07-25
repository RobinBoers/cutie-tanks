import Phaser from 'phaser'
import { CST } from "../CST";

export class modeScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.MODE
        })
    }

    init(data) {
        console.log(data[0]);
    }

    create() {

        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.1 + 20, 'choose-mode').setScale(2);

        this.input.gamepad.on("down", (pad, button) => {

            // if (pad.index == 0) {
            // When player1 hits the back button
            if (button.index === 8) {

                // Stop title screen music (otherwise it will play twice)
                this.sound.stopAll();

                // Stop current scene
                this.scene.stop(CST.SCENES.MODE);

                // Play sound
                this.sound.play('btn_back');

                // Go back to main menu
                this.scene.start(CST.SCENES.MENU, [false]);
            }

            // When player 1 hits the start button
            if (button.index === 9) {

                // Stop music
                this.sound.stopAll();

                // Ply sound
                this.sound.play('btn_click');

                // Start game
                this.scene.start(CST.SCENES.PLAYERSELECT, ["Open player select"]);
            }

            // Change mode (to left)
            if(button.index == 14) {
                this.sound.play('btn_hover');
                console.log("Prev mode");
            }

            // Change mode (to right)
            if(button.index == 15) {
                this.sound.play('btn_hover');
                console.log("Next mode");
            }
            

        }, this);

    }

    update() {
        this.background.tilePositionX += CST.UI.BACKGROUNDSPEED;
    }

}