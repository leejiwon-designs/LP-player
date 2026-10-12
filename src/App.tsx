import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import LPPlayer from './components/LPPlayer';
import GlassButton from './components/GlassButton';
import { INSTALL_COMMAND, USAGE_SNIPPET, LP_PLAYER_SINGLE_FILE_CODE } from './data/componentCode';

export const App: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [hasCopiedComponent, setHasCopiedComponent] = useState<boolean>(false);
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState<boolean>(false);
  const [hasCopiedInstall, setHasCopiedInstall] = useState<boolean>(false);

  const copyToClipboard = (text: string, type: 'component' | 'snippet' | 'install') => {
    navigator.clipboard.writeText(text);
    if (type === 'component') {
      setHasCopiedComponent(true);
      setTimeout(() => setHasCopiedComponent(false), 2200);
    } else if (type === 'snippet') {
      setHasCopiedSnippet(true);
      setTimeout(() => setHasCopiedSnippet(false), 2200);
    } else {
      setHasCopiedInstall(true);
      setTimeout(() => setHasCopiedInstall(false), 2200);
    }
  };

  const handleMainCopy = () => {
    copyToClipboard(LP_PLAYER_SINGLE_FILE_CODE, 'component');
    setIsDrawerOpen(true);
  };

  return (
    <main className="stage-wrapper">
      {/* Centered Turntable Showcase */}
      <LPPlayer />

      {/* Dramatic Architectural Window & Botanical Foliage Shadow Overlay (On top of player) */}
      <div className="window-shadow-overlay" aria-hidden="true" />

      {/* Floating Glass Copy Button: 1-Click Copy All-in-One Component Code & Open Drawer */}
      <div className="floating-glass-action">
        <GlassButton
          onClick={handleMainCopy}
          size="default"
        >
          {hasCopiedComponent ? 'COPIED CODE!' : 'COPY COMPONENT CODE'}
        </GlassButton>
      </div>

      {/* Right-Side Slide-Out Code Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              className="drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            >
              {/* Drawer Header */}
              <div className="drawer-header">
                <div>
                  <h2
                    className="drawer-title"
                    style={{ fontFamily: "'Doto', monospace", fontWeight: 800, color: '#ffffff' }}
                  >
                    LP PLAYER
                  </h2>
                  <p className="text-xs text-white mt-1" style={{ fontFamily: "'Inter', sans-serif", opacity: 0.85 }}>
                    Single-File Component • Framer Motion + Web Audio
                  </p>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close Drawer"
                >
                  <X size={18} color="#ffffff" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="drawer-body" style={{ fontFamily: "'Inter', sans-serif", color: '#ffffff' }}>
                {/* 1. Quick Install */}
                <div>
                  <h3
                    className="drawer-section-title-dots"
                    style={{ fontFamily: "'Doto', monospace", fontWeight: 800, color: '#ff5722' }}
                  >
                    1. INSTALLATION
                  </h3>
                  <div className="code-box">
                    <div className="code-box-header">
                      <span style={{ color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>Terminal</span>
                      <button
                        type="button"
                        className="code-copy-action-btn"
                        onClick={() => copyToClipboard(INSTALL_COMMAND, 'install')}
                      >
                        {hasCopiedInstall ? <Check size={13} color="#ffffff" /> : <Copy size={13} color="#ffffff" />}
                        <span style={{ color: '#ffffff' }}>{hasCopiedInstall ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="code-content">
                      <code style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                        {INSTALL_COMMAND}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* 2. Component Code (Single All-in-One File) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="drawer-section-title-dots"
                      style={{ fontFamily: "'Doto', monospace", fontWeight: 800, color: '#ff5722', marginBottom: 0 }}
                    >
                      2. COMPONENT (LPPlayer.tsx)
                    </h3>
                  </div>
                  <div className="code-box">
                    <div className="code-box-header">
                      <span style={{ color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>
                        LPPlayer.tsx (Single-File Drop-in)
                      </span>
                      <button
                        type="button"
                        className="code-copy-action-btn"
                        onClick={() => copyToClipboard(LP_PLAYER_SINGLE_FILE_CODE, 'component')}
                      >
                        {hasCopiedComponent ? <Check size={13} color="#ffffff" /> : <Copy size={13} color="#ffffff" />}
                        <span style={{ color: '#ffffff' }}>{hasCopiedComponent ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="code-content" style={{ maxHeight: 240 }}>
                      <code style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                        {LP_PLAYER_SINGLE_FILE_CODE}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* 3. Usage Code */}
                <div>
                  <h3
                    className="drawer-section-title-dots"
                    style={{ fontFamily: "'Doto', monospace", fontWeight: 800, color: '#ff5722' }}
                  >
                    3. USAGE
                  </h3>
                  <div className="code-box">
                    <div className="code-box-header">
                      <span style={{ color: '#ffffff', fontFamily: "'JetBrains Mono', monospace" }}>AudioPage.tsx</span>
                      <button
                        type="button"
                        className="code-copy-action-btn"
                        onClick={() => copyToClipboard(USAGE_SNIPPET, 'snippet')}
                      >
                        {hasCopiedSnippet ? <Check size={13} color="#ffffff" /> : <Copy size={13} color="#ffffff" />}
                        <span style={{ color: '#ffffff' }}>{hasCopiedSnippet ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="code-content" style={{ maxHeight: 180 }}>
                      <code style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                        {USAGE_SNIPPET}
                      </code>
                    </pre>
                  </div>
                </div>

                {/* 3. Audio Credit (All white text, Orange Dots Link) */}
                <div className="attribution-card">
                  <p className="font-semibold text-white mb-1" style={{ color: '#ffffff' }}>
                    Audio Attribution
                  </p>
                  <p style={{ color: '#ffffff' }}>
                    Track: <span style={{ color: '#ffffff', fontWeight: 600 }}>Ocean Bubbles (Frutiger Aqua Game)</span> by{' '}
                    <span style={{ color: '#ffffff' }}>9jackjack8</span>.
                  </p>
                  <a
                    href="https://pixabay.com/music/ambient-ocean-bubbles-frutiger-aqua-game-550245/"
                    target="_blank"
                    rel="noreferrer"
                    className="attribution-link-dots"
                    style={{ fontFamily: "'Doto', monospace", color: '#ff5722', fontWeight: 700 }}
                  >
                    <span>View on Pixabay</span>
                    <ExternalLink size={12} color="#ff5722" />
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default App;
