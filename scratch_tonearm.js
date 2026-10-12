const cx = 216, cy = 220; // LP center
const px = 384, py = 68;  // Pivot center
const L = 220; // Arm length
const R_outer = 200; // translucent halo
const R_grooves = 154; // charcoal disc

console.log('Distance from pivot to center:', Math.hypot(px - cx, py - cy));
for (let deg = -25; deg <= 35; deg += 5) {
  const rad = deg * Math.PI / 180;
  // In screen coords, positive rotation from vector (0, 1):
  // x = px - L * Math.sin(rad) [if positive deg rotates CCW vs CW: in standard CSS, rotate(deg) on (0, 1) -> (-sin, cos)]
  // Wait, let's verify standard CSS rotate:
  // vector (0, 1) rotated by +deg:
  // x' = 0 * cos(deg) - 1 * sin(deg) = -sin(deg) (if y is up)
  // But in screen coords, y is DOWN:
  // (x, y) = (0, 1) rotated by +deg:
  // [cos(t)  -sin(t)] [ 0 ] = [-sin(t)] -> so x is negative (to the left) if t > 0
  // [sin(t)   cos(t)] [ 1 ] = [ cos(t)] -> y is positive (down)
  // So positive degrees moves x left and y slightly up/down.
  const ax = px - L * Math.sin(rad);
  const ay = py + L * Math.cos(rad);
  const dist = Math.hypot(ax - cx, ay - cy);
  const isOutside = dist > R_outer;
  console.log(`deg=${deg.toString().padStart(3)}: tip=(${ax.toFixed(1)}, ${ay.toFixed(1)}), dist=${dist.toFixed(1)} | outside outer glass=${isOutside}, on grooves=${dist <= R_grooves && dist > 52}`);
}
