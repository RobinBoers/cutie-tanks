import Phaser from 'phaser'
import { CST } from "../CST";
import { GAMEVARS } from '../GAMEVARS';

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
    options = [...GAMEVARS.defaultOptions];
    optionNames = [
        "Max Health",
        "Player Speed",
        "Speed Limit",
        "Knockback",
        "Jump Speed",
        "Cooldown",
        "Invulnerable"
    ]
    optionText = [];

    // Possible options to change:
    // - max health
    // - player speed
    // - speed limit
    // - knockback
    // - jump speed
    // - cooldown
    // - invulnerability

    fireDelay = 10;
    fireTimer = this.fireDelay;

    create() {

        // Cool fade-in effect
        this.cameras.main.fadeIn(CST.UI.FADEDURATION, 0, 0, 0)

        // Add background to scene
        this.background = this.add.tileSprite(0, 0, 3200, 600, 'title_bg').setOrigin(0);

        // Add title at the top of the screen
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.1 + 20, 'settings').setScale(2);

        // Spawn text for the options itself
        for(let i = 0;i<this.options.length;i++) {
            this.optionText[i] = this.add.text(200, this.game.renderer.height * 0.1*i + 150, this.optionNames[i] + ": " + this.options[i], { font: '24px Courier', color: CST.UI.TEXTCOLOR });
        }

        // Update options text for the first time
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
                if(this.currentOption == 6) {
                    if(this.options[this.currentOption] == false) {
                        this.options[this.currentOption] = true
                    } else {
                        this.options[this.currentOption] = false
                    }
                }
                // @ts-ignore
                else if(this.options[this.currentOption] > 1) this.options[this.currentOption] -= 1;
                this.updateOptions();
            }

            // Change option (to right)
            if(button.index == 15) {
                this.sound.play('btn_hover');
                if(this.currentOption == 6) {
                    if(this.options[this.currentOption] == false) {
                        this.options[this.currentOption] = true
                    } else {
                        this.options[this.currentOption] = false
                    }
                }
                else {
                    // @ts-ignore
                    this.options[this.currentOption] += 1;
                }
                this.updateOptions();
            }

        }, this);

    }

    update() {
        // Update background
        this.background.tilePositionX += CST.UI.BACKGROUNDSPEED;

        // fireTimer is a delay for the controller input
        // bacause it will otherwise select stuff on warp speed
        this.fireTimer += 1;

        // Cycle trough all connected gamepads (max 4)
        for(let i = 0;i < 5;i++) {

            // Get current gamepad
            let gamepad = this.input.gamepad.gamepads[i];

            // If the gamepad exists,
            // detect input
            if(gamepad) {

                // Only if the controller has analog input
                if(gamepad.axes.length >= 2) {

                    // Value of horizontal axes
                    let axisH = gamepad.axes[0].getValue();
    
                    // Change option (to left)
                    if (axisH < -0.8) {

                        this.fireTimer = 0;
                        this.sound.play('btn_hover');
                        
                        if(this.currentOption == 6) {
                            if(this.options[this.currentOption] == false) {
                                this.options[this.currentOption] = true
                            } else {
                                this.options[this.currentOption] = false
                            }
                        }
                        // @ts-ignore
                        else if(this.options[this.currentOption] > 1) this.options[this.currentOption] -= 1;
                        this.updateOptions();

                    }

                    // Change option (to right)
                    if (axisH > 0.8) {

                        this.fireTimer = 0;
                        this.sound.play('btn_hover');

                        if(this.currentOption == 6) {
                            if(this.options[this.currentOption] == false) {
                                this.options[this.currentOption] = true
                            } else {
                                this.options[this.currentOption] = false
                            }
                        }
                        else {
                            // @ts-ignore
                            this.options[this.currentOption] += 1;
                        }
                        this.updateOptions();   

                    }

                    if(this.fireTimer > this.fireDelay) {

                        // Value of the vertical axes
                        let axisV = gamepad.axes[1].getValue();
                        
                        // Select option (down)
                        if (axisV > 0.8) {

                            this.fireTimer = 0;
                            this.sound.play('btn_hover');

                            if(this.currentOption < this.options.length - 1) this.currentOption += 1;
                            this.updateOptions();

                        }

                        // Select option (up)
                        if (axisV < -0.8) {

                            this.fireTimer = 0;
                            this.sound.play('btn_hover');

                            if(this.currentOption > 0) this.currentOption -= 1;
                            this.updateOptions();

                        }
                    }
                }
            }        
        }
    }

    updateOptions() {
        // Cycle trough all options
        for(let i = 0;i<this.options.length;i++) {
            // Update text with current value
            this.optionText[i].text = this.optionNames[i] + ": " + this.options[i];

            // If selected, make the text bigger,
            // otherwise, return to default size
            if(i == this.currentOption) {
                this.optionText[i].setScale(1.5);
            } else {
                this.optionText[i].setScale(1);
            }
        }
    }

}