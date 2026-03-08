import MainMenuScene from './scenes/MainMenuScene.js';
import CityLevelScene from './scenes/CityLevelScene.js';
import ForestLevelScene from './scenes/ForestLevelScene.js';
import JungleLevelScene from './scenes/JungleLevelScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    scene: [
        MainMenuScene,
        CityLevelScene,
        ForestLevelScene,
        JungleLevelScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
