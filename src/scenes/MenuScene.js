import Phaser from 'phaser';
import Starfield from '../utils/Starfield.js';
import { Palette, Fonts, Tuning } from '../config.js';
import { sfx } from '../utils/Sfx.js';
import { getBest } from '../utils/storage.js';


export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.starfield = new Starfield(this, 60);

    this.ringGfx = this.add.graphics().setDepth(0);
    this.demo = this.add.image(0, 0, 'comet').setDepth(2);
    this.demoTheta = 0;

    this.title = this.add
      .text(0, 0, 'ORBIT DASH', {
        fontFamily: Fonts.display,
        fontSize: '54px',
        fontStyle: 'bold',
        color: Palette.text,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.help = this.add
      .text(
        0, 0,
        `TAP anywhere to reverse direction\nCollect ${Tuning.winScore} stars to win\nDon't hit the asteroids`,
        {
          fontFamily: Fonts.display,
          fontSize: '20px',
          color: Palette.textDim,
          align: 'center',
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5)
      .setDepth(3);

    this.prompt = this.add
      .text(0, 0, 'TAP TO START', {
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

    const best = getBest();
    this.best = this.add
      .text(0, 0, best > 0 ? `Best: ${best}` : '', {
        fontFamily: Fonts.display,
        fontSize: '18px',
        color: Palette.textDim,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.layout();
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      this.starfield.destroy();
    });

    this.input.once('pointerdown', () => {
      sfx.unlock();
      sfx.tap();
      this.scene.start('Game');
    });
  }

  onResize() {
    this.layout();
    this.starfield.resize(this.scale.width, this.scale.height);
  }

  layout() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.cx = w / 2;
    this.cy = h / 2;
    this.radius = Math.min(w, h) * Tuning.ringRadiusFactor;

    this.ringGfx.clear();
    this.ringGfx.lineStyle(3, Palette.ringSoft, 0.9).strokeCircle(this.cx, this.cy, this.radius);

    this.title.setPosition(this.cx, this.cy - this.radius - 70);
    this.title.setFontSize(Math.min(54, w * 0.11));
    this.help.setPosition(this.cx, this.cy);
    this.prompt.setPosition(this.cx, this.cy + this.radius + 56);
    this.best.setPosition(this.cx, this.cy + this.radius + 92);
  }

  update(_, dtMs) {
    const dt = dtMs / 1000;
    this.starfield.update(dt);
    this.demoTheta += dt * 1.2;
    this.demo.x = this.cx + Math.cos(this.demoTheta) * this.radius;
    this.demo.y = this.cy + Math.sin(this.demoTheta) * this.radius;
    this.demo.rotation = this.demoTheta + Math.PI / 2;
  }
}
