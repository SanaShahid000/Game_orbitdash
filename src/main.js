import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { Palette } from './config.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: Palette.bgCss,
  scale: {
    
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

const game = new Phaser.Game(config);

// Exposed for the headless smoke test (test/smoke.js).
window.__ORBIT_DASH__ = game;
