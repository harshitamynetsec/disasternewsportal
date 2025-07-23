import React, { useState, useEffect, Suspense, lazy } from "react";
import MapView from "./components/MapView";
import AlertCard from "./components/AlertCard";
import SideMenu from "./components/SideMenu";
//import AlertStats from "./components/AlertStats";
import AlertFilter from "./components/AlertFilter";
import NotificationManager from "./components/NotificationManager";
import NotificationIcon from "./components/NotificationIcon";
import LoadingIndicator from "./components/LoadingIndicator";
import useNotifications from "./hooks/useNotifications";
import useAlertData from "./hooks/useAlertData";
import useSites from "./hooks/useSites";
import SlidingTogglePanel from './components/SlidingTogglePanel';
import './components/css/SlidingTogglePanel.css';
import NSSLogo from './NSS-LOGO.png';
import ProximityAlert from './components/ProximityAlert';
import ProximityAlertNotification from './components/ProximityAlertNotification';
import { useAuth } from './context/AuthContext';

import "./App.css";

const DisasterAnalysis = lazy(() => import("./components/DisasterAnalysis"));

// Disaster categorization logic - moved to App level for consistent processing
const categorizeDisaster = (alert) => {
  // Natural disaster keywords
  const naturalKeywords = [
    'earthquake', 'tsunami', 'flood', 'hurricane', 'typhoon', 'cyclone',
    'tornado', 'wildfire', 'fire', 'volcano', 'landslide', 'drought',
    'blizzard', 'avalanche', 'storm', 'lightning', 'hail', 'natural',
    'severe thunderstorm', 'weather'
  ];

  // Man-made disaster keywords
  const manMadeKeywords = [
    'explosion', 'accident', 'chemical', 'nuclear', 'oil spill', 'terrorist',
    'attack', 'bombing', 'industrial', 'man made', 'man-made', 'anthropogenic',
    'pollution', 'toxic', 'hazmat', 'cyber', 'infrastructure', 'incident'
  ];

  // Check multiple sources for disaster type
  const sources = [
    alert.title,
    alert.description,
    alert.type,
    alert.category,
    alert.analysis?.disaster_type,
    alert.analysis?.disaster_category
  ];

  for (const source of sources) {
    if (!source) continue;
    
    const text = source.toString().toLowerCase();
    
    // Direct match first
    if (text === 'natural' || text.includes('natural disaster')) {
      return 'natural';
    }
    if (text === 'man made' || text === 'man-made' || text.includes('man-made') || text.includes('anthropogenic')) {
      return 'man made';
    }
    
    // Keyword matching
    if (naturalKeywords.some(keyword => text.includes(keyword))) {
      return 'natural';
    }
    if (manMadeKeywords.some(keyword => text.includes(keyword))) {
      return 'man made';
    }
  }
  
  return 'unknown';
};

// Process alerts to add disaster categorization
const processAlerts = (rawAlerts) => {
  return rawAlerts.map(alert => {
    const disasterCategory = categorizeDisaster(alert);
    
    return {
      ...alert,
      analysis: {
        ...alert.analysis,
        disaster_type: disasterCategory,
        disaster_category: disasterCategory
      }
    };
  });
};

function App() {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [focusedAlert, setFocusedAlert] = useState(null);
  const [showHpSites, setShowHpSites] = useState(true);
  const [showCorebridgeSites, setShowCorebridgeSites] = useState(true);
  const [groupRadii, setGroupRadii] = useState({}); // { groupId: radius }
  
  const handleRadiusChange = (groupId, newRadius) => {
    setGroupRadii(prev => ({ ...prev, [groupId]: newRadius }));
  };
  
  const { user } = useAuth();
  const canEditGeofence = user?.permissions?.includes('write');

  // Get sites data from the useSites hook (only hp-sites route)
  const { 
    sites, 
    isLoading: isLoadingSites, 
    lastFetchTime: sitesLastFetchTime,
    refetch: refetchSites 
  } = useSites();

  // Custom hooks for clean separation of concerns
  const { 
    notifications, 
    notificationHistory, 
    unreadCount, 
    showNotification, 
    dismissNotification,
    markAllAsRead 
  } = useNotifications();
  
  // Pass showNotification to useAlertData
  const { 
    alerts, 
    geocodedAlerts: rawGeocodedAlerts, 
    isGeocoding, 
    geocodingProgress, 
    sortAlertsByDate,
    lastFetchTime
  } = useAlertData(showNotification, !isLoadingSites);

  // Process geocoded alerts to add disaster categorization
  const geocodedAlerts = React.useMemo(() => {
    if (rawGeocodedAlerts.length === 0) return [];
    return processAlerts(rawGeocodedAlerts);
  }, [rawGeocodedAlerts]);

  // Debug logging for disaster categorization
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && geocodedAlerts.length > 0) {
      const sampleAlert = geocodedAlerts[0];
      console.log('Sample processed alert:', {
        title: sampleAlert.title,
        disaster_type: sampleAlert.analysis?.disaster_type,
        disaster_category: sampleAlert.analysis?.disaster_category
      });
      
      // Count by disaster type
      const disasterStats = geocodedAlerts.reduce((acc, alert) => {
        const type = alert.analysis?.disaster_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      console.log('Disaster type distribution:', disasterStats);
    }
  }, [geocodedAlerts]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize filtered alerts when geocoded alerts are ready
  React.useEffect(() => {
    if (geocodedAlerts.length > 0 && filteredAlerts.length === 0) {
      setFilteredAlerts(geocodedAlerts);
    }
  }, [geocodedAlerts, filteredAlerts.length]);

  // Reset focusedAlert on mount to prevent sticky focus after reload
  useEffect(() => {
    setFocusedAlert(null);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleFilter = (data) => {
    const sortedFilteredData = sortAlertsByDate(data);
    setFilteredAlerts(sortedFilteredData);
  };

  // Calculate alerts with coordinates for map display
  const alertsWithCoordinates = filteredAlerts.filter(alert => {
    return alert.coordinates && 
           alert.coordinates.lat !== undefined && 
           alert.coordinates.lng !== undefined &&
           !isNaN(alert.coordinates.lat) && 
           !isNaN(alert.coordinates.lng);
  });

  // Calculate coordinate statistics
  const coordinateStats = alertsWithCoordinates.reduce((acc, alert) => {
    const source = alert.coordinates.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  console.log(`Current page: ${alertsWithCoordinates.length} alerts with coordinates out of ${filteredAlerts.length} total`);
  console.log(`Sites loaded: ${sites.length}`);

  const scrollToAlerts = () => {
    const alertsSection = document.querySelector('.alert-cards');
    if (alertsSection) {
      const yOffset = -80; // Offset to account for header and spacing
      const y = alertsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const scrollToMap = () => {
    const mapSection = document.querySelector('.map-section');
    if (mapSection) {
      const yOffset = -80; // Offset for sticky header
      const y = mapSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const handleAlertCardClick = (alert) => {
    if (alert.coordinates && 
        typeof alert.coordinates.lat === 'number' && 
        typeof alert.coordinates.lng === 'number') {
      setFocusedAlert(alert);
      scrollToMap();
      setTimeout(() => setFocusedAlert(null), 600); // Clear after focusing
    }
  };

  // Handler to toggle the analysis panel
  const toggleAnalysis = () => setIsAnalysisOpen(!isAnalysisOpen);

  const hpSiteCount = sites.filter(location => location.type === 'site' && location.source === 'hp').length;
  const corebridgeSiteCount = sites.filter(location => location.type === 'site' && location.source === 'corebridge').length;

  return (
    <>
      <ProximityAlertNotification groupRadii={groupRadii} canEditGeofence={canEditGeofence} />
      <div className="App" style={{ backgroundColor: "#0c2d5c", color: "white", padding: "1rem" }}>
        {/* Sequential Notification System */}
        <NotificationManager 
          notifications={notifications} 
          onDismiss={dismissNotification}
        />

        {/* Disaster Analysis Panel */}
        <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading analysis...</div>}>
          <DisasterAnalysis 
            alerts={geocodedAlerts} 
            isOpen={isAnalysisOpen} 
            onClose={() => setIsAnalysisOpen(false)} 
          />
        </Suspense>

        {/* Floating Analysis Button on the left */}
        <button 
          onClick={toggleAnalysis} 
          className={`analysis-float-btn${isAnalysisOpen ? ' hide' : ''}`}
          title="Open Disaster Analysis"
        >
          Disaster Analysis
        </button>

        {/* Header */}
        <div className="app-header" style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1rem", 
          height: "3rem",
          padding: "0 1rem"
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <img src={NSSLogo} alt="NKT Monitoring Logo" style={{ height: '2.4rem', width: '2.4rem', borderRadius: '0.4rem', background: '#fff' }} />
            <h1 className="app-title" style={{ margin: 0, fontSize: '2.1rem', fontWeight: 700, background: 'linear-gradient(90deg,#b6e0fe,#fbc2eb 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '1px' }}>NKT MONITORING</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button onClick={toggleMenu} className="hamburger-btn">☰</button>
            {isMobile && (
              <NotificationIcon 
                notificationHistory={notificationHistory}
                unreadCount={unreadCount}
                onMarkAllAsRead={markAllAsRead}
              />
            )}
          </div>
          <div className="desktop-filter">
            <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
          </div>
        </div>
        
        {/* Notification Icon for desktop (fixed position) */}
        {!isMobile && (
          <NotificationIcon 
            notificationHistory={notificationHistory}
            unreadCount={unreadCount}
            onMarkAllAsRead={markAllAsRead}
          />
        )}

        {/* Loading Indicator */}
        <LoadingIndicator isGeocoding={isGeocoding} geocodingProgress={geocodingProgress} />

        {/* Side Menu */}
        <SideMenu isOpen={isMenuOpen} onClose={toggleMenu}>
          <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
        </SideMenu>
      
        {/* Map */}
        <div style={{ marginBottom: "1.5rem" }}>
          <MapView 
            alerts={alertsWithCoordinates} 
            focusMarker={focusedAlert}
            sites={sites}
            showHpSites={showHpSites}
            showCorebridgeSites={showCorebridgeSites}
            groupRadii={groupRadii}
            handleRadiusChange={handleRadiusChange}
            canEditGeofence={canEditGeofence}
          />
          <div 
            className="scroll-indicator"
            onClick={scrollToAlerts}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                scrollToAlerts();
              }
            }}
          >
            Scroll down for news
            <span className="scroll-arrow" aria-hidden="true">↓</span>
          </div>
          <div className="map-footer">
            <div>📍 Mapped: {alertsWithCoordinates.length}/{filteredAlerts.length}</div>
            <div>🏢 Sites: {sites.length}</div>
            <div>🌏 Countries: {[...new Set(alertsWithCoordinates.map(alert => alert.coordinates?.country).filter(Boolean))].join(', ')}</div>
            {Object.keys(coordinateStats).length > 0 && (
              <div style={{ fontSize: "0.85em", opacity: 0.8 }}>
                📌 Sources: {Object.entries(coordinateStats).map(([source, count]) => 
                  `${source}: ${count}`
                ).join(', ')}
              </div>
            )}
            {lastFetchTime && (
              <div style={{ fontSize: "0.8em", opacity: 0.7 }}>
                🔄 Alerts updated: {lastFetchTime.toLocaleTimeString()}
              </div>
            )}
            {sitesLastFetchTime && (
              <div style={{ fontSize: "0.8em", opacity: 0.7 }}>
                🏗️ Sites updated: {sitesLastFetchTime.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        
        {/* Alert Cards */}
        <div className="alert-cards">
          {filteredAlerts.map((alert, index) => (
            <AlertCard 
              key={`${alert.title}-${alert.timestamp}-${index}`} 
              alert={alert}
              onCardClick={handleAlertCardClick}
            />
          ))}
        </div>

        {/* Debug Panel (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-panel">
            <h3>🛠️ Debug Info</h3>
            <p>Total Alerts: {alerts.length}</p>
            <p>Geocoded: {geocodedAlerts.length}</p>
            <p>Filtered: {filteredAlerts.length}</p>
            <p>With Coordinates: {alertsWithCoordinates.length}</p>
            <p>Sites: {sites.length}</p>
            <p>Sites Loading: {isLoadingSites ? 'Yes' : 'No'}</p>
            <p>Coordinate Sources: {JSON.stringify(coordinateStats)}</p>
            <p>Active Notifications: {notifications.length}</p>
            <p>Notification History: {notificationHistory.length}</p>
            <p>Unread Count: {unreadCount}</p>
            <p>Last Alerts Fetch: {lastFetchTime?.toLocaleString()}</p>
            <p>Last Sites Fetch: {sitesLastFetchTime?.toLocaleString()}</p>
            {/* New disaster type debug info */}
            <p>Disaster Types: {JSON.stringify(geocodedAlerts.reduce((acc, alert) => {
              const type = alert.analysis?.disaster_type || 'unknown';
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {}))}</p>
          </div>
        )}

        <SlidingTogglePanel
          showHpSites={showHpSites}
          setShowHpSites={setShowHpSites}
          showCorebridgeSites={showCorebridgeSites}
          setShowCorebridgeSites={setShowCorebridgeSites}
          hpSiteCount={hpSiteCount}
          corebridgeSiteCount={corebridgeSiteCount}
        />
      </div>
    </>
  );
}

export default App;
