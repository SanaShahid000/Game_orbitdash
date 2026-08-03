import Phaser from 'phaser';
import { Tuning } from '../config.js';


export default class OrbitPlayer extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, 0, 0, 'comet');
    scene.add.existing(this);
    this.setDepth(5);

   
    this.theta = -Math.PI / 2;
  
    this.dir = 1;
   
    this.speed = Tuning.baseSpeed;

    this.trail = scene.add.particles(0, 0, 'dot', {
      speed: 8,
      lifespan: 350,
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: 0xffc857,
      frequency: 18,
      follow: this,
    });
    this.trail.setDepth(4);
  }

  reverse() {
    this.dir *= -1;
    this.scene.tweens.add({
      targets: this,
      scale: { from: 1.35, to: 1 },
      duration: 140,
      ease: 'Quad.easeOut',
    });
  }

  /**
   * Advance along the ring and sync screen position.
   * @param {number} dt seconds
   * @param {{x:number, y:number}} center ring center
   * @param {number} radius ring radius in px
   */
  advance(dt, center, radius) {
    this.theta = Phaser.Math.Angle.Wrap(this.theta + this.dir * this.speed * dt);
    this.x = center.x + Math.cos(this.theta) * radius;
    this.y = center.y + Math.sin(this.theta) * radius;
    // face along the direction of travel (tangent to the ring)
    this.rotation = this.theta + (this.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
  }

  stopTrail() {
    this.trail.stop();
  }

  destroy(fromScene) {
    this.trail.destroy();
    super.destroy(fromScene);
  }
}
