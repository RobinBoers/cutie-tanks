import Phaser from 'phaser'
import { CST } from "../CST";

export class loadScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.LOAD
        })
    }

    init() {

    }

    preload() {

        this.load.image('title_bg', './assets/backgrounds/menu7.png');
        this.load.image('title_bg_still', './assets/backgrounds/menu6.png');
        this.load.image('title_text', './assets/text/title4.png');
        // this.load.audio('title_music', 'assets/music/awful.mp3');

        this.load.audio('btn_hover', './assets/sounds/click.wav');
        this.load.audio('btn_click', './assets/sounds/select1.wav');
        this.load.audio('btn_back', './assets/sounds/back.wav');

        this.load.image('play_btn', './assets/text/play.png');
        this.load.image('join_btn', './assets/text/join.png');

        this.load.image('press-down', './assets/text/press-down.png');
        this.load.image('choose-level', './assets/text/choose-level.png');
        this.load.image('choose-mode', './assets/text/choose-level.png');
        this.load.image('settings', './assets/text/choose-level.png');

        this.load.image('default_scene', './assets/levels/default_button.png');
        this.load.image('factory_scene', './assets/levels/factory_button.png');
        this.load.image('forest_scene', './assets/levels/forest_button.png');
        this.load.image('city_scene', './assets/levels/city_button.png');

        this.load.image('default_scene_sel', './assets/levels/default.png');
        this.load.image('factory_scene_sel', './assets/levels/factory.png');
        this.load.image('forest_scene_sel', './assets/levels/forest.png');
        this.load.image('city_scene_sel', './assets/levels/city.png');

        this.load.image('bg', './assets/backgrounds/default.png');
        this.load.image('factory_bg', './assets/backgrounds/factory.png');
        this.load.image('forest_bg', './assets/backgrounds/forest.png');
        this.load.image('city_bg', './assets/backgrounds/city.png');

        this.load.image('ground', './assets/tiles/platform.png');
        this.load.image('stone', './assets/tiles/platform2.png');
        this.load.image('log', './assets/tiles/log.png');
        this.load.image('pipe', './assets/tiles/pipe.png');

        this.load.spritesheet('belt', './assets/tiles/belt.png', { frameWidth: 400, frameHeight: 32 });
        this.load.image('jumppad', './assets/tiles/jumppad.png');
        this.load.image('bomb', './assets/sprites/fireball.png');

        this.load.audio('explosion', './assets/sounds/poof.wav');
        this.load.audio('shoot', './assets/sounds/shoot.wav');
        this.load.audio('jump', './assets/sounds/jump2.wav');

        this.load.spritesheet('dude', './assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });

        for (var i = 1; i < 5; i++) {
            this.load.spritesheet('tank' + i, './assets/sprites/tanks/player' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('ghost' + i, './assets/sprites/tanks/ghost' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('dutch' + i, './assets/sprites/tanks/flag' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('pirate' + i, './assets/sprites/tanks/pirate' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('rainbow' + i, './assets/sprites/tanks/rainbow' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('girl' + i, './assets/sprites/tanks/girl' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('brow' + i, './assets/sprites/tanks/brow' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('bot' + i, './assets/sprites/tanks/bot' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('indiaan' + i, './assets/sprites/tanks/indiaan' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('snow' + i, './assets/sprites/tanks/snow' + i + '.png', { frameWidth: 44, frameHeight: 33 });
            this.load.spritesheet('knight' + i, './assets/sprites/tanks/knight' + i + '.png', { frameWidth: 44, frameHeight: 33 });
        }

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xFF693F
            }
        });

        this.load.on('progress', (percent) => {
            loadingBar.fillRect(0.1 * this.game.renderer.width, this.game.renderer.height / 2, 0.8 * this.game.renderer.width * percent, 50);
        });

    }

    create() {
        this.scene.start(CST.SCENES.MENU, [false]);
    }
}