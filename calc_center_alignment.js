const deckW = 432;
const deckH = 440;

// Test LP and tonearm center alignment in 432px wide chassis-left
for (let lpCx = 180; lpCx <= 205; lpCx += 5) {
  const lpR = 175; // 350px diameter
  const leftEdge = lpCx - lpR;
  
  for (let px = 350; px <= 380; px += 5) {
    const py = 58;
    const armL = 220; // slightly bigger arm
    
    for (let restDeg = -4; restDeg <= 0; restDeg += 2) {
      const rad = restDeg * Math.PI / 180;
      const tipX = px - armL * Math.sin(rad);
      const tipY = py + armL * Math.cos(rad);
      const dist = Math.hypot(tipX - lpCx, tipY - 220);
      const isOutsideLP = dist > lpR;
      const marginFromButtons = deckW - tipX;
      
      const rightEdge = Math.max(px + 20, tipX);
      const leftMargin = leftEdge;
      const rightMargin = deckW - rightEdge;
      const balanceDiff = Math.abs(leftMargin - rightMargin);
      
      if (isOutsideLP && marginFromButtons >= 40 && leftMargin >= 12 && balanceDiff < 20) {
        // Also check play position
        const playRad = 20 * Math.PI / 180;
        const playTipX = px - armL * Math.sin(playRad);
        const playTipY = py + armL * Math.cos(playRad);
        const playDist = Math.hypot(playTipX - lpCx, playTipY - 220);
        
        console.log(`lpCx=${lpCx}, px=${px}, restDeg=${restDeg}: leftMargin=${leftMargin.toFixed(1)}, rightMargin=${rightMargin.toFixed(1)} (diff=${balanceDiff.toFixed(1)}), outsideBy=${(dist - lpR).toFixed(1)}px, btnClearance=${marginFromButtons.toFixed(1)}px, playDist=${playDist.toFixed(1)}px`);
      }
    }
  }
}
