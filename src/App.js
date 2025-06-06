

// // src/App.js
// import React, { useState, useEffect, useRef } from "react";
// import MapView from "./components/MapView";
// import AlertCard from "./components/AlertCard";
// import SideMenu from "./components/SideMenu";
// import AlertStats from "./components/AlertStats";
// import AlertFilter from "./components/AlertFilter";
// import GeocodingService from "./services/geocodingService";
// import "./App.css";

// function App() {
//   const [alerts, setAlerts] = useState([]);
//   const [geocodedAlerts, setGeocodedAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isGeocoding, setIsGeocoding] = useState(false);
//   const [geocodingProgress, setGeocodingProgress] = useState(0);
//   const alertsPerPage = 10;

//   const geocodingServiceRef = useRef(null);

//   // Function to sort alerts by date (most recent first)
//   const sortAlertsByDate = (alertsArray) => {
//     return [...alertsArray].sort((a, b) => {
//       const getTimestamp = (alert) => {
//         // If alert has a timestamp property
//         if (alert.timestamp) {
//           return new Date(alert.timestamp).getTime();
//         }
        
//         // If alert has a time property
//         if (alert.time) {
//           return new Date(alert.time).getTime();
//         }
        
//         // Try to extract UTC date from title (format: 05/06/2025 00:09 UTC)
//         const utcMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+UTC/);
//         if (utcMatch) {
//           const [, date, time] = utcMatch;
//           // Convert DD/MM/YYYY to MM/DD/YYYY for proper Date parsing
//           const [day, month, year] = date.split('/');
//           return new Date(`${month}/${day}/${year} ${time} UTC`).getTime();
//         }
        
//         // Try to extract date from title or description
//         const dateMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})/);
//         if (dateMatch) {
//           const [day, month, year] = dateMatch[1].split('/');
//           return new Date(`${month}/${day}/${year}`).getTime();
//         }
        
//         // Default to very old date if no timestamp found
//         return 0;
//       };
      
//       const timestampA = getTimestamp(a);
//       const timestampB = getTimestamp(b);
      
//       // Sort in descending order (newest first)
//       return timestampB - timestampA;
//     });
//   };

//   useEffect(() => {
//     geocodingServiceRef.current = new GeocodingService();

//     const fetchData = async () => {
//       try {
//         const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
//         const data = await response.json();

//         // Sort the alerts by date before setting them
//         const sortedAlerts = sortAlertsByDate(data);
//         setAlerts(sortedAlerts);
//         setIsGeocoding(true);
//         setGeocodingProgress(0);

//         const geocodedData = await geocodingServiceRef.current.geocodeAlerts(sortedAlerts, (progress) => {
//           setGeocodingProgress(prev => Math.max(prev, progress));
//         });

//         // Sort geocoded data as well to maintain order
//         const sortedGeocodedData = sortAlertsByDate(geocodedData);
//         setGeocodedAlerts(sortedGeocodedData);
//         setFilteredAlerts(sortedGeocodedData);
//         setIsGeocoding(false);
//       } catch (error) {
//         console.error("Failed to fetch alerts:", error);
//         setIsGeocoding(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
//   const startIdx = (currentPage - 1) * alertsPerPage;
//   const currentAlerts = filteredAlerts.slice(startIdx, startIdx + alertsPerPage);

//   const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleFilter = (data) => {
//     // Sort filtered data to maintain chronological order
//     const sortedFilteredData = sortAlertsByDate(data);
//     setFilteredAlerts(sortedFilteredData);
//     setCurrentPage(1);
//   };

//   const currentAlertsWithCoordinates = currentAlerts.filter(alert => alert.coordinates);
//   const totalAlertsWithCoordinates = filteredAlerts.filter(alert => alert.coordinates).length;
//   const currentPageStats = {
//     total: currentAlerts.length,
//     withCoordinates: currentAlertsWithCoordinates.length,
//     countries: [...new Set(currentAlertsWithCoordinates.map(alert => alert.coordinates?.country).filter(Boolean))]
//   };

//   return (
//     <div className="App" style={{ backgroundColor: "#0c2d5c", color: "white", padding: "1rem" }}>
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//         <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🌐 NSS Alert Portal</h1>
//         <button onClick={toggleMenu} className="hamburger-btn">☰</button>
//         <div className="desktop-filter">
//           <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
//         </div>
//       </div>

//       {/* Loader */}
//       {isGeocoding && (
//         <div style={{
//           backgroundColor: "#1a4480",
//           padding: "1rem",
//           borderRadius: "8px",
//           marginBottom: "1rem",
//           textAlign: "center"
//         }}>
//           <div>🌍 Processing worldwide locations for map display...</div>
//           <div className="runner-loader"></div>
//         </div>
//       )}

//       {/* Side Menu */}
//       <SideMenu isOpen={isMenuOpen} onClose={toggleMenu}>
//         <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
//       </SideMenu>

//       {/* Map */}
//       <div style={{ marginBottom: "1.5rem" }}>
//         <MapView alerts={currentAlertsWithCoordinates} />
//         <div className="map-footer">
//           <div>📍 <strong>Page {currentPage}</strong>: {currentPageStats.withCoordinates}/{currentPageStats.total} mapped</div>
//           <div>🌏 Countries: {currentPageStats.countries.join(', ')}</div>
//           <div>📊 Total Mapped: {totalAlertsWithCoordinates}/{filteredAlerts.length}</div>
//         </div>
//       </div>

//       {/* Alert Cards */}
//       <div className="alert-cards">
//         {currentAlerts.map((alert, index) => (
//           <AlertCard key={`${alert.title}-${alert.timestamp}-${index}`} alert={alert} />
//         ))}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="pagination">
//           <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>⏮ First</button>
//           <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>⬅ Prev</button>
//           <span>Page {currentPage} of {totalPages}</span>
//           <select value={currentPage} onChange={(e) => handlePageChange(Number(e.target.value))}>
//             {Array.from({ length: totalPages }, (_, i) => (
//               <option key={i + 1} value={i + 1}>Go to Page {i + 1}</option>
//             ))}
//           </select>
//           <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next ➡</button>
//           <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last ⏭</button>
//         </div>
//       )}

//       <AlertStats alerts={filteredAlerts} />

//       {/* Debug */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="debug-panel">
//           <h3>🛠️ Debug Info</h3>
//           <p>Total: {alerts.length}</p>
//           <p>Geocoded: {geocodedAlerts.length}</p>
//           <p>Filtered: {filteredAlerts.length}</p>
//           <p>Current Page: {currentAlerts.length}</p>
//           <p>With Coordinates: {currentAlertsWithCoordinates.length}</p>
//           <p>Cache: {JSON.stringify(geocodingServiceRef.current?.getCacheStats())}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

// src/App.js
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const alertsPerPage = 10;

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

  // Function to process alerts and handle coordinates
  const processAlertsWithCoordinates = async (alertsArray) => {
    const processedAlerts = [];
    
    for (const alert of alertsArray) {
      let processedAlert = { ...alert };
      
      // Check if alert already has coordinates
      if (alert.coordinates && alert.coordinates.lat && alert.coordinates.lng) {
        // Use existing coordinates
        processedAlert.coordinates = {
          ...alert.coordinates,
          source: 'provided'
        };
      } else if (alert.lat && alert.lng) {
        // Handle case where coordinates are directly on the alert object
        processedAlert.coordinates = {
          lat: parseFloat(alert.lat),
          lng: parseFloat(alert.lng),
          country: alert.country || 'Unknown',
          source: 'provided'
        };
      } else {
        // No coordinates provided, need to geocode
        try {
          const geocoded = await geocodingServiceRef.current.geocodeAlert(alert);
          if (geocoded && geocoded.coordinates) {
            processedAlert.coordinates = {
              ...geocoded.coordinates,
              source: 'geocoded'
            };
          }
        } catch (error) {
          console.warn(`Failed to geocode alert: ${alert.title}`, error);
          // Alert will remain without coordinates
        }
      }
      
      processedAlerts.push(processedAlert);
    }
    
    return processedAlerts;
  };

  useEffect(() => {
    geocodingServiceRef.current = new GeocodingService();

    const fetchData = async () => {
      try {
        const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
        const data = await response.json();

        // Sort the alerts by date before processing
        const sortedAlerts = sortAlertsByDate(data);
        setAlerts(sortedAlerts);
        setIsGeocoding(true);
        setGeocodingProgress(0);

        // Process alerts to handle both provided and geocoded coordinates
        const processedAlerts = [];
        let processed = 0;
        
        for (const alert of sortedAlerts) {
          let processedAlert = { ...alert };
          
          // Check if alert already has coordinates
          if (alert.coordinates && alert.coordinates.lat && alert.coordinates.lng) {
            // Use existing coordinates
            processedAlert.coordinates = {
              ...alert.coordinates,
              source: 'provided'
            };
          } else if (alert.lat && alert.lng) {
            // Handle case where coordinates are directly on the alert object
            processedAlert.coordinates = {
              lat: parseFloat(alert.lat),
              lng: parseFloat(alert.lng),
              country: alert.country || 'Unknown',
              source: 'provided'
            };
          } else {
            // No coordinates provided, need to geocode
            try {
              const geocoded = await geocodingServiceRef.current.geocodeAlert(alert);
              if (geocoded && geocoded.coordinates) {
                processedAlert.coordinates = {
                  ...geocoded.coordinates,
                  source: 'geocoded'
                };
              }
            } catch (error) {
              console.warn(`Failed to geocode alert: ${alert.title}`, error);
              // Alert will remain without coordinates
            }
          }
          
          processedAlerts.push(processedAlert);
          processed++;
          
          // Update progress
          const progress = Math.round((processed / sortedAlerts.length) * 100);
          setGeocodingProgress(progress);
        }

        // Sort processed data to maintain chronological order
        const sortedProcessedAlerts = sortAlertsByDate(processedAlerts);
        setGeocodedAlerts(sortedProcessedAlerts);
        setFilteredAlerts(sortedProcessedAlerts);
        setIsGeocoding(false);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        setIsGeocoding(false);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const startIdx = (currentPage - 1) * alertsPerPage;
  const currentAlerts = filteredAlerts.slice(startIdx, startIdx + alertsPerPage);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilter = (data) => {
    // Sort filtered data to maintain chronological order
    const sortedFilteredData = sortAlertsByDate(data);
    setFilteredAlerts(sortedFilteredData);
    setCurrentPage(1);
  };

  // Separate alerts with coordinates (both provided and geocoded)
  const currentAlertsWithCoordinates = currentAlerts.filter(alert => 
    alert.coordinates && alert.coordinates.lat && alert.coordinates.lng
  );
  
  const totalAlertsWithCoordinates = filteredAlerts.filter(alert => 
    alert.coordinates && alert.coordinates.lat && alert.coordinates.lng
  ).length;

  // Enhanced statistics including coordinate sources
  const coordinateStats = currentAlertsWithCoordinates.reduce((acc, alert) => {
    const source = alert.coordinates.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const currentPageStats = {
    total: currentAlerts.length,
    withCoordinates: currentAlertsWithCoordinates.length,
    coordinateStats: coordinateStats,
    countries: [...new Set(currentAlertsWithCoordinates.map(alert => alert.coordinates?.country).filter(Boolean))]
  };

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
        <MapView alerts={currentAlertsWithCoordinates} />
        <div className="map-footer">
          <div>📍 <strong>Page {currentPage}</strong>: {currentPageStats.withCoordinates}/{currentPageStats.total} mapped</div>
          <div>🌏 Countries: {currentPageStats.countries.join(', ')}</div>
          <div>📊 Total Mapped: {totalAlertsWithCoordinates}/{filteredAlerts.length}</div>
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
        {currentAlerts.map((alert, index) => (
          <AlertCard 
            key={`${alert.title}-${alert.timestamp}-${index}`} 
            alert={alert}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>⏮ First</button>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>⬅ Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <select value={currentPage} onChange={(e) => handlePageChange(Number(e.target.value))}>
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>Go to Page {i + 1}</option>
            ))}
          </select>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next ➡</button>
          <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last ⏭</button>
        </div>
      )}

      <AlertStats alerts={filteredAlerts} />

      {/* Enhanced Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>🛠️ Debug Info</h3>
          <p>Total: {alerts.length}</p>
          <p>Geocoded: {geocodedAlerts.length}</p>
          <p>Filtered: {filteredAlerts.length}</p>
          <p>Current Page: {currentAlerts.length}</p>
          <p>With Coordinates: {currentAlertsWithCoordinates.length}</p>
          <p>Coordinate Sources: {JSON.stringify(coordinateStats)}</p>
          <p>Cache: {JSON.stringify(geocodingServiceRef.current?.getCacheStats())}</p>
        </div>
      )}
    </div>
  );
}

export default App;