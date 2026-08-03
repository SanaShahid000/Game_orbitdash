import Phaser from 'phaser';
import { Palette, Tuning } from '../config.js';

/**
 * Generates every texture in code, so the game ships with zero
 * binary assets — nothing to load, nothing to embed, tiny build.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.makeDot();
    this.makeComet();
    this.makeStar();
    this.makeAsteroid();
    this.scene.start('Menu');
  }

  makeDot() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1).fillCircle(4, 4, 4);
    g.generateTexture('dot', 8, 8);
    g.destroy();
  }

  makeComet() {
    const s = Tuning.playerSize;
    const g = this.add.graphics();
    // soft glow layers
    g.fillStyle(Palette.cometGlow, 0.18).fillCircle(s, s, s);
    g.fillStyle(Palette.cometGlow, 0.35).fillCircle(s, s, s * 0.72);
    g.fillStyle(Palette.comet, 1).fillCircle(s, s, s * 0.5);
    g.fillStyle(0xffffff, 0.9).fillCircle(s - s * 0.15, s - s * 0.15, s * 0.16);
    g.generateTexture('comet', s * 2, s * 2);
    g.destroy();
  }

  makeStar() {
    const s = Tuning.itemSize;
    const g = this.add.graphics();
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? s : s * 0.45;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      pts.push(new Phaser.Geom.Point(s + Math.cos(a) * r, s + Math.sin(a) * r));
    }
    g.fillStyle(Palette.star, 0.25).fillCircle(s, s, s);
    g.fillStyle(Palette.star, 1).fillPoints(pts, true);
    g.generateTexture('star', s * 2, s * 2);
    g.destroy();
  }

  makeAsteroid() {
    const s = Tuning.itemSize;
    const g = this.add.graphics();
    const pts = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const r = s * Phaser.Math.FloatBetween(0.7, 1);
      pts.push(new Phaser.Geom.Point(s + Math.cos(a) * r, s + Math.sin(a) * r));
    }
    g.fillStyle(Palette.asteroid, 0.22).fillCircle(s, s, s);
    g.fillStyle(Palette.asteroid, 1).fillPoints(pts, true);
    g.fillStyle(0x000000, 0.18).fillCircle(s * 0.75, s * 0.85, s * 0.2);
    g.fillStyle(0x000000, 0.18).fillCircle(s * 1.3, s * 1.15, s * 0.14);
    g.generateTexture('asteroid', s * 2, s * 2);
    g.destroy();
  }
}
