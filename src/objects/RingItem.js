import Phaser from 'phaser';


export default class RingItem extends Phaser.GameObjects.Image {
  /**
   * @param {Phaser.Scene} scene
   * @param {'star'|'asteroid'} kind
   * @param {number} theta angle on the ring (radians)
   */
  constructor(scene, kind, theta) {
    super(scene, 0, 0, kind);
    scene.add.existing(this);
    this.kind = kind;
    this.theta = theta;
    this.setDepth(3);

    // gentle idle motion so the ring feels alive
    if (kind === 'star') {
      scene.tweens.add({
        targets: this,
        scale: { from: 0.85, to: 1.1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      scene.tweens.add({
        targets: this,
        rotation: Math.PI * 2,
        duration: 4000,
        repeat: -1,
      });
    }

    // pop-in
    this.setScale(0);
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 220,
      ease: 'Back.easeOut',
    });
  }

  /** Sync screen position from ring geometry. */
  place(center, radius) {
    this.x = center.x + Math.cos(this.theta) * radius;
    this.y = center.y + Math.sin(this.theta) * radius;
  }
}
