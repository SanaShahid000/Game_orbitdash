# Orbit Dash

A one-tap 2D playable built with **Phaser 3**. A comet orbits a ring — tap anywhere to reverse its direction, collect **20 stars** to win, and avoid the asteroids that pile up as you go.
The one-touch control scheme was chosen deliberately: it's the ideal format for a mobile playable (works identically with touch and mouse, needs zero explanation, and fits any screen).


How to play

 **Tap / click anywhere** to reverse the comet's direction
 **Collect stars** — each one nudges your speed up
 **Avoid asteroids** — more appear as your score grows (up to 4)
**Win** at 20 stars; one asteroid hit ends the run
Your best score is saved between sessions

## Running the project

```bash
npm install

# dev server with rebuild-on-refresh at http://127.0.0.1:8000
npm run dev
npm run build
npm test
```

`dist/index.html` is the AppLovin deliverable: one fully self-contained HTML file (~1.2 MB, well under the 5 MB limit) that runs from anywhere — a web server, a playable ad container, or even a direct `file://` open.

## Architecture

```
src/
  main.js               entry point + Phaser config (RESIZE scale mode)
  config.js             palette, fonts, and all gameplay tuning in one place
  scenes/
    BootScene.js        generates every texture procedurally
    MenuScene.js        title, live orbit demo, instructions
    GameScene.js        core loop: orbit, collide, score, win/lose
    GameOverScene.js    shared end screen for win and game over
  objects/
    OrbitPlayer.js      the comet (reusable GameObject subclass)
    RingItem.js         stars & asteroids (reusable GameObject subclass)
    Spawner.js          item population + difficulty scaling
  utils/
    Starfield.js        parallax background, reused by all scenes
    Sfx.js              procedural WebAudio sound effects
    storage.js          safe localStorage wrapper (sandbox-proof)
build.js                bundles + inlines everything into dist/index.html
test/smoke.js           headless jsdom smoke test
```

Design decisions worth calling out:

- Responsiveness: the game uses pass per scene, so it genuinely reflows (ring radius, text positions, font sizes) on portrait phones, landscape tablets, and live window resizes — no letterboxing.
 Assets: every texture (comet, star, asteroid, particles) is generated at boot , and all audio is synthesized with WebAudio. The only embedded binary asset is the base64 favicon in the HTML. Nothing is fetched at runtime, which keeps the build tiny and satisfies the "embedded/base64 assets" requirement by construction.
Movement without a physics engine: the game is 1-dimensional (an angle on a ring), so positions and collisions are simple angular math  This is cheaper and more precise than arcade physics for this design.
No console errors: verified by the headless smoke test, which boots the actual production bundle, plays through Menu → Game → Game Over via simulated taps, and fails the build on any console error or warning.

Assumptions, trade-offs, and what I'd do with more time
Assumptions
- "Playable" was interpreted as a self-contained single-HTML build in the AppLovin style; no MRAID/ad-network SDK hooks were added since none were specified.
- Portrait-first, but fully playable in landscape.


## Requirements Checklist

2D Playable Game:Built a one-tap orbit arcade game.
Phaser 3:Developed using Phaser 3 with npm and bundled using esbuild.
Under 5 MB: Final build is a single **1.2 MB** HTML file.
Responsive Design: Adapts to different screen sizes using `Scale.RESIZE`.
Reusable Code: Organized with reusable scenes, game objects, and a central configuration.
Win & Game Over States: Collect **20 stars** to win; hitting an asteroid ends the game.
Game Instructions: Clear instructions are shown in the menu and during gameplay.
No Console Errors: Verified with an automated headless smoke test.
Embedded Assets:All graphics and audio are generated in code, with only a Base64 favicon included.
AppLovin Ready:Delivered as a fully self-contained `dist/index.html` file suitable for playable ads.
