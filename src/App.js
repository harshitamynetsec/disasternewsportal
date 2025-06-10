
import React, { useState, useEffect, useRef } from "react";
import MapView from "./components/MapView";
import AlertCard from "./components/AlertCard";
import SideMenu from "./components/SideMenu";
import AlertStats from "./components/AlertStats";
import AlertFilter from "./components/AlertFilter";
import GeocodingService from "./services/geocodingService";
import "./App.css";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [geocodedAlerts, setGeocodedAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);

  const geocodingServiceRef = useRef(null);

  // Function to sort alerts by date (most recent first)
  const sortAlertsByDate = (alertsArray) => {
    return [...alertsArray].sort((a, b) => {
      const getTimestamp = (alert) => {
        // If alert has a timestamp property
        if (alert.timestamp) {
          return new Date(alert.timestamp).getTime();
        }
        
        // If alert has a time property
        if (alert.time) {
          return new Date(alert.time).getTime();
        }
        
        // Try to extract UTC date from title (format: 05/06/2025 00:09 UTC)
        const utcMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+UTC/);
        if (utcMatch) {
          const [, date, time] = utcMatch;
          // Convert DD/MM/YYYY to MM/DD/YYYY for proper Date parsing
          const [day, month, year] = date.split('/');
          return new Date(`${month}/${day}/${year} ${time} UTC`).getTime();
        }
        
        // Try to extract date from title or description
        const dateMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split('/');
          return new Date(`${month}/${day}/${year}`).getTime();
        }
        
        // Default to very old date if no timestamp found
        return 0;
      };
      
      const timestampA = getTimestamp(a);
      const timestampB = getTimestamp(b);
      
      // Sort in descending order (newest first)
      return timestampB - timestampA;
    });
  };



  useEffect(() => {
    geocodingServiceRef.current = new GeocodingService();

    const fetchData = async () => {
      try {
        const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
        const data = await response.json();

        console.log("Raw data received:", data.slice(0, 2)); // Debug: check first 2 items

        // Sort the alerts by date before processing
        const sortedAlerts = sortAlertsByDate(data);
        setAlerts(sortedAlerts);
        
        // First, set alerts with existing coordinates immediately
        const alertsWithExistingCoords = sortedAlerts.map(alert => {
          let processedAlert = { ...alert };
          
          // Check if alert already has coordinates in various formats
          if (alert.coordinates && alert.coordinates.lat && alert.coordinates.lng) {
            processedAlert.coordinates = {
              lat: parseFloat(alert.coordinates.lat),
              lng: parseFloat(alert.coordinates.lng),
              country: alert.coordinates.country || alert.country || 'Unknown',
              source: 'provided'
            };
            console.log("Found coordinates in alert.coordinates:", processedAlert.coordinates);
          } else if (alert.lat && alert.lng) {
            processedAlert.coordinates = {
              lat: parseFloat(alert.lat),
              lng: parseFloat(alert.lng),
              country: alert.country || 'Unknown',
              source: 'provided'
            };
            console.log("Found coordinates in alert.lat/lng:", processedAlert.coordinates);
          } else if (alert.latitude && alert.longitude) {
            processedAlert.coordinates = {
              lat: parseFloat(alert.latitude),
              lng: parseFloat(alert.longitude),
              country: alert.country || 'Unknown',
              source: 'provided'
            };
            console.log("Found coordinates in alert.latitude/longitude:", processedAlert.coordinates);
          }
          
          return processedAlert;
        });

        setGeocodedAlerts(alertsWithExistingCoords);
        setFilteredAlerts(alertsWithExistingCoords);

        // Count how many already have coordinates
        const existingCoordsCount = alertsWithExistingCoords.filter(alert => alert.coordinates).length;
        console.log(`${existingCoordsCount} alerts already have coordinates`);

        // Now geocode the remaining alerts
        if (existingCoordsCount < sortedAlerts.length) {
          setIsGeocoding(true);
          setGeocodingProgress(0);

          const finalProcessedAlerts = [];
          let processed = 0;
          
          for (const alert of alertsWithExistingCoords) {
            let finalAlert = { ...alert };
            
            // If no coordinates yet, try geocoding
            if (!finalAlert.coordinates) {
              try {
                console.log(`Geocoding alert: ${alert.title}`);
                const geocoded = await geocodingServiceRef.current.geocodeAlert(alert);
                if (geocoded && geocoded.coordinates && geocoded.coordinates.lat && geocoded.coordinates.lng) {
                  finalAlert.coordinates = {
                    lat: parseFloat(geocoded.coordinates.lat),
                    lng: parseFloat(geocoded.coordinates.lng),
                    country: geocoded.coordinates.country || 'Unknown',
                    source: 'geocoded'
                  };
                  console.log("Geocoded successfully:", finalAlert.coordinates);
                } else {
                  console.log("Geocoding failed for:", alert.title);
                }
              } catch (error) {
                console.warn(`Failed to geocode alert: ${alert.title}`, error);
              }
            }
            
            finalProcessedAlerts.push(finalAlert);
            processed++;
            
            // Update progress
            const progress = Math.round((processed / sortedAlerts.length) * 100);
            setGeocodingProgress(progress);

            // Update the state periodically during geocoding
            if (processed % 5 === 0 || processed === sortedAlerts.length) {
              const sortedFinalAlerts = sortAlertsByDate(finalProcessedAlerts);
              setGeocodedAlerts([...sortedFinalAlerts]);
              setFilteredAlerts([...sortedFinalAlerts]);
            }
          }

          // Final update
          const sortedFinalAlerts = sortAlertsByDate(finalProcessedAlerts);
          setGeocodedAlerts(sortedFinalAlerts);
          setFilteredAlerts(sortedFinalAlerts);
          setIsGeocoding(false);

          const finalCoordsCount = sortedFinalAlerts.filter(alert => alert.coordinates).length;
          console.log(`Final result: ${finalCoordsCount} alerts have coordinates`);
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        setIsGeocoding(false);
      }
    };

    fetchData();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // };

  const handleFilter = (data) => {
    // Sort filtered data to maintain chronological order
    const sortedFilteredData = sortAlertsByDate(data);
    setFilteredAlerts(sortedFilteredData);
    // setCurrentPage(1);
  };

  // Separate alerts with coordinates (both provided and geocoded)
  const alertsWithCoordinates = filteredAlerts.filter(alert => {
    return alert.coordinates && 
           alert.coordinates.lat !== undefined && 
           alert.coordinates.lng !== undefined &&
           !isNaN(alert.coordinates.lat) && 
           !isNaN(alert.coordinates.lng);
  });
  
  console.log(`Current page: ${alertsWithCoordinates.length} alerts with coordinates out of ${filteredAlerts.length} total`);
  
  const totalAlertsWithCoordinates = filteredAlerts.filter(alert => 
    alert.coordinates && 
    alert.coordinates.lat !== undefined && 
    alert.coordinates.lng !== undefined &&
    !isNaN(alert.coordinates.lat) && 
    !isNaN(alert.coordinates.lng)
  ).length;

  // Enhanced statistics including coordinate sources
  const coordinateStats = alertsWithCoordinates.reduce((acc, alert) => {
    const source = alert.coordinates.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="App" style={{ backgroundColor: "#0c2d5c", color: "white", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🌐 NSS Alert Portal</h1>
        <button onClick={toggleMenu} className="hamburger-btn">☰</button>
        <div className="desktop-filter">
          <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
        </div>
      </div>

      {/* Enhanced Loader with Progress */}
      {isGeocoding && (
        <div style={{
          backgroundColor: "#1a4480",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          <div>🌍 Processing locations for map display... ({geocodingProgress}%)</div>
          <div style={{
            width: "100%",
            backgroundColor: "#0c2d5c",
            borderRadius: "4px",
            marginTop: "0.5rem"
          }}>
            <div style={{
              width: `${geocodingProgress}%`,
              backgroundColor: "#4CAF50",
              height: "8px",
              borderRadius: "4px",
              transition: "width 0.3s ease"
            }}></div>
          </div>
          <div className="runner-loader"></div>
        </div>
      )}

      {/* Side Menu */}
      <SideMenu isOpen={isMenuOpen} onClose={toggleMenu}>
        <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
      </SideMenu>

      {/* Map */}
      <div style={{ marginBottom: "1.5rem" }}>
        <MapView alerts={alertsWithCoordinates} />
        <div className="map-footer">
          <div>📍 Mapped: {alertsWithCoordinates.length}/{filteredAlerts.length}</div>
          <div>🌏 Countries: {[...new Set(alertsWithCoordinates.map(alert => alert.coordinates?.country).filter(Boolean))].join(', ')}</div>
          {Object.keys(coordinateStats).length > 0 && (
            <div style={{ fontSize: "0.85em", opacity: 0.8 }}>
              📌 Sources: {Object.entries(coordinateStats).map(([source, count]) => 
                `${source}: ${count}`
              ).join(', ')}
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
          />
        ))}
      </div>



      <AlertStats alerts={filteredAlerts} />

      {/* Enhanced Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>🛠️ Debug Info</h3>
          <p>Total: {alerts.length}</p>
          <p>Geocoded: {geocodedAlerts.length}</p>
          <p>Filtered: {filteredAlerts.length}</p>
          <p>With Coordinates: {alertsWithCoordinates.length}</p>
          <p>Coordinate Sources: {JSON.stringify(coordinateStats)}</p>
          <p>Cache: {JSON.stringify(geocodingServiceRef.current?.getCacheStats())}</p>
        </div>
      )}
    </div>
  );
}

export default App;
