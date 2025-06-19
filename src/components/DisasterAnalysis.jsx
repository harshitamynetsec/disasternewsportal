import React, { useState, useEffect, useMemo } from 'react';
import '../components/css/DisasterAnalysis.css';

const DisasterAnalysis = ({ alerts = [], isOpen, onClose }) => {
  const [selectedDisasterType, setSelectedDisasterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30'); // days
  const [viewMode, setViewMode] = useState('overview'); // overview, locations, trends

  // Extract disaster types from alerts using OSINT-style analysis
  const extractDisasterType = (alert) => {
    const text = `${alert.title} ${alert.description || ''}`.toLowerCase();
    
    // Comprehensive disaster type detection using OSINT patterns
    if (text.match(/earthquake|seismic|tremor|magnitude|richter|fault|epicenter/)) return 'earthquake';
    if (text.match(/flood|flooding|inundation|overflow|deluge|torrent/)) return 'flood';
    if (text.match(/fire|wildfire|blaze|burn|conflagration|inferno/)) return 'fire';
    if (text.match(/storm|hurricane|typhoon|cyclone|tornado|twister/)) return 'storm';
    if (text.match(/volcano|volcanic|eruption|lava|ash|magma/)) return 'volcanic';
    if (text.match(/tsunami|tidal wave|sea wave/)) return 'tsunami';
    if (text.match(/drought|arid|water shortage|dry spell/)) return 'drought';
    if (text.match(/landslide|avalanche|rockslide|mudslide/)) return 'landslide';
    if (text.match(/pandemic|epidemic|outbreak|virus|disease/)) return 'health';
    if (text.match(/terror|attack|bomb|explosion|shooting/)) return 'security';
    if (text.match(/accident|crash|collision|derail|spill/)) return 'accident';
    if (text.match(/cyber|hack|breach|malware|ransomware/)) return 'cyber';
    
    return 'other';
  };

  // Filter alerts based on time range
  const getFilteredAlerts = useMemo(() => {
    const now = new Date();
    const daysAgo = parseInt(timeFilter);
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    return alerts.filter(alert => {
      // Time filter
      const alertDate = new Date(alert.timestamp || alert.time || Date.now());
      if (alertDate < cutoffDate) return false;

      // Disaster type filter
      if (selectedDisasterType === 'all') return true;
      return extractDisasterType(alert) === selectedDisasterType;
    });
  }, [alerts, selectedDisasterType, timeFilter]);

  // Get disaster type statistics
  const disasterStats = useMemo(() => {
    const stats = {};
    getFilteredAlerts.forEach(alert => {
      const type = extractDisasterType(alert);
      stats[type] = (stats[type] || 0) + 1;
    });
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 types
  }, [getFilteredAlerts]);

  // Get top affected locations
  const topLocations = useMemo(() => {
    const locationStats = {};
    
    getFilteredAlerts.forEach(alert => {
      const country = alert.coordinates?.country || alert.country || 'Unknown';
      if (country === 'Unknown') return;
      
      if (!locationStats[country]) {
        locationStats[country] = {
          count: 0,
          disasters: {},
          severity: 0
        };
      }
      
      locationStats[country].count++;
      const disasterType = extractDisasterType(alert);
      locationStats[country].disasters[disasterType] = 
        (locationStats[country].disasters[disasterType] || 0) + 1;
      
      // Simple severity scoring based on keywords
      const text = `${alert.title} ${alert.description || ''}`.toLowerCase();
      if (text.match(/critical|severe|major|catastrophic|emergency/)) {
        locationStats[country].severity += 3;
      } else if (text.match(/moderate|significant|important/)) {
        locationStats[country].severity += 2;
      } else {
        locationStats[country].severity += 1;
      }
    });

    return Object.entries(locationStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10)
      .map(([country, data]) => ({
        country,
        ...data,
        avgSeverity: (data.severity / data.count).toFixed(1)
      }));
  }, [getFilteredAlerts]);

  // Get frequency trends (daily counts for the past period)
  const frequencyTrends = useMemo(() => {
    const days = parseInt(timeFilter);
    const trends = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayAlerts = getFilteredAlerts.filter(alert => {
        const alertDate = new Date(alert.timestamp || alert.time || Date.now());
        return alertDate >= dayStart && alertDate < dayEnd;
      });

      trends.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayAlerts.length,
        types: dayAlerts.reduce((acc, alert) => {
          const type = extractDisasterType(alert);
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      });
    }

    return trends;
  }, [getFilteredAlerts, timeFilter]);

  // Get disaster type options for dropdown
  const disasterTypes = useMemo(() => {
    const types = new Set();
    alerts.forEach(alert => {
      types.add(extractDisasterType(alert));
    });
    return Array.from(types).sort();
  }, [alerts]);

  const getDisasterIcon = (type) => {
    const icons = {
      earthquake: '🏔️',
      flood: '🌊',
      fire: '🔥',
      storm: '🌪️',
      volcanic: '🌋',
      tsunami: '🌊',
      drought: '🏜️',
      landslide: '⛰️',
      health: '🏥',
      security: '🚨',
      accident: '⚠️',
      cyber: '💻',
      other: '📢'
    };
    return icons[type] || '📢';
  };

  const getSeverityColor = (severity) => {
    if (severity >= 2.5) return '#e74c3c'; // High - Red
    if (severity >= 1.5) return '#f39c12'; // Medium - Orange
    return '#27ae60'; // Low - Green
  };

  const formatDisasterType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (!isOpen) return null;

  return (
    <div className="disaster-analysis-overlay" onClick={onClose}>
      <div className="disaster-analysis-panel" onClick={e => e.stopPropagation()}>
        <div className="disaster-analysis-header">
          <h2>🔍 Disaster Analysis</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="analysis-controls">
          <div className="control-group">
            <label>Disaster Type:</label>
            <select 
              value={selectedDisasterType} 
              onChange={e => setSelectedDisasterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {disasterTypes.map(type => (
                <option key={type} value={type}>
                  {getDisasterIcon(type)} {formatDisasterType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Time Range:</label>
            <select 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div className="view-mode-tabs">
            <button 
              className={viewMode === 'overview' ? 'active' : ''}
              onClick={() => setViewMode('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={viewMode === 'locations' ? 'active' : ''}
              onClick={() => setViewMode('locations')}
            >
              🌍 Locations
            </button>
            <button 
              className={viewMode === 'trends' ? 'active' : ''}
              onClick={() => setViewMode('trends')}
            >
              📈 Trends
            </button>
          </div>
        </div>

        <div className="analysis-content">
          {viewMode === 'overview' && (
            <div className="overview-section">
              <div className="stats-summary">
                <div className="stat-card">
                  <div className="stat-number">{getFilteredAlerts.length}</div>
                  <div className="stat-label">Total Alerts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{disasterStats.length}</div>
                  <div className="stat-label">Disaster Types</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{topLocations.length}</div>
                  <div className="stat-label">Affected Regions</div>
                </div>
              </div>

              <div className="disaster-types-chart">
                <h3>📊 Disaster Distribution</h3>
                {disasterStats.map(([type, count]) => {
                  const percentage = (count / getFilteredAlerts.length * 100).toFixed(1);
                  return (
                    <div key={type} className="chart-bar">
                      <div className="bar-label">
                        {getDisasterIcon(type)} {formatDisasterType(type)}
                        <span className="bar-count">({count})</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: type === 'earthquake' ? '#e74c3c' : 
                                           type === 'flood' ? '#3498db' :
                                           type === 'fire' ? '#e67e22' : '#95a5a6'
                          }}
                        ></div>
                        <span className="bar-percentage">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'locations' && (
            <div className="locations-section">
              <h3>🌍 Top Affected Locations</h3>
              <div className="locations-list">
                {topLocations.map((location, index) => (
                  <div key={location.country} className="location-item">
                    <div className="location-rank">#{index + 1}</div>
                    <div className="location-info">
                      <div className="location-name">{location.country}</div>
                      <div className="location-stats">
                        <span className="alert-count">{location.count} alerts</span>
                        <span 
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(location.avgSeverity) }}
                        >
                          Severity: {location.avgSeverity}
                        </span>
                      </div>
                      <div className="disaster-breakdown">
                        {Object.entries(location.disasters).map(([type, count]) => (
                          <span key={type} className="disaster-tag">
                            {getDisasterIcon(type)} {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'trends' && (
            <div className="trends-section">
              <h3>📈 Disaster Frequency Trends</h3>
              <div className="trends-chart">
                {(() => {
                  // Limit number of bars for readability
                  let displayTrends = frequencyTrends;
                  const maxBars = 14;
                  if (frequencyTrends.length > maxBars) {
                    // Sample evenly
                    const step = Math.ceil(frequencyTrends.length / maxBars);
                    displayTrends = frequencyTrends.filter((_, i) => i % step === 0 || i === frequencyTrends.length - 1);
                  }
                  const maxCount = Math.max(...displayTrends.map(t => t.count));
                  return displayTrends.map((trend, index) => {
                    const height = maxCount > 0 ? (trend.count / maxCount * 100) : 0;
                    // Only show every 2nd or 3rd label for clarity
                    let showLabel = true;
                    if (displayTrends.length > 10) {
                      showLabel = index % 2 === 0 || index === displayTrends.length - 1;
                    }
                    if (displayTrends.length > 12) {
                      showLabel = index % 3 === 0 || index === displayTrends.length - 1;
                    }
                    return (
                      <div key={index} className="trend-bar" style={{ gap: '2px' }}>
                        <div 
                          className="trend-fill"
                          style={{ height: `${height}%` }}
                          title={`${trend.date}: ${trend.count} alerts`}
                        ></div>
                        <div className="trend-label">
                          {showLabel ? trend.date : ''}
                        </div>
                        <div className="trend-count">{trend.count}</div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="trend-summary">
                <h4>📊 Analysis Summary</h4>
                <div className="summary-stats">
                  <div>
                    <strong>Average daily alerts:</strong> {
                      (getFilteredAlerts.length / parseInt(timeFilter)).toFixed(1)
                    }
                  </div>
                  <div>
                    <strong>Peak day:</strong> {
                      frequencyTrends.reduce((max, trend) => 
                        trend.count > max.count ? trend : max, 
                        { date: 'N/A', count: 0 }
                      ).date
                    }
                  </div>
                  <div>
                    <strong>Most active type:</strong> {
                      disasterStats.length > 0 ? 
                      `${getDisasterIcon(disasterStats[0][0])} ${formatDisasterType(disasterStats[0][0])}` : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterAnalysis;