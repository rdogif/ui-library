# RDOUI

Interfaces worth interacting with. An experimental, dependency-free component collection with a cinematic image-sequence introduction.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the Vite URL (normally http://127.0.0.1:5173/ui-library/).

```sh
npm test
npm run build
npm run preview
```

## The experience

- All 98 supplied replacement JPEGs, unmodified, in `public/frames/` (1280 × 720). The original 19-frame set is preserved in `source-frames/original-19/`.
- Predecoded, time-based autoplay of frames 1–27 over 550ms. The title appears after frame 27 is drawn (the exact image previously held at frame 6).
- Native scrolling through a sticky hero maps progress to frames 27–98 and reverses without replaying the opening. No wheel interception.
- Reduced motion skips autoplay and the long pinned section; all navigation and controls remain available.
- Six real experiments: ASCII Ripple, Liquid Magnet, Magnetic Dock, Text Scramble, Morphing Toggle, Command Menu.
- Search, category filtering, theme switch, hash-based documentation routes, adjustable playgrounds, code tabs, and clipboard export.

## Use a component

Open a component and choose **Copy complete example**. Save the result as `index.html` and open it. The HTML includes styles and a self-contained mount function; it needs no Vite, gallery, external fonts, or animation libraries. Playground changes are included in exported code.

Or import a mount function from `src/components/experiments.js` and the `componentCSS` string from `src/components/styles.js`. Add the CSS to a style element, create a sized container with the `experiment` class, and call the function. Each returns a cleanup function. Call it before removing the container. Canvas uses ResizeObserver and capped device pixel ratio; ripple animation pauses offscreen and settles when idle.

```js
import { asciiRipple } from './src/components/experiments.js';
import { componentCSS } from './src/components/styles.js';
const style = document.createElement('style');
style.textContent = componentCSS;
document.head.append(style);
const cleanup = asciiRipple(document.querySelector('.experiment'), {
  strength: 22, damping: 5, density: 18, speed: 180,
  color: '#c6f66b', fontSize: 12, radius: 90,
  characters: '.:+*#@/\\-~'
});
```

Liquid Magnet includes classic, soft capsule, and dense glass presets. Its lighting and layered reflections use broadly supported CSS, with a translucent surface when backdrop-filter is unavailable. The surface attaches to the nearby cursor with a damped spring, deforms with velocity, and stays bounded inside its container. It releases and springs home when the pointer leaves. Touch and reduced motion use a stationary native button.

The command menu emits a bubbling `command` CustomEvent with the selected label in `event.detail`. Connect it to your application's navigation or actions. Dock selections expose `aria-pressed`; the toggle exposes `aria-checked`. These demo controls change local state and do not require a backend.

## Static hosting

The default Vite base is `/ui-library/`, suitable for `https://rdogif.github.io/ui-library/`. The generated `dist/` directory contains the complete static site. Hash routes work without server rewrites.

For GitHub Pages: set repository **Settings → Pages → Source → GitHub Actions**, then run the manual **Deploy to GitHub Pages** workflow. CI validates pushes without automatically publishing. For root hosting build with `VITE_BASE=/ npm run build` (PowerShell: `$env:VITE_BASE='/'; npm run build`).

## Verification

`npm test` checks scroll mapping, defaults, and all source frame files. Browser checks use Playwright:

```sh
npx playwright install chromium
npm run dev
# In a second terminal:
npm run test:browser
npm run test:touch
```

The browser suite checks autoplay, exact frame 27, forward/reverse scrolling, search and filters, live parameter/code changes, clipboard export, standalone examples, ripple movement, magnetic motion, keyboard commands and switches, mobile overflow, reduced motion, and direct-route reloads. Screenshots go to `test-results/` by default. Set `TEST_URL` for another serving URL and `SCREENSHOT_DIR` to select an artifact directory.

`src/animations/hero-sequence.js` owns hero lifecycle. Component mount functions return cleanup callbacks that release their animation frames, observers, and attached elements. No runtime packages are shipped. Canvas content is decorative; accessible native controls provide interaction elsewhere. No telemetry or third-party assets are loaded.

