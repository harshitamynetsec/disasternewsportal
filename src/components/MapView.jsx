
// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import './css/MapView.css'; 

// const DISASTER_TYPES = {
//   earthquake: {
//     color: '#ff4444',
//     icon: '🏚️',
//     name: 'Earthquake',
//     keywords: ['earthquake', 'seismic', 'tremor', 'quake', 'magnitude']
//   },
//   flood: {
//     color: '#4444ff',
//     icon: '🌊',
//     name: 'Flood',
//     keywords: ['flood', 'flooding', 'inundation', 'overflow', 'deluge', 'water level']
//   },
//   fire: {
//     color: '#ff8800',
//     icon: '🔥',
//     name: 'Wildfire',
//     keywords: ['fire', 'wildfire', 'blaze', 'burn', 'ignition', 'smoke']
//   },
//   storm: {
//     color: '#8844ff',
//     icon: '⛈️',
//     name: 'Storm',
//     keywords: ['storm', 'hurricane', 'cyclone', 'typhoon', 'tornado', 'wind', 'gale']
//   },
//   drought: {
//     color: '#cc8844',
//     icon: '🏜️',
//     name: 'Drought',
//     keywords: ['drought', 'dry', 'arid', 'water shortage', 'precipitation']
//   },
//   landslide: {
//     color: '#8b4513',
//     icon: '⛰️',
//     name: 'Landslide',
//     keywords: ['landslide', 'mudslide', 'rockfall', 'avalanche', 'slope failure']
//   },
//   volcano: {
//     color: '#ff0000',
//     icon: '🌋',
//     name: 'Volcanic Activity',
//     keywords: ['volcano', 'volcanic', 'eruption', 'lava', 'ash', 'magma']
//   },
//   tsunami: {
//     color: '#00ffff',
//     icon: '🌊',
//     name: 'Tsunami',
//     keywords: ['tsunami', 'tidal wave', 'seismic wave']
//   },
//   extreme_weather: {
//     color: '#ffff00',
//     icon: '🌡️',
//     name: 'Extreme Weather',
//     keywords: ['heatwave', 'cold wave', 'blizzard', 'ice storm', 'temperature']
//   },
//   other: {
//     color: '#888888',
//     icon: '⚠️',
//     name: 'Other Disaster',
//     keywords: []
//   }
// };

// const getDisasterType = (alert) => {
//   const text = `${alert.title || ''} ${alert.description || ''}`.toLowerCase();
//   for (const [type, config] of Object.entries(DISASTER_TYPES)) {
//     if (type === 'other') continue;
//     if (config.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
//       return type;
//     }
//   }
//   return 'other';
// };

// const createCustomMarker = (disasterType, severity = 'medium') => {
//   const config = DISASTER_TYPES[disasterType] || DISASTER_TYPES.other;
//   const size = severity === 'high' ? 40 : severity === 'low' ? 25 : 32;
//   return L.divIcon({
//     className: 'custom-disaster-marker',
//     html: `
//       <div class="marker-container" style="
//         background-color: ${config.color};
//         width: ${size}px;
//         height: ${size}px;
//         border: 3px solid white;
//         border-radius: 50%;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         font-size: ${size * 0.6}px;
//         box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//         cursor: pointer;
//         transition: transform 0.2s ease;
//       ">
//         ${config.icon}
//       </div>
//     `,
//     iconSize: [size, size],
//     iconAnchor: [size / 2, size / 2],
//     popupAnchor: [0, -size / 2]
//   });
// };

// const getSeverity = (alert) => {
//   const text = `${alert.title || ''} ${alert.description || ''}`.toLowerCase();
//   const highSeverityKeywords = ['severe', 'major', 'critical', 'emergency', 'disaster', 'catastrophic', 'extreme'];
//   const lowSeverityKeywords = ['minor', 'small', 'light', 'weak'];
//   if (highSeverityKeywords.some(keyword => text.includes(keyword))) {
//     return 'high';
//   } else if (lowSeverityKeywords.some(keyword => text.includes(keyword))) {
//     return 'low';
//   }
//   return 'medium';
// };

// const MapView = ({ alerts = [] }) => {
//   const mapRef = useRef(null);
//   const mapInstanceRef = useRef(null);
//   const markersRef = useRef([]);
//   const [selectedDisasterTypes, setSelectedDisasterTypes] = useState(Object.keys(DISASTER_TYPES));
//   const [mapStats, setMapStats] = useState({});

//   useEffect(() => {
//     if (!mapInstanceRef.current && mapRef.current) {
//       mapInstanceRef.current = L.map(mapRef.current, {
//         center: [20, 0],
//         zoom: 2,
//         zoomControl: false,
//         attributionControl: false
//       });

//       L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors',
//         maxZoom: 18,
//       }).addTo(mapInstanceRef.current);

//       L.control.attribution({
//         position: 'bottomleft',
//         prefix: false
//       }).addAttribution('Disaster data from NSS Alert Portal').addTo(mapInstanceRef.current);
//     }

//     return () => {
//       if (mapInstanceRef.current) {
//         mapInstanceRef.current.remove();
//         mapInstanceRef.current = null;
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (!mapInstanceRef.current || !alerts.length) return;

//     markersRef.current.forEach(marker => {
//       mapInstanceRef.current.removeLayer(marker);
//     });
//     markersRef.current = [];

//     const stats = {};
//     const validAlerts = alerts.filter(alert => 
//       alert.coordinates && 
//       !isNaN(alert.coordinates.lat) && 
//       !isNaN(alert.coordinates.lng)
//     );

//     validAlerts.forEach(alert => {
//       const disasterType = getDisasterType(alert);
//       const severity = getSeverity(alert);

//       stats[disasterType] = (stats[disasterType] || 0) + 1;

//       if (!selectedDisasterTypes.includes(disasterType)) return;

//       const marker = L.marker(
//         [alert.coordinates.lat, alert.coordinates.lng],
//         { 
//           icon: createCustomMarker(disasterType, severity), 
//           draggable: false // Explicitly disable dragging
//         }
//       );

//       const config = DISASTER_TYPES[disasterType];
//       const popupContent = `
//         <div class="custom-popup">
//           <div class="popup-header" style="background-color: ${config.color};">
//             <span class="popup-icon">${config.icon}</span>
//             <span class="popup-type">${config.name}</span>
//             <span class="popup-severity severity-${severity}">${severity.toUpperCase()}</span>
//           </div>
//           <div class="popup-content">
//             <h4>${alert.title || 'Disaster Alert'}</h4>
//             <p><strong>📍 Location:</strong> ${alert.coordinates.country || 'Unknown'}</p>
//             ${alert.description ? `<p><strong>📋 Details:</strong> ${alert.description.substring(0, 150)}${alert.description.length > 150 ? '...' : ''}</p>` : ''}
//             ${alert.timestamp ? `<p><strong>⏰ Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>` : ''}
//             <p><strong>📊 Coordinates:</strong> ${alert.coordinates.lat.toFixed(4)}, ${alert.coordinates.lng.toFixed(4)}</p>
//             <p><strong>🔍 Source:</strong> ${alert.coordinates.source || 'Unknown'}</p>
//           </div>
//         </div>
//       `;

//       marker.bindPopup(popupContent, {
//         maxWidth: 300,
//         className: 'custom-popup-container'
//       });

//       marker.on('mouseover', function() {
//         this.getElement().style.transform = 'scale(1.2)';
//         this.getElement().style.zIndex = '1000';
//       });

//       marker.on('mouseout', function() {
//         this.getElement().style.transform = 'scale(1)';
//         this.getElement().style.zIndex = '500';
//       });

//       marker.addTo(mapInstanceRef.current);
//       markersRef.current.push(marker);
//     });

//     setMapStats(stats);

//     if (markersRef.current.length > 0) {
//       const group = new L.featureGroup(markersRef.current);
//       mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
//     }
//   }, [alerts, selectedDisasterTypes]);

//   const toggleDisasterType = (type) => {
//     setSelectedDisasterTypes(prev => 
//       prev.includes(type) 
//         ? prev.filter(t => t !== type)
//         : [...prev, type]
//     );
//   };

//   const toggleAll = () => {
//     const allTypes = Object.keys(DISASTER_TYPES);
//     setSelectedDisasterTypes(
//       selectedDisasterTypes.length === allTypes.length ? [] : allTypes
//     );
//   };

//   return (
//     <div className="map-container">
//       <div ref={mapRef} className="map-view" />
//       <div className="map-legend">
//         <div className="legend-header">
//           <h3>🗺️ Disaster Map Legend</h3>
//           <button 
//             className="toggle-all-btn"
//             onClick={toggleAll}
//             title={selectedDisasterTypes.length === Object.keys(DISASTER_TYPES).length ? 'Hide All' : 'Show All'}
//           >
//             {selectedDisasterTypes.length === Object.keys(DISASTER_TYPES).length ? '👁️‍🗨️' : '👁️'}
//           </button>
//         </div>
//         <div className="legend-items">
//           {Object.entries(DISASTER_TYPES).map(([type, config]) => (
//             <div 
//               key={type}
//               className={`legend-item ${selectedDisasterTypes.includes(type) ? 'active' : 'inactive'}`}
//               onClick={() => toggleDisasterType(type)}
//             >
//               <div 
//                 className="legend-marker"
//                 style={{ 
//                   backgroundColor: config.color,
//                   opacity: selectedDisasterTypes.includes(type) ? 1 : 0.3
//                 }}
//               >
//                 {config.icon}
//               </div>
//               <div className="legend-info">
//                 <span className="legend-name">{config.name}</span>
//                 <span className="legend-count">({mapStats[type] || 0})</span>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="map-statistics">
//           <div className="stat-item">
//             <span className="stat-label">📍 Total Markers:</span>
//             <span className="stat-value">{markersRef.current.length}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">🌍 Total Alerts:</span>
//             <span className="stat-value">{alerts.length}</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-label">🎯 Visible Types:</span>
//             <span className="stat-value">{selectedDisasterTypes.length}/{Object.keys(DISASTER_TYPES).length}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MapView;

// import React from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";


// // Fix marker icon issue in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//    iconUrl: "/placeholder.png",
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// });

// const MapView = ({ alerts }) => (
//   <MapContainer center={[23.5, 78.9]} zoom={5} style={{ height: "400px", width: "100%" }}>
//     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//     {alerts.map((alert) => {
//       if (typeof alert.lat !== "number" || typeof alert.lng !== "number") return null;

//       return (
//         <Marker key={alert.id} position={[alert.lat, alert.lng]}>
//           <Popup>
//             <strong>{alert.title}</strong><br />
//             {alert.location}<br />
//             {alert.description}
//           </Popup>
//         </Marker>
//       );
//     })}
//   </MapContainer>
// );

// export default MapView;
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const createCustomIcon = (disasterType) => {
  const colors = {
    earthquake: '#008000',
    flood: '#4444ff',
    fire: '#ff8800',
    storm: '#8800ff',
    cyclone: '#00ff88',
    tsunami: '#00aaff',
    default: '#ff6b6b'
  };

  const color = colors[disasterType?.toLowerCase()] || colors.default;

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};


const MapView = ({ alerts }) => {
  const validAlerts = alerts.filter(alert =>
    alert.coordinates &&
    typeof alert.coordinates.lat === "number" &&
    typeof alert.coordinates.lng === "number"
  );

  const getMapCenter = () => {
    if (validAlerts.length === 0) return [20.5937, 78.9629]; // India center

    const avgLat = validAlerts.reduce((sum, a) => sum + a.coordinates.lat, 0) / validAlerts.length;
    const avgLng = validAlerts.reduce((sum, a) => sum + a.coordinates.lng, 0) / validAlerts.length;

    return [avgLat, avgLng];
  };

  const getZoomLevel = () => {
    if (validAlerts.length <= 1) return 6;
    const lats = validAlerts.map(a => a.coordinates.lat);
    const lngs = validAlerts.map(a => a.coordinates.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);

    if (maxRange > 10) return 4;
    if (maxRange > 5) return 5;
    if (maxRange > 2) return 6;
    return 7;
  };

  const mapCenter = getMapCenter();
  const zoomLevel = getZoomLevel();

  return (
    <div style={{ position: 'relative' }}>
      {/* Existing counter */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(12, 45, 92, 0.9)',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '5px',
        fontSize: '0.8rem',
        zIndex: 1000,
        border: '1px solid #4CAF50'
      }}>
        📍 {validAlerts.length}/{alerts.length} alerts mapped
      </div>

      <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MarkerClusterGroup chunkedLoading>
          {validAlerts.map((alert, index) => {
            const disasterType = alert.analysis?.disaster_type || 'unknown';
            return (
              <Marker
                key={`${alert.title}-${alert.timestamp}-${index}`}
                position={[alert.coordinates.lat, alert.coordinates.lng]}
                icon={createCustomIcon(disasterType)}
              >
                <Popup maxWidth={300}>
                  <div style={{ maxWidth: '280px' }}>
                    <div style={{
                      backgroundColor: disasterType === 'earthquake' ? '#008000' :
                        disasterType === 'flood' ? '#4444ff' :
                          disasterType === 'fire' ? '#ff8800' : '#ff6b6b',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      display: 'inline-block',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase'
                    }}>
                      {disasterType}
                    </div>

                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{alert.title}</h4>

                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                      📍 {alert.location || 'Unknown location'}
                    </p>

                    {alert.description && (
                      <p style={{ fontSize: '0.8rem' }}>
                        {alert.description.length > 100
                          ? `${alert.description.substring(0, 100)}...`
                          : alert.description}
                      </p>
                    )}

                    <p style={{ fontSize: '0.7rem', color: '#888' }}>
                      🕒 {new Date(alert.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    {alert.link && (
                      <a href={alert.link} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#0066cc', fontSize: '0.8rem', textDecoration: 'none' }}>
                        🔗 Read more
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;
