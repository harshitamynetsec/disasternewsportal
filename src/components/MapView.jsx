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






// import React from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import MarkerClusterGroup from 'react-leaflet-cluster';
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // Fix marker icon issue in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
// });

// // Custom disaster-type icons
// const createCustomIcon = (disasterType) => {
//   const colors = {
//     earthquake: '#ff4444',
//     flood: '#4444ff',
//     fire: '#ff8800',
//     storm: '#8800ff',
//     cyclone: '#00ff88',
//     tsunami: '#00aaff',
//     default: '#ff6b6b'
//   };

//   const color = colors[disasterType?.toLowerCase()] || colors.default;
  
//   return L.divIcon({
//     html: `<div style="
//       background-color: ${color};
//       width: 20px;
//       height: 20px;
//       border-radius: 50%;
//       border: 2px solid white;
//       box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//     "></div>`,
//     className: 'custom-marker',
//     iconSize: [20, 20],
//     iconAnchor: [10, 10]
//   });
// };

// const MapView = ({ alerts }) => {
//   const validAlerts = alerts.filter(alert =>
//     alert.coordinates &&
//     typeof alert.coordinates.lat === "number" &&
//     typeof alert.coordinates.lng === "number"
//   );

//   const getMapCenter = () => {
//     if (validAlerts.length === 0) return [20.5937, 78.9629]; // India center

//     const avgLat = validAlerts.reduce((sum, a) => sum + a.coordinates.lat, 0) / validAlerts.length;
//     const avgLng = validAlerts.reduce((sum, a) => sum + a.coordinates.lng, 0) / validAlerts.length;

//     return [avgLat, avgLng];
//   };

//   const getZoomLevel = () => {
//     if (validAlerts.length <= 1) return 6;

//     const lats = validAlerts.map(a => a.coordinates.lat);
//     const lngs = validAlerts.map(a => a.coordinates.lng);

//     const latRange = Math.max(...lats) - Math.min(...lats);
//     const lngRange = Math.max(...lngs) - Math.min(...lngs);
//     const maxRange = Math.max(latRange, lngRange);

//     if (maxRange > 10) return 4;
//     if (maxRange > 5) return 5;
//     if (maxRange > 2) return 6;
//     return 7;
//   };

//   const mapCenter = getMapCenter();
//   const zoomLevel = getZoomLevel();

//   return (
//     <div style={{ position: 'relative' }}>
//       {/* Info Banner */}
//       <div style={{
//         position: 'absolute',
//         top: '10px',
//         right: '10px',
//         backgroundColor: 'rgba(12, 45, 92, 0.9)',
//         color: 'white',
//         padding: '0.5rem',
//         borderRadius: '5px',
//         fontSize: '0.8rem',
//         zIndex: 1000,
//         border: '1px solid #4CAF50'
//       }}>
//         📍 {validAlerts.length}/{alerts.length} alerts mapped
//       </div>

//       {/* Map */}
//       <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: "400px", width: "100%" }}>
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />

//         {/* Clustered Markers */}
//         <MarkerClusterGroup chunkedLoading>
//           {validAlerts.map((alert, index) => {
//             const disasterType = alert.analysis?.disaster_type || 'unknown';
//             return (
//               <Marker
//                 key={`${alert.title}-${alert.timestamp}-${index}`}
//                 position={[alert.coordinates.lat, alert.coordinates.lng]}
//                 icon={createCustomIcon(disasterType)}
//               >
//                 <Popup maxWidth={300}>
//                   <div style={{ maxWidth: '280px' }}>
//                     <div style={{
//                       backgroundColor: disasterType === 'earthquake' ? '#ff4444' :
//                         disasterType === 'flood' ? '#4444ff' :
//                           disasterType === 'fire' ? '#ff8800' : '#ff6b6b',
//                       color: 'white',
//                       padding: '0.2rem 0.5rem',
//                       borderRadius: '10px',
//                       fontSize: '0.7rem',
//                       display: 'inline-block',
//                       marginBottom: '0.5rem',
//                       textTransform: 'uppercase'
//                     }}>
//                       {disasterType}
//                     </div>

//                     <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{alert.title}</h4>

//                     <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>
//                       📍 {alert.location || 'Unknown location'}
//                     </p>

//                     {alert.description && (
//                       <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem' }}>
//                         {alert.description.length > 100
//                           ? `${alert.description.substring(0, 100)}...`
//                           : alert.description}
//                       </p>
//                     )}

//                     <p style={{ fontSize: '0.7rem', color: '#888' }}>
//                       🕒 {new Date(alert.timestamp).toLocaleString("en-IN", {
//                         dateStyle: "medium",
//                         timeStyle: "short",
//                       })}
//                     </p>

//                     {alert.link && (
//                       <a href={alert.link} target="_blank" rel="noopener noreferrer"
//                         style={{ color: '#0066cc', fontSize: '0.8rem', textDecoration: 'none' }}>
//                         🔗 Read more
//                       </a>
//                     )}
//                   </div>
//                 </Popup>
//               </Marker>
//             );
//           })}
//         </MarkerClusterGroup>
//       </MapContainer>

//       {/* Loading message */}
//       {validAlerts.length === 0 && alerts.length > 0 && (
//         <div style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           backgroundColor: 'rgba(26, 68, 128, 0.9)',
//           color: 'white',
//           padding: '1rem',
//           borderRadius: '8px',
//           textAlign: 'center',
//           zIndex: 1000
//         }}>
//           <div>🌍 Processing alert locations...</div>
//           <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
//             Map will update as coordinates are resolved
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

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
    earthquake: '#ff4444',
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
                      backgroundColor: disasterType === 'earthquake' ? '#ff4444' :
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
