


import React, { useState } from "react";
import "./css/AlertStats.css";

const AlertStats = ({ alerts }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const total = alerts.length;

  // Function to get alert timestamp
  const getAlertTimestamp = (alert) => {
    if (alert.timestamp) {
      return new Date(alert.timestamp).getTime();
    }
    
    if (alert.time) {
      return new Date(alert.time).getTime();
    }
    
    // Try to extract UTC date from title (format: 05/06/2025 00:09 UTC)
    const utcMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+UTC/);
    if (utcMatch) {
      const [, date, time] = utcMatch;
      const [day, month, year] = date.split('/');
      return new Date(`${month}/${day}/${year} ${time} UTC`).getTime();
    }
    
    // Try to extract date from title
    const dateMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) {
      const [day, month, year] = dateMatch[1].split('/');
      return new Date(`${month}/${day}/${year}`).getTime();
    }
    
    return 0;
  };

  // Calculate today's alerts (last 24 hours)
  const now = new Date().getTime();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  const todaysAlerts = alerts.filter(alert => {
    const alertTime = getAlertTimestamp(alert);
    return alertTime > twentyFourHoursAgo;
  }).length;

  // Get critical alerts count
  const getCriticalAlertsCount = () => {
    const criticalKeywords = [
      'major', 'severe', 'critical', 'emergency', 'disaster',
      'catastrophic', 'devastating', 'massive', 'intense',
      'magnitude 6', 'magnitude 7', 'magnitude 8', 'magnitude 9',
      'category 4', 'category 5', 'extreme', 'unprecedented'
    ];
    
    return alerts.filter(alert => {
      const text = `${alert.title} ${alert.description}`.toLowerCase();
      return criticalKeywords.some(keyword => text.includes(keyword));
    }).length;
  };

  // const criticalAlerts = getCriticalAlertsCount();
  const criticalAlerts = "0";
// 

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`floating-stats-overlay ${isMinimized ? 'minimized' : ''}`}>
      <div className="stats-header">
        <h3>📊 Live Stats</h3>
        <button 
          className="minimize-btn" 
          onClick={toggleMinimize}
          aria-label={isMinimized ? "Expand stats" : "Minimize stats"}
        >
          {isMinimized ? '📈' : '📉'}
        </button>
      </div>
      
      <div className="floating-stats-cards">
        <div className="floating-stat-card total">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <div className="stat-number">{total}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
        </div>
        
        <div className="floating-stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{todaysAlerts}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        
        <div className="floating-stat-card critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-number">{criticalAlerts}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
      </div>
      
      {/* Pulse indicator for new alerts */}
      {todaysAlerts > 0 && (
        <div className="pulse-indicator">
          <div className="pulse-dot"></div>
        </div>
      )}
    </div>
  );
};

export default AlertStats;