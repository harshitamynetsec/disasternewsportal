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
        boxShadow: 'none',
        background: '#16213e',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        opacity: isExpanded ? 1 : 0,
        padding: '0',
        marginLeft: 0,
      }}>
        <div className="site-toggles-container" style={{ width: '100%', alignItems: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 0, margin: 0, padding: 0 }}>
          {/* HP Sites Toggle */}
          <div className="individual-toggle" style={{ width: '100%', minHeight: 38, borderRadius: 0, padding: 0, margin: 0, boxShadow: 'none', border: 'none', background: '#16213e' }}>
            <label className="toggle-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexDirection: 'row', display: 'flex', padding: '0 8px', margin: 0 }} onClick={() => setShowHpSites(!showHpSites)} aria-label="Toggle HP Sites">
              <div className="toggle-icon" style={{ width: 20, height: 20 }}>
                {/* HP Site SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block', color: '#2d98da' }}>
                  <path d="M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z" fill="#2d98da" stroke="#2d98da" strokeWidth="0.7"/>
                </svg>
              </div>
              <span className="toggle-text" style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: 'left', whiteSpace: 'nowrap' }}>
                HP <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>({hpSiteCount})</span>
              </span>
              <div className={`toggle-switch${showHpSites ? ' active' : ''}`} style={{ width: 44, height: 22 }}> <div className={`toggle-slider${showHpSites ? ' active' : ''}`}></div> </div>
            </label>
          </div>

          {/* CoreBridge Sites Toggle */}
          <div className="individual-toggle corebridge" style={{ width: '100%', minHeight: 38, borderRadius: 0, padding: 0, margin: 0, boxShadow: 'none', border: 'none', background: '#16213e' }}>
            <label className="toggle-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexDirection: 'row', display: 'flex', padding: '0 8px', margin: 0 }} onClick={() => setShowCorebridgeSites(!showCorebridgeSites)} aria-label="Toggle CoreBridge Sites">
              <div className="toggle-icon" style={{ width: 20, height: 20 }}>
                {/* HP Site SVG for CoreBridge */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block', color: '#2d98da' }}>
                  <path d="M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z" fill="#2d98da" stroke="#2d98da" strokeWidth="0.7"/>
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