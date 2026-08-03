import Phaser from 'phaser';
import RingItem from './RingItem.js';
import { Tuning } from '../config.js';


export default class Spawner {
  /**
   * @param {Phaser.Scene} scene
   * @param {OrbitPlayer} player used to avoid spawning on top of the player
   */
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    /** @type {RingItem[]} */
    this.items = [];
  }


  asteroidTarget(score) {
    return Math.min(1 + Math.floor(score / 4), Tuning.maxAsteroids);
  }


  refill(score) {
    if (!this.items.some((i) => i.kind === 'star')) this.spawn('star');
    while (this.items.filter((i) => i.kind === 'asteroid').length < this.asteroidTarget(score)) {
      if (!this.spawn('asteroid')) break; // ring too crowded, try next refill
    }
  }

  /**
   * Spawn an item at a random angle that keeps a safe gap
   * from the player and every existing item.
   * @returns {boolean} whether a safe spot was found
   */
  spawn(kind) {
    for (let attempt = 0; attempt < 24; attempt++) {
      const theta = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
      if (this.isSafe(theta)) {
        this.items.push(new RingItem(this.scene, kind, theta));
        return true;
      }
    }
    return false;
  }

  isSafe(theta) {
    const gap = Tuning.minAngularGap;
    if (Math.abs(Phaser.Math.Angle.ShortestBetween(
      Phaser.Math.RadToDeg(theta), Phaser.Math.RadToDeg(this.player.theta)
    )) < Phaser.Math.RadToDeg(gap * 2)) return false;
    return this.items.every((item) =>
      Math.abs(Phaser.Math.Angle.ShortestBetween(
        Phaser.Math.RadToDeg(theta), Phaser.Math.RadToDeg(item.theta)
      )) >= Phaser.Math.RadToDeg(gap)
    );
  }

  remove(item) {
    this.items = this.items.filter((i) => i !== item);
    item.destroy();
  }

  placeAll(center, radius) {
    this.items.forEach((i) => i.place(center, radius));
  }

  destroy() {
    this.items.forEach((i) => i.destroy());
    this.items = [];
  }
}
