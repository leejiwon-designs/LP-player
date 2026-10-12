// Test layout geometry for:
// Chassis: 720 x 440
// Left deck: width 432 (60%), height 440
// Right deck: width 288 (40%), height 440

const deckW = 432;
const deckH = 440;

// Platter
// Centered slightly left to leave ample room for tonearm & rest post on the right
const lpCx = 195;
const lpCy = 220;
const lpRadius = 185; // 370px diameter
const lpRightEdge = lpCx + lpRadius; // 195 + 185 = 380px

// Available space on right side of left deck: from 380px to 432px = 52px clearance!
console.log('LP Right edge at x =', lpRightEdge);
console.log('Clearance between LP and right divider =', deckW - lpRightEdge, 'px');

// Tonearm pivot
const pivotX = 394;
const pivotY = 56;
const armLength = 205; // length from pivot to stylus tip

// Rest position: angle = 0deg (pointing straight down towards rest post)
// Or angle = -2deg
function getArmTip(angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  // Rotation around pivot (pivotX, pivotY)
  // At angle 0, vector is (0, armLength)
  const tipX = pivotX - armLength * Math.sin(rad);
  const tipY = pivotY + armLength * Math.cos(rad);
  const distFromLpCenter = Math.hypot(tipX - lpCx, tipY - lpCy);
  return { tipX, tipY, distFromLpCenter };
}

const rest = getArmTip(-1);
console.log('\n--- REST POSITION (angle = -1deg) ---');
console.log(`Tip: (${rest.tipX.toFixed(1)}, ${rest.tipY.toFixed(1)})`);
console.log(`Distance from LP Center: ${rest.distFromLpCenter.toFixed(1)}px (LP Radius is ${lpRadius}px)`);
console.log(`Is OUTSIDE LP?`, rest.distFromLpCenter > lpRadius ? 'YES! Completely outside!' : 'NO');
console.log(`Clearance from LP outer rim: ${(rest.distFromLpCenter - lpRadius).toFixed(1)}px`);

const play = getArmTip(22);
console.log('\n--- PLAY POSITION (angle = 22deg) ---');
console.log(`Tip: (${play.tipX.toFixed(1)}, ${play.tipY.toFixed(1)})`);
console.log(`Distance from LP Center: ${play.distFromLpCenter.toFixed(1)}px`);
// Grooves are between radius 85px and 145px
console.log(`Is ON GROOVES (85px - 145px)?`, play.distFromLpCenter >= 85 && play.distFromLpCenter <= 145 ? 'YES! Perfectly centered on grooves!' : 'NO');
