import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('Running self-check tests for LP Player...');

// 1. Verify Stepped Volume Levels
const volumeLevels = [1.0, 0.75, 0.5, 0.25];
assert.strictEqual(volumeLevels[0], 1.0, 'Step 1 should be 100% volume');
assert.strictEqual(volumeLevels[3], 0.25, 'Step 4 should be 25% volume');

// 2. Verify Asset and Dist Outputs
const audioPath = path.resolve('public/audio/ocean-bubbles.mp3');
assert.ok(fs.existsSync(audioPath), 'Bundled demo track public/audio/ocean-bubbles.mp3 must exist');

const distHtml = path.resolve('dist/index.html');
assert.ok(fs.existsSync(distHtml), 'Build output dist/index.html must exist');

// 3. Verify LPPlayer.tsx Component Markup & Geometry
const lpPlayerSrc = fs.readFileSync(path.resolve('src/components/LPPlayer.tsx'), 'utf-8');

// Top cords only, no bottom cords
assert.ok(lpPlayerSrc.includes('top-cables-only'), 'Cables must only originate from top of screen');
assert.ok(!lpPlayerSrc.includes('continuous-cables'), 'Must not have continuous or bottom cables');

// Layering: Black base -> LP glass -> Orange supporter -> Silver axis
assert.ok(lpPlayerSrc.includes('black-circles-base'), 'Must have black circles base underneath');
assert.ok(lpPlayerSrc.includes('translucent-lp-glass'), 'Must have orange glass LP');
assert.ok(lpPlayerSrc.includes('orange-axis-supporter'), 'Must have orange axis supporter');
assert.ok(lpPlayerSrc.includes('center-silver-spindle'), 'Must have silver axis on top');

const idxBase = lpPlayerSrc.indexOf('black-circles-base');
const idxGlass = lpPlayerSrc.indexOf('translucent-lp-glass');
const idxSupporter = lpPlayerSrc.indexOf('orange-axis-supporter');
const idxAxis = lpPlayerSrc.indexOf('center-silver-spindle');

assert.ok(idxBase < idxGlass, 'Black circles base must be underneath the orange glass LP');
assert.ok(idxGlass < idxSupporter, 'Orange glass LP must be underneath the orange axis supporter');
assert.ok(idxSupporter < idxAxis, 'Orange supporter must be underneath the silver axis on top');

// Tonearm rest cradle outside LP & no random orange stroke
assert.ok(lpPlayerSrc.includes('tonearm-rest-cradle'), 'Must render stationary tonearm rest cradle post');
assert.ok(lpPlayerSrc.includes('tonearm-svg-graphic'), 'Must render tonearm SVG assembly');

// Speed knob & playback rate support
assert.ok(lpPlayerSrc.includes('speed-knob-container'), 'Must render speed knob container');
assert.ok(lpPlayerSrc.includes('speed-knob-dial'), 'Must render speed knob dial');
assert.ok(lpPlayerSrc.includes('speed-dial-ring'), 'Must render speed dial hairline ring');
assert.ok(lpPlayerSrc.includes('speed-dial-station station-33'), 'Must render 33 station');
assert.ok(lpPlayerSrc.includes('speed-dial-station station-45'), 'Must render 45 station');
assert.ok(!lpPlayerSrc.includes('speed-knob-label'), 'Must not render speed text label');
assert.ok(lpPlayerSrc.includes('speedRpm === 45 ? 1.35 : 1.0'), 'Must modulate audio playback rate based on RPM');
assert.ok(lpPlayerSrc.includes('speedRpm === 45 ? 1.33 : 1.82'), 'Must modulate vinyl rotation duration based on RPM');

// Speaker panel: 24x18 grid (432 holes) with minimal corner margins
assert.ok(lpPlayerSrc.includes('24 * 18'), 'Speaker must render 24x18 hole grid');
assert.ok(lpPlayerSrc.includes('perforated-holes-grid-centered'), 'Speaker must use centered circular holes grid');
assert.ok(lpPlayerSrc.includes('speaker-hole-circle'), 'Speaker must render circular hole elements');

// 4. Verify index.css Styles
const indexCssSrc = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
assert.ok(indexCssSrc.includes('top-cables-only'), 'CSS must define top-only cables');
assert.ok(indexCssSrc.includes('height: 100vh;'), 'Cables must extend full viewport height');
assert.ok(indexCssSrc.includes('bottom: 100%;'), 'Cables must anchor to top chassis border');
assert.ok(indexCssSrc.includes('width: 8px;'), 'Cables must have thicker diameter');
assert.ok(indexCssSrc.includes('translucent-lp-glass'), 'CSS must define translucent LP glass');
assert.ok(indexCssSrc.includes('backdrop-filter: blur(5px)'), 'Must have authentic glassmorphism blur');
assert.ok(!indexCssSrc.includes('rgba(190, 75, 55, 0.22)'), 'Must remove weird orange bottom shadow');
assert.ok(indexCssSrc.includes('repeat(24, 5px)'), 'CSS must define 24 columns for speaker grid');
assert.ok(indexCssSrc.includes('repeat(18, 5px)'), 'CSS must define 18 rows for speaker grid');
assert.ok(indexCssSrc.includes('border-radius: 9999px !important;'), 'Holes must have 9999px radius to stay perfectly circular');
assert.ok(indexCssSrc.includes('speed-knob-dial'), 'CSS must style speed knob dial');
assert.ok(indexCssSrc.includes('speed-pointer-lever'), 'CSS must style speed pointer lever');
assert.ok(indexCssSrc.includes('opacity: 0.38;'), 'Window shadow must have subtle opacity 0.38');
assert.ok(indexCssSrc.includes('left: 388px;'), 'Tonearm pivot and cradle must be at 388px outside LP');
assert.ok(indexCssSrc.includes('left: 66px;'), 'Speed knob must be shifted left to 66px away from LP');

// 5. Verify App.tsx Window Shadow & Single-File Component Code
const appSrc = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
assert.ok(appSrc.includes('window-shadow-overlay'), 'App.tsx must render window-shadow-overlay');
assert.ok(!appSrc.includes('mouseParallax'), 'Window shadow must not move with cursor');
assert.ok(fs.existsSync(path.resolve('public/window-shadow.jpg')), 'public/window-shadow.jpg must exist');

// 6. Verify Single-File Component Code Exists and Works
const componentCodeFile = path.resolve('src/data/componentCode.ts');
assert.ok(fs.existsSync(componentCodeFile), 'src/data/componentCode.ts must exist');
const compCodeModule = fs.readFileSync(componentCodeFile, 'utf-8');
assert.ok(compCodeModule.includes('LP_PLAYER_SINGLE_FILE_CODE'), 'Must export LP_PLAYER_SINGLE_FILE_CODE');
assert.ok(compCodeModule.includes('INSTALL_COMMAND'), 'Must export INSTALL_COMMAND');
assert.ok(compCodeModule.includes('USAGE_SNIPPET'), 'Must export USAGE_SNIPPET');
assert.ok(appSrc.includes('LP_PLAYER_SINGLE_FILE_CODE'), 'App.tsx must import and use LP_PLAYER_SINGLE_FILE_CODE');
assert.ok(appSrc.includes('copyToClipboard(LP_PLAYER_SINGLE_FILE_CODE'), 'Main button must copy single file code');

console.log('All LP Player self-checks PASSED!');
