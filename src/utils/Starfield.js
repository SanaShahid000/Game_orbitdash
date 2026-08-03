import Phaser from 'phaser';

export default class Starfield {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} count number of stars
   */
  constructor(scene, count = 60) {
    this.scene = scene;
    this.count = count;
    this.stars = [];
    this.build(scene.scale.width, scene.scale.height);
  }

  build(w, h) {
    this.destroy();
    for (let i = 0; i < this.count; i++) {
      const depth = Phaser.Math.FloatBetween(0.3, 1); // parallax layer
      const dot = this.scene.add
        .image(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), 'dot')
        .setScale(depth * 0.5)
        .setAlpha(0.25 + depth * 0.4)
        .setDepth(-10);
      dot.driftSpeed = 4 * depth; // px / second
      this.stars.push(dot);
    }
  }

  update(dt) {
    const h = this.scene.scale.height;
    const w = this.scene.scale.width;
    for (const s of this.stars) {
      s.y += s.driftSpeed * dt;
      if (s.y > h + 4) {
        s.y = -4;
        s.x = Phaser.Math.Between(0, w);
      }
    }
  }

  resize(w, h) {
    this.build(w, h);
  }

  destroy() {
    this.stars.forEach((s) => s.destroy());
    this.stars = [];
  }
}
