// SlidingTogglePanel.js
import React, { useState } from 'react';
import './css/SlidingTogglePanel.css';

const SlidingTogglePanel = ({ 
  showHpSites, 
  setShowHpSites, 
  showCorebridgeSites, 
  setShowCorebridgeSites, 
  hpSiteCount, 
  corebridgeSiteCount 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`sliding-toggle-panel${isExpanded ? ' expanded' : ''}`}>
      {/* Toggle Button */}
      <button className="panel-toggle-btn" onClick={togglePanel} aria-label="Toggle Sites Panel">
        <svg 
          className={`toggle-arrow${isExpanded ? ' rotated' : ''}`}
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="18,15 12,9 6,15"></polyline>
        </svg>
        <span className="toggle-btn-text">Sites</span>
      </button>

      {/* Panel Content - only show when expanded */}
      <div className={`panel-content${isExpanded ? ' show' : ''}`} style={{
        display: isExpanded ? 'flex' : 'none',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        maxHeight: 130,
        minWidth: 210,
        maxWidth: 240,
        overflow: 'hidden',
        boxShadow: '0 2px 8px #2228',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        opacity: isExpanded ? 1 : 0,
        padding: '8px 0 8px 0',
      }}>
        <div className="site-toggles-container" style={{ width: '100%', alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* HP Sites Toggle */}
          <div className="individual-toggle" style={{ width: '95%', minHeight: 38, boxShadow: '0 1px 4px #3498db22', borderRadius: 10, padding: 0, marginBottom: 8 }}>
            <label className="toggle-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexDirection: 'row', display: 'flex', padding: '0 8px' }} onClick={() => setShowHpSites(!showHpSites)} aria-label="Toggle HP Sites">
              <div className="toggle-icon" style={{ width: 20, height: 20 }}>
                {/* HP Site SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block', color: '#fff', filter: 'drop-shadow(0 0 4px #00eaff99)' }}>
                  <defs>
                    <radialGradient id="hp-site-glow-toggle" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#aeefff" stopOpacity="1"/>
                      <stop offset="80%" stopColor="#2d98da" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#2d98da" stopOpacity="0.12"/>
                    </radialGradient>
                  </defs>
                  <circle cx="12" cy="12" r="11" fill="url(#hp-site-glow-toggle)" opacity="0.6"/>
                  <path d="M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z" fill="#fff" stroke="#2d98da" strokeWidth="0.7"/>
                </svg>
              </div>
              <span className="toggle-text" style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: 'left', whiteSpace: 'nowrap' }}>
                HP <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>({hpSiteCount})</span>
              </span>
              <div className={`toggle-switch${showHpSites ? ' active' : ''}`} style={{ width: 44, height: 22 }}> <div className={`toggle-slider${showHpSites ? ' active' : ''}`}></div> </div>
            </label>
          </div>

          {/* CoreBridge Sites Toggle */}
          <div className="individual-toggle corebridge" style={{ width: '95%', minHeight: 38, boxShadow: '0 1px 4px #e67e2222', borderRadius: 10, padding: 0 }}>
            <label className="toggle-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexDirection: 'row', display: 'flex', padding: '0 8px' }} onClick={() => setShowCorebridgeSites(!showCorebridgeSites)} aria-label="Toggle CoreBridge Sites">
              <div className="toggle-icon" style={{ width: 20, height: 20 }}>
                {/* CoreBridge Site SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block', color: '#fff', filter: 'drop-shadow(0 0 4px #ffa50099)' }}>
                  <defs>
                    <radialGradient id="cb-site-glow-toggle" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="#ffcc99" stopOpacity="1"/>
                      <stop offset="80%" stopColor="#ff8c00" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.12"/>
                    </radialGradient>
                  </defs>
                  <circle cx="12" cy="12" r="11" fill="url(#cb-site-glow-toggle)" opacity="0.6"/>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fff" stroke="#ff8c00" strokeWidth="0.7"/>
                </svg>
              </div>
              <span className="toggle-text" style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: 'left', whiteSpace: 'nowrap' }}>
                CB <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>({corebridgeSiteCount})</span>
              </span>
              <div className={`toggle-switch${showCorebridgeSites ? ' active' : ''}`} style={{ width: 44, height: 22 }}> <div className={`toggle-slider${showCorebridgeSites ? ' active' : ''}`}></div> </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingTogglePanel;