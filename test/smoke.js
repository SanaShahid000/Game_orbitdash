
const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const nodeCanvas = require('canvas');

const html = fs.readFileSync('dist/index.html', 'utf8');
const problems = [];

const virtualConsole = new VirtualConsole();
virtualConsole.on('error', (m) => problems.push(`console.error: ${m}`));
virtualConsole.on('warn', (m) => problems.push(`console.warn: ${m}`));
virtualConsole.on('jsdomError', (e) => problems.push(`jsdomError: ${String((e && e.message) || e)}`));
virtualConsole.on('log', () => {});

/** Unwrap a jsdom canvas element to its backing node-canvas for drawImage etc. */
function unwrap(arg) {
  return arg && arg._nodeCanvas ? arg._nodeCanvas : arg;
}

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
  beforeParse(window) {
    window.HTMLCanvasElement.prototype.getContext = function (type) {
      if (type !== '2d') return null; // no WebGL -> Phaser AUTO falls back to CANVAS
      if (!this._ctx) {
        const w = Math.max(this.width || 300, 1);
        const h = Math.max(this.height || 150, 1);
        this._nodeCanvas = nodeCanvas.createCanvas(w, h);
        this._ctx = this._nodeCanvas.getContext('2d');
        const el = this;
        // keep backing store in sync with element size
        const desc = { configurable: true };
        ['width', 'height'].forEach((prop) => {
          let val = prop === 'width' ? w : h;
          Object.defineProperty(el, prop, {
            ...desc,
            get: () => val,
            set: (v) => {
              val = Math.max(v | 0, 1);
              el._nodeCanvas[prop] = val;
            },
          });
        });
        Object.defineProperty(this._ctx, 'canvas', { get: () => el, configurable: true });
        const origDraw = this._ctx.drawImage.bind(this._ctx);
        this._ctx.drawImage = (img, ...rest) => origDraw(unwrap(img), ...rest);
        const origPattern = this._ctx.createPattern.bind(this._ctx);
        this._ctx.createPattern = (img, rep) => origPattern(unwrap(img), rep);
      }
      return this._ctx;
    };
    window.HTMLCanvasElement.prototype.toDataURL = function (...a) {
      return this._nodeCanvas ? this._nodeCanvas.toDataURL(...a) : 'data:,';
    };
    if (!window.CanvasRenderingContext2D) {
      window.CanvasRenderingContext2D = function CanvasRenderingContext2D() {};
    }
    // Phaser boots its default textures from base64 images; jsdom's Image
    // never loads, so swap in node-canvas's Image (supports data URIs).
    window.Image = nodeCanvas.Image;
    window.URL.createObjectURL = () => 'blob:fake';
    window.URL.revokeObjectURL = () => {};
    window.focus = () => {};
  },
});

const { window } = dom;
process.on('uncaughtException', (e) => problems.push(`uncaught: ${e.stack || e}`));
process.on('unhandledRejection', (e) => problems.push(`rejection: ${e}`));

function tap() {
  const canvas = window.document.querySelector('canvas');
  if (!canvas) return problems.push('no canvas found');
  canvas.dispatchEvent(new window.MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
  canvas.dispatchEvent(new window.MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));
}

setTimeout(tap, 1500); // Menu -> Game
setTimeout(tap, 2500); // reverse
setTimeout(tap, 3200); // reverse
setTimeout(() => {
  Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
  window.dispatchEvent(new window.Event('resize'));
}, 3800);

setTimeout(() => {
  const game = window.__ORBIT_DASH__;
  const active = game ? game.scene.getScenes(true).map((s) => s.scene.key) : [];
  // Reaching Game proves input works; reaching GameOver proves the
  // full loop (input -> collision -> end state) ran end to end.
  if (!active.includes('Game') && !active.includes('GameOver')) {
    problems.push(`expected Game/GameOver scene after taps, got: [${active.join(', ')}]`);
  }
}, 5000);

setTimeout(() => {
  const canvas = window.document.querySelector('canvas');
  if (problems.length) {
    console.log('SMOKE TEST FAILED:');
    [...new Set(problems)].slice(0, 15).forEach((p) => console.log(' -', p));
    process.exit(1);
  }
  console.log(`SMOKE TEST PASSED (canvas present: ${Boolean(canvas)})`);
  process.exit(0);
}, 6000);
