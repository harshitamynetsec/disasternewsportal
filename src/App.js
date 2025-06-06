// import React, { useState, useEffect } from "react";
// import MapView from "./components/MapView";
// import AlertCard from "./components/AlertCard";
// import SideMenu from "./components/SideMenu";
// import AlertStats from "./components/AlertStats";
// import AlertFilter from "./components/AlertFilter";
// import "./App.css";

// function App() {
//   const [alerts, setAlerts] = useState([]);
//   const [filteredAlerts, setFilteredAlerts] = useState([]);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const alertsPerPage = 10;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
//         const data = await response.json();
//         console.log("Fetched alerts data:", data);
//         setAlerts(data);
//         setFilteredAlerts(data);
//       } catch (error) {
//         console.error("Failed to fetch alerts:", error);
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
//     window.scrollTo({ top: 0, behavior: "smooth" }); // scroll to top
//   };

//   const handleFilter = (data) => {
//     setFilteredAlerts(data);
//     setCurrentPage(1);
//   };

//   return (
//     <div className="App" style={{ backgroundColor: "#0c2d5c", color: "white", padding: "1rem" }}>
//       {/* Header */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//         <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🌐 Portal</h1>
//         <button onClick={toggleMenu} className="hamburger-btn" aria-label="Open filter menu">☰</button>
//         <div className="desktop-filter">
//           <AlertFilter alerts={alerts} onFilter={handleFilter} />
//         </div>
//       </div>

//       {/* Side Menu (mobile) */}
//       <SideMenu isOpen={isMenuOpen} onClose={toggleMenu}>
//         <AlertFilter alerts={alerts} onFilter={handleFilter} />
//       </SideMenu>

//       {/* Map */}
//       <div style={{ marginBottom: "1.5rem" }}>
//         <MapView alerts={filteredAlerts} />
//       </div>

//       {/* Alert Cards */}
//       <div style={{ padding: "0 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
//         {currentAlerts.map((alert, index) => (
//           <AlertCard key={`${alert.title}-${alert.timestamp}-${index}`} alert={alert} />
//         ))}
//       </div>

//       {/* Pagination */}
//       <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
//         <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>⏮ First</button>
//         <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>⬅ Prev</button>

//         <span>Page {currentPage} of {totalPages}</span>

//         <select
//           value={currentPage}
//           onChange={(e) => handlePageChange(Number(e.target.value))}
//           style={{ padding: "0.3rem", borderRadius: "5px" }}
//         >
//           {Array.from({ length: totalPages }, (_, i) => (
//             <option key={i + 1} value={i + 1}>
//               Go to Page {i + 1}
//             </option>
//           ))}
//         </select>

//         <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next ➡</button>
//         <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last ⏭</button>
//       </div>

//       {/* Stats */}
//       <AlertStats alerts={filteredAlerts} />
//     </div>
//   );
// }

// export default App;













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

//   // Use a ref to preserve access outside useEffect
//   const geocodingServiceRef = useRef(null);

//   useEffect(() => {
//     geocodingServiceRef.current = new GeocodingService();
//     const geocodingService = geocodingServiceRef.current;

//     const fetchData = async () => {
//       try {
//         console.log("🔄 Fetching alerts from API...");
//         const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
//         const data = await response.json();
//         console.log(`📡 Fetched ${data.length} alerts from API`);

//         setAlerts(data);

//         console.log("🌍 Starting worldwide geocoding process...");
//         setIsGeocoding(true);
//         setGeocodingProgress(0);

//         const geocodedData = await geocodingService.geocodeAlerts(
//           data,
//           (progress) => {
//             console.log(`🌍 Geocoding progress: ${Math.round(progress)}%`);
//             setGeocodingProgress(prev => Math.max(prev, progress));
// ;
//           }
//         );

//         console.log("✅ Geocoding completed!");
//         setGeocodedAlerts(geocodedData);
//         setFilteredAlerts(geocodedData);
//         setIsGeocoding(false);

//         const successCount = geocodedData.filter(alert => alert.coordinates).length;
//         const countries = [...new Set(geocodedData.filter(alert => alert.coordinates).map(alert => alert.coordinates.country))];
//         console.log(`📊 Final stats: ${successCount}/${data.length} alerts geocoded across ${countries.length} countries`);
//       } catch (error) {
//         console.error("❌ Failed to fetch alerts:", error);
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
//     console.log(`📄 Changed to page ${page}`);
//   };

//   const handleFilter = (data) => {
//     setFilteredAlerts(data);
//     setCurrentPage(1);
//     console.log(`🔍 Filtered to ${data.length} alerts, reset to page 1`);
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
//         <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🌐 Global Portal</h1>
//         <button onClick={toggleMenu} className="hamburger-btn" aria-label="Open filter menu">☰</button>
//         <div className="desktop-filter">
//           <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
//         </div>
//       </div>

// {/*       
//        {isGeocoding && (
//         <div style={{
//           backgroundColor: "#1a4480",
//           padding: "1rem",
//           borderRadius: "8px",
//           marginBottom: "1rem",
//           textAlign: "center"
//         }}>
//           <div>🌍 Processing worldwide locations for map display...</div>
//           <div style={{
//             backgroundColor: "#0c2d5c",
//             height: "20px",
//             borderRadius: "10px",
//             overflow: "hidden",
//             marginTop: "0.5rem"
//           }}>
//             <div style={{
//               backgroundColor: "#4CAF50",
//               height: "100%",
//               width: `${geocodingProgress}%`,
//               transition: "width 0.3s ease"
//             }}></div>
//           </div>
//           <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
//             {Math.round(geocodingProgress)}% Complete
//           </div>
//         </div>
//       )}   */}

// {isGeocoding && (
//   <div style={{ 
//     backgroundColor: "#1a4480", 
//     padding: "1rem", 
//     borderRadius: "8px", 
//     marginBottom: "1rem",
//     textAlign: "center"
//   }}>
//     <div style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
//       🌍 Processing worldwide locations for map display...
//     </div>
//     <div className="runner-loader"></div>
//   </div>
// )}





//       {/* Side Menu (mobile) */}
//       <SideMenu isOpen={isMenuOpen} onClose={toggleMenu}>
//         <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
//       </SideMenu>

//       {/* Map */}
//       <div style={{ marginBottom: "1.5rem" }}>
//         <MapView alerts={currentAlertsWithCoordinates} />
//         <div style={{
//           fontSize: "0.9rem",
//           color: "#ccc",
//           textAlign: "center",
//           marginTop: "0.5rem",
//           backgroundColor: "#1a4480",
//           padding: "0.5rem",
//           borderRadius: "5px"
//         }}>
//           <div>
//             📍 <strong>Page {currentPage}</strong>: Showing {currentPageStats.withCoordinates} of {currentPageStats.total} alerts on map
//           </div>
//           {currentPageStats.countries.length > 0 && (
//             <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
//               🌏 Countries on this page: {currentPageStats.countries.join(', ')}
//             </div>
//           )}
//           <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
//             📊 Total: {totalAlertsWithCoordinates} of {filteredAlerts.length} alerts have locations
//             {isGeocoding && " (processing more locations...)"}
//           </div>
//         </div>
//       </div>

//       {/* Alert Cards */}
//       <div style={{ padding: "0 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
//         {currentAlerts.map((alert, index) => (
//           <AlertCard
//             key={`${alert.title}-${alert.timestamp}-${index}`}
//             alert={alert}
//           />
//         ))}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div style={{
//           marginTop: "1.5rem",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           gap: "1rem",
//           flexWrap: "wrap",
//           backgroundColor: "#1a4480",
//           padding: "1rem",
//           borderRadius: "8px"
//         }}>
//           <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", borderRadius: "5px" }}>
//             ⏮ First
//           </button>
//           <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", borderRadius: "5px" }}>
//             ⬅ Prev
//           </button>
//           <span style={{ fontWeight: "bold" }}>Page {currentPage} of {totalPages}</span>
//           <select
//             value={currentPage}
//             onChange={(e) => handlePageChange(Number(e.target.value))}
//             style={{
//               padding: "0.5rem",
//               borderRadius: "5px",
//               backgroundColor: "#0c2d5c",
//               color: "white",
//               border: "1px solid #4CAF50"
//             }}
//           >
//             {Array.from({ length: totalPages }, (_, i) => (
//               <option key={i + 1} value={i + 1}>Go to Page {i + 1}</option>
//             ))}
//           </select>
//           <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", borderRadius: "5px" }}>
//             Next ➡
//           </button>
//           <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", borderRadius: "5px" }}>
//             Last ⏭
//           </button>
//         </div>
//       )}

//       <AlertStats alerts={filteredAlerts} />

//       {/* Debug Info */}
//       {process.env.NODE_ENV === 'development' && (
//         <div style={{
//           marginTop: "1rem",
//           padding: "1rem",
//           backgroundColor: "#1a4480",
//           borderRadius: "8px",
//           fontSize: "0.8rem"
//         }}>
//           <h3>🛠️ Debug Info:</h3>
//           <p>Total Alerts: {alerts.length}</p>
//           <p>Geocoded Alerts: {geocodedAlerts.length}</p>
//           <p>Filtered Alerts: {filteredAlerts.length}</p>
//           <p>Current Page Alerts: {currentAlerts.length}</p>
//           <p>Current Page with Coordinates: {currentAlertsWithCoordinates.length}</p>
//           <p>Cache Stats: {JSON.stringify(geocodingServiceRef.current?.getCacheStats())}</p>
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

  useEffect(() => {
    geocodingServiceRef.current = new GeocodingService();

    const fetchData = async () => {
      try {
        const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
        const data = await response.json();

        setAlerts(data);
        setIsGeocoding(true);
        setGeocodingProgress(0);

        const geocodedData = await geocodingServiceRef.current.geocodeAlerts(data, (progress) => {
          setGeocodingProgress(prev => Math.max(prev, progress));
        });

        setGeocodedAlerts(geocodedData);
        setFilteredAlerts(geocodedData);
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
    setFilteredAlerts(data);
    setCurrentPage(1);
  };

  const currentAlertsWithCoordinates = currentAlerts.filter(alert => alert.coordinates);
  const totalAlertsWithCoordinates = filteredAlerts.filter(alert => alert.coordinates).length;
  const currentPageStats = {
    total: currentAlerts.length,
    withCoordinates: currentAlertsWithCoordinates.length,
    countries: [...new Set(currentAlertsWithCoordinates.map(alert => alert.coordinates?.country).filter(Boolean))]
  };

  return (
    <div className="App" style={{ backgroundColor: "#0c2d5c", color: "white", padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>🌐 Global Portal</h1>
        <button onClick={toggleMenu} className="hamburger-btn">☰</button>
        <div className="desktop-filter">
          <AlertFilter alerts={geocodedAlerts} onFilter={handleFilter} />
        </div>
      </div>

      {/* Loader */}
      {isGeocoding && (
        <div style={{
          backgroundColor: "#1a4480",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          <div>🌍 Processing worldwide locations for map display...</div>
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
        </div>
      </div>

      {/* Alert Cards */}
      <div className="alert-cards">
        {currentAlerts.map((alert, index) => (
          <AlertCard key={`${alert.title}-${alert.timestamp}-${index}`} alert={alert} />
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

      {/* Debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h3>🛠️ Debug Info</h3>
          <p>Total: {alerts.length}</p>
          <p>Geocoded: {geocodedAlerts.length}</p>
          <p>Filtered: {filteredAlerts.length}</p>
          <p>Current Page: {currentAlerts.length}</p>
          <p>With Coordinates: {currentAlertsWithCoordinates.length}</p>
          <p>Cache: {JSON.stringify(geocodingServiceRef.current?.getCacheStats())}</p>
        </div>
      )}
    </div>
  );
}

export default App;
