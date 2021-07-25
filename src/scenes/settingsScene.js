import Phaser from 'phaser'
import { CST } from "../CST";

export class settingsScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.SETTINGS
        })
    }

    init(data) {
        console.log(data[0]);
    }

    currentOption = 0;
    options = [
        10,
        200,
        2000,
        70,
        530,
        20
    ];
    optionNames = [
        "Max Health",
        "Player Speed",
        "Speed Limit",
        "Knockback",
        "Jump Speed",
        "Cooldown"
    ]
    optionText = [];

    // Possible options to change:
    // - max health
    // - player speed
    // - speed limit
    // - knockback
    // - jump speed
    // - cooldown

    fireDelay = 10;
    fireTimer = this.fireDelay;

    create() {

        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.1 + 20, 'settings').setScale(2);

        for(let i = 0;i<this.options.length;i++) {
            this.optionText[i] = this.add.text(200, this.game.renderer.height * 0.1*i + 165, this.optionNames[i] + ": " + this.options[i], { font: '24px Courier', color: CST.UI.TEXTCOLOR });
        }

        this.updateOptions();

        this.input.gamepad.on("down", (pad, button) => {

            // When player1 hits the back button
            if (button.index === 8 || button.index == 1) {

                // Stop title screen music (otherwise it will play twice)
                this.sound.stopAll();

                // Stop current scene
                this.scene.stop(CST.SCENES.SETTINGS);

                // Play sound
                this.sound.play('btn_back');

                // Go back to mode selection
                this.scene.start(CST.SCENES.MODE, ["Open mode select. Exit Freeplay settings menu."]);
            }

            // When player 1 hits the start button
            if (button.index === 9 || button.index == 0) {

                // Stop music
                this.sound.stopAll();

                // Play sound
                this.sound.play('btn_click');

                // Open player select
                this.scene.start(CST.SCENES.PLAYERSELECT, ["Open player select",false,false,this.options]);
            }

            // Select option (up)
            if(button.index == 12) {
                this.sound.play('btn_hover');
                if(this.currentOption > 0) this.currentOption -= 1;
                this.updateOptions();
            }

            // Select option (down)
            if(button.index == 13) {
                this.sound.play('btn_hover');
                if(this.currentOption < this.options.length - 1) this.currentOption += 1;
                this.updateOptions();
            }

            // Change option (to left)
            if(button.index == 14) {
                this.sound.play('btn_hover');
                if(this.options[this.currentOption] > 1) this.options[this.currentOption] -= 1;
                this.updateOptions();
            }

            // Change option (to right)
            if(button.index == 15) {
                this.sound.play('btn_hover');
                this.options[this.currentOption] += 1;
                this.updateOptions();
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
                    // Select option
                    let axisV = gamepad.axes[1].getValue();
                    if (axisV < -0.8 && this.fireTimer > this.fireDelay) {
                        this.fireTimer = 0;
                        this.sound.play('btn_hover');
                        if(this.currentOption > 0) this.currentOption -= 1;
                        this.updateOptions();
                    } // up
                    if (axisV > 0.8 && this.fireTimer > this.fireDelay) {
                        this.fireTimer = 0;
                        this.sound.play('btn_hover');
                        if(this.currentOption < this.options.length - 1) this.currentOption += 1;
                        this.updateOptions();
                    } // down
    
                    // Change option
                    let axisH = gamepad.axes[0].getValue();
                    if (axisH < -0.8) {
                        this.fireTimer = 0;
                        this.sound.play('btn_hover');
                        if(this.options[this.currentOption] > 1) this.options[this.currentOption] -= 1;
                        this.updateOptions();
                    } // left
                    if (axisH > 0.8) {
                        this.fireTimer = 0;
                        this.sound.play('btn_hover');
                        this.options[this.currentOption] += 1;
                        this.updateOptions();   
                    } // right
                }
            }        
        }
    }

    updateOptions() {
        for(let i = 0;i<this.options.length;i++) {
            this.optionText[i].text = this.optionNames[i] + ": " + this.options[i];

            if(i == this.currentOption) {
                this.optionText[i].setScale(1.5);
            } else {
                this.optionText[i].setScale(1);
            }
        }
    }

}