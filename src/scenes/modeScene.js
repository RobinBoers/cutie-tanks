import Phaser from 'phaser'
import { CST } from "../CST";

export class modeScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.MODE
        })
    }

    currentMode = 0;

    init(data) {
        console.log(data[0]);
    }

    create() {

        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.1 + 20, 'choose-mode').setScale(2);

        this.updateMode();

        this.input.gamepad.on("down", (pad, button) => {

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

                // If mode is single match, open player select
                if(this.currentMode == 0) this.scene.start(CST.SCENES.PLAYERSELECT, ["Open player select"]);
                // If it is freeplay, open the freeplay settings
                else this.scene.start(CST.SCENES.SETTINGS, ["Open settings menu."]);
            }

            // Change mode (to left)
            if(button.index == 14) {

                this.sound.play('btn_hover');

                if(this.currentMode > 0) {
                    this.currentMode -= 1
                }

                this.updateMode();
            }

            // Change mode (to right)
            if(button.index == 15) {

                this.sound.play('btn_hover');

                if(this.currentMode < 2) {
                    this.currentMode += 1
                }

                this.updateMode();
            }
            

        }, this);

    }

    update() {
        this.background.tilePositionX += CST.UI.BACKGROUNDSPEED;
    }

    updateMode() {
        if(this.currentMode == 0) {

            this.add.image((this.game.renderer.width / 2) - 300 - 10, 200, 'forest_scene_sel').setScale(.25).setOrigin(0, 0)
            this.add.image((this.game.renderer.width / 2) + 10, 200, 'factory_scene').setScale(.25).setOrigin(0, 0)
            
        } else {

            this.add.image((this.game.renderer.width / 2) - 300 - 10, 200, 'forest_scene').setScale(.25).setOrigin(0, 0)
            this.add.image((this.game.renderer.width / 2) + 10, 200, 'factory_scene_sel').setScale(.25).setOrigin(0, 0)

        }
    }

}