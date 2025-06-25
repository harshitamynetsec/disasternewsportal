import React, { useState, useEffect } from "react";
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
import DisasterAnalysis from "./components/DisasterAnalysis";
import useSites from "./hooks/useSites";
import "./App.css";

function App() {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [focusedAlert, setFocusedAlert] = useState(null);

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
    geocodedAlerts, 
    isGeocoding, 
    geocodingProgress, 
    sortAlertsByDate,
    lastFetchTime
  } = useAlertData(showNotification);

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
    const alertsSection = document.querySelector('.alerts-section');
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

  return (
    <div className="App" style={{ backgroundColor: "#0c2d5c", color: "white", padding: "1rem" }}>
      {/* Sequential Notification System */}
      <NotificationManager 
        notifications={notifications} 
        onDismiss={dismissNotification}
      />

      {/* Disaster Analysis Panel */}
      <DisasterAnalysis 
        alerts={geocodedAlerts} 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
      />

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
        <h1 className="app-title">🌐 NSS Alert Portal</h1>
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

      {/* Alert Statistics */}
      {/* <AlertStats alerts={filteredAlerts} />

       <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0 16px 0' }}>
        <button onClick={scrollToMap} className="jump-to-map-btn">Jump to Map</button>
      </div> */}

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
        </div>
      )}
    </div>
  );
}

export default App;