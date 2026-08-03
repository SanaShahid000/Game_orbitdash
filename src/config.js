
export const Palette = {
  bg: 0x151038,
  bgCss: '#151038',
  ring: 0x9a8fd0,
  ringSoft: 0x4a3f80,
  comet: 0xffc857,
  cometGlow: 0xff9f1c,
  star: 0x7be0ad,
  asteroid: 0xff5964,
  text: '#f4f0ff',
  textDim: '#9a8fd0',
};

export const Fonts = {
  display: "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif",
};

export const Tuning = {
  winScore: 20,          // stars needed to win
  baseSpeed: 1.6,        // radians / second at score 0
  speedPerStar: 0.06,    // speed gained per collected star
  maxSpeed: 3.2,
  ringRadiusFactor: 0.34, // ring radius = min(w, h) * factor
  playerSize: 26,        // px at design scale
  itemSize: 22,
  maxAsteroids: 4,
  minAngularGap: 0.55,   // min radians between spawned items / player
};
