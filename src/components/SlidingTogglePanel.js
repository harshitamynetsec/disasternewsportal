// SlidingTogglePanel.js
import React, { useState } from 'react';
import './css/SlidingTogglePanel.css';

function ToggleSwitch({ checked, onChange, ariaLabel }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onChange}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onChange()}
      style={{
        width: 38,
        height: 22,
        borderRadius: 11,
        background: checked ? '#2176ae' : '#222b3a',
        border: checked ? '1.5px solid #2d98da' : '1.5px solid #444',
        boxShadow: checked ? '0 2px 8px #2d98da33' : 'none',
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block',
        marginRight: 8,
        verticalAlign: 'middle',
        transition: 'background 0.2s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid #1a3557',
          boxShadow: '0 2px 8px #2d98da22',
          transition: 'left 0.2s',
        }}
      />
    </div>
  );
}

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
        minHeight: 110,
        maxHeight: 150,
        minWidth: 240,
        maxWidth: 270,
        overflow: 'hidden',
        background: 'rgba(22, 33, 62, 0.82)',
        border: '1.5px solid rgba(80,180,255,0.25)',
        borderRadius: 18,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        opacity: isExpanded ? 1 : 0,
        padding: '18px 12px',
        marginLeft: 0,
      }}>
        <div className="site-toggles-container" style={{ width: '100%', alignItems: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', gap: 14, margin: 0, padding: 0 }}>
          {/* HP Sites Toggle */}
          <div className="individual-toggle" style={{ width: '100%', minHeight: 44, borderRadius: 12, padding: '0 4px 0 0', margin: 0, background: 'linear-gradient(90deg,rgba(45,152,218,0.10),rgba(45,152,218,0.04))', border: '1.5px solid #2d98da', display: 'flex', alignItems: 'center', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px 0 rgba(45,152,218,0.07)' }}>
            <label className="toggle-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexDirection: 'row', display: 'flex', padding: '0 0 0 4px', margin: 0, cursor: 'pointer' }} onClick={() => setShowHpSites(!showHpSites)} aria-label="Toggle HP Sites">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#e3f3ff', boxShadow: '0 2px 8px #2d98da22' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#2d98da' }}>
                    <path d="M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z" fill="#2d98da" stroke="#2d98da" strokeWidth="0.7"/>
                  </svg>
                </span>
                <span className="toggle-text" style={{ fontSize: 15, fontWeight: 700, minWidth: 40, textAlign: 'left', whiteSpace: 'nowrap', color: '#fff', letterSpacing: 0.5 }}>HP <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 400 }}>({hpSiteCount})</span></span>
              </div>
              {/* New robust toggle switch for HP */}
              <ToggleSwitch checked={showHpSites} onChange={() => setShowHpSites(!showHpSites)} ariaLabel="Toggle HP Sites" />
            </label>
          </div>

          {/* CoreBridge Sites Toggle */}
          <div className="individual-toggle corebridge" style={{ width: '100%', minHeight: 44, borderRadius: 12, padding: '0 4px 0 0', margin: 0, background: 'linear-gradient(90deg,rgba(45,152,218,0.10),rgba(45,152,218,0.04))', border: '1.5px solid #2d98da', display: 'flex', alignItems: 'center', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px 0 rgba(45,152,218,0.07)' }}>
            <label className="toggle-label" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexDirection: 'row', display: 'flex', padding: '0 0 0 4px', margin: 0, cursor: 'pointer' }} onClick={() => setShowCorebridgeSites(!showCorebridgeSites)} aria-label="Toggle CoreBridge Sites">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#e3f3ff', boxShadow: '0 2px 8px #2d98da22' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#2d98da' }}>
                    <path d="M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z" fill="#2d98da" stroke="#2d98da" strokeWidth="0.7"/>
                  </svg>
                </span>
                <span className="toggle-text" style={{ fontSize: 15, fontWeight: 700, minWidth: 40, textAlign: 'left', whiteSpace: 'nowrap', color: '#fff', letterSpacing: 0.5 }}>CB <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 400 }}>({corebridgeSiteCount})</span></span>
              </div>
              {/* New robust toggle switch for CB */}
              <ToggleSwitch checked={showCorebridgeSites} onChange={() => setShowCorebridgeSites(!showCorebridgeSites)} ariaLabel="Toggle CoreBridge Sites" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingTogglePanel;