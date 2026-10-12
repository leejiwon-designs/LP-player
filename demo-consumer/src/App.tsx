import LPPlayer from './LPPlayer';

export function App() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#faf8f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px',
      boxSizing: 'border-box',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0', color: '#1a191d', letterSpacing: '-0.02em' }}>
          Consumer Test Website
        </h1>
        <p style={{ fontSize: '14px', color: '#7a7570', margin: 0 }}>
          Verifying drop-in integration of single-file <code>LPPlayer.tsx</code> with zero external stylesheets
        </p>
      </div>

      {/* The single-file drop-in LPPlayer */}
      <LPPlayer
        audioSrc="/audio/ocean-bubbles.mp3"
        trackName="Ocean Bubble"
        artist="9jackjack8"
      />
    </div>
  );
}

export default App;
