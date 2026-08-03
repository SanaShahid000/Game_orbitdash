import Phaser from 'phaser';
import OrbitPlayer from '../objects/OrbitPlayer.js';
import Spawner from '../objects/Spawner.js';
import Starfield from '../utils/Starfield.js';
import { Palette, Fonts, Tuning } from '../config.js';
import { sfx } from '../utils/Sfx.js';
import { getBest, setBest } from '../utils/storage.js';


export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.score = 0;
    this.alive = true;

    this.starfield = new Starfield(this, 60);
    this.ringGfx = this.add.graphics().setDepth(0);

    this.player = new OrbitPlayer(this);
    this.spawner = new Spawner(this, this.player);

    this.scoreText = this.add
      .text(0, 0, `0 / ${Tuning.winScore}`, {
        fontFamily: Fonts.display,
        fontSize: '44px',
        fontStyle: 'bold',
        color: Palette.text,
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.hint = this.add
      .text(0, 0, 'TAP TO REVERSE', {
        fontFamily: Fonts.display,
        fontSize: '20px',
        color: Palette.textDim,
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.tweens.add({
      targets: this.hint,
      alpha: 0,
      delay: 2200,
      duration: 600,
    });

    this.layout();
    this.spawner.refill(this.score);
    this.spawner.placeAll(this.center, this.radius);

    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.onResize, this);
      this.starfield.destroy();
    });

    this.input.on('pointerdown', () => {
      if (!this.alive) return;
      sfx.unlock();
      sfx.tap();
      this.player.reverse();
    });
  }

  onResize() {
    this.layout();
    this.starfield.resize(this.scale.width, this.scale.height);
  }

  layout() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.center = { x: w / 2, y: h / 2 };
    this.radius = Math.min(w, h) * Tuning.ringRadiusFactor;

    this.ringGfx.clear();
    this.ringGfx.lineStyle(3, Palette.ringSoft, 0.9).strokeCircle(this.center.x, this.center.y, this.radius);

    this.scoreText.setPosition(this.center.x, this.center.y);
    this.hint.setPosition(this.center.x, this.center.y + 46);
    this.spawner.placeAll(this.center, this.radius);
  }

  update(_, dtMs) {
    const dt = Math.min(dtMs / 1000, 0.05); // clamp to survive tab-switch spikes
    this.starfield.update(dt);
    if (!this.alive) return;

    this.player.speed = Math.min(
      Tuning.baseSpeed + this.score * Tuning.speedPerStar,
      Tuning.maxSpeed
    );
    this.player.advance(dt, this.center, this.radius);
    this.spawner.placeAll(this.center, this.radius);
    this.checkCollisions();
  }

  checkCollisions() {
    const hitArc = (Tuning.playerSize + Tuning.itemSize) * 0.62; // px along the ring
    for (const item of [...this.spawner.items]) {
      const dTheta = Math.abs(
        Phaser.Math.Angle.Wrap(item.theta - this.player.theta)
      );
      if (dTheta * this.radius < hitArc) {
        if (item.kind === 'star') this.collect(item);
        else this.crash();
        return;
      }
    }
  }

  collect(item) {
    sfx.collect();
    this.burst(item.x, item.y, Palette.star);
    this.spawner.remove(item);
    this.score += 1;
    this.scoreText.setText(`${this.score} / ${Tuning.winScore}`);
    this.tweens.add({
      targets: this.scoreText,
      scale: { from: 1.25, to: 1 },
      duration: 160,
    });

    if (this.score >= Tuning.winScore) {
      this.finish(true);
    } else {
      this.spawner.refill(this.score);
      this.spawner.placeAll(this.center, this.radius);
    }
  }

  crash() {
    sfx.hit();
    this.burst(this.player.x, this.player.y, Palette.asteroid);
    this.cameras.main.shake(220, 0.012);
    this.finish(false);
  }

  finish(won) {
    this.alive = false;
    this.player.stopTrail();
    this.player.setVisible(won);
    if (won) sfx.win();

    if (this.score > getBest()) setBest(this.score);

    this.time.delayedCall(won ? 400 : 700, () => {
      this.scene.start('GameOver', { won, score: this.score });
    });
  }

  burst(x, y, tint) {
    const p = this.add.particles(x, y, 'dot', {
      speed: { min: 60, max: 160 },
      lifespan: 500,
      scale: { start: 0.9, end: 0 },
      tint,
      quantity: 14,
      emitting: false,
    });
    p.setDepth(7);
    p.explode(14);
    this.time.delayedCall(600, () => p.destroy());
  }
}
