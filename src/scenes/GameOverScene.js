import Phaser from 'phaser';
import Starfield from '../utils/Starfield.js';
import { Palette, Fonts, Tuning } from '../config.js';
import { sfx } from '../utils/Sfx.js';
import { getBest } from '../utils/storage.js';


export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.won = Boolean(data.won);
    this.score = data.score || 0;
  }

  create() {
    this.starfield = new Starfield(this, 60);

    this.title = this.add
      .text(0, 0, this.won ? 'YOU WIN!' : 'GAME OVER', {
        fontFamily: Fonts.display,
        fontSize: '52px',
        fontStyle: 'bold',
        color: this.won ? '#7be0ad' : '#ff5964',
      })
      .setOrigin(0.5)
      .setDepth(3);

    const best = getBest();
    this.summary = this.add
      .text(0, 0, `Stars collected: ${this.score} / ${Tuning.winScore}\nBest: ${best}`, {
        fontFamily: Fonts.display,
        fontSize: '22px',
        color: Palette.textDim,
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.prompt = this.add
      .text(0, 0, 'TAP TO PLAY AGAIN', {
        fontFamily: Fonts.display,
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#ffc857',
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.tweens.add({
      targets: this.prompt,
      alpha: { from: 1, to: 0.35 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    if (this.won) this.confetti();

    this.layout();
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      this.starfield.destroy();
    });

    // brief input lock so a stray tap from the run doesn't skip this screen
    this.time.delayedCall(400, () => {
      this.input.once('pointerdown', () => {
        sfx.tap();
        this.scene.start('Game');
      });
    });
  }

  confetti() {
    const w = this.scale.width;
    const p = this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: w },
      y: -10,
      speedY: { min: 60, max: 140 },
      speedX: { min: -30, max: 30 },
      lifespan: 4000,
      scale: { start: 0.8, end: 0.2 },
      tint: [Palette.star, Palette.comet, Palette.ring],
      frequency: 60,
    });
    p.setDepth(2);
  }

  onResize() {
    this.layout();
    this.starfield.resize(this.scale.width, this.scale.height);
  }

  layout() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.title.setPosition(cx, cy - 90);
    this.title.setFontSize(Math.min(52, this.scale.width * 0.11));
    this.summary.setPosition(cx, cy);
    this.prompt.setPosition(cx, cy + 100);
  }

  update(_, dtMs) {
    this.starfield.update(dtMs / 1000);
  }
}
