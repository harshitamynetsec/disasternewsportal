import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Enhanced disaster configuration with animations and icons
const disasterConfig = {
  earthquake: {
    color: '#8B4513',
    icon: '🏚️',
    animation: 'shake-marker ripple-marker',
    name: 'Earthquake',
    gradient: 'linear-gradient(45deg, #8B4513, #D2691E)'
  },
  flood: {
    color: '#0066CC',
    icon: '🌊',
    animation: 'flood-marker pulse-marker',
    name: 'Flood',
    gradient: 'linear-gradient(45deg, #0066CC, #4D9FFF)'
  },
  fire: {
    color: '#FF4500',
    icon: '🔥',
    animation: 'fire-marker bloom-marker',
    name: 'Fire',
    gradient: 'linear-gradient(45deg, #FF4500, #FF8C00)'
  },
  storm: {
    color: '#666666',
    icon: '⛈️',
    animation: 'hurricane-marker ripple-marker',
    name: 'Storm',
    gradient: 'linear-gradient(45deg, #666666, #999999)'
  },
  cyclone: {
    color: '#2F4F4F',
    icon: '🌀',
    animation: 'hurricane-marker alert-marker',
    name: 'Cyclone',
    gradient: 'linear-gradient(45deg, #2F4F4F, #708090)'
  },
  wildfire:{
    color: '#FF6347',
    icon: '🔥',
    animation: 'fire-marker bloom-marker',
    name: 'Wildfire',
    gradient: 'linear-gradient(45deg, #FF6347, #FF4500)'
  },
  tsunami: {
    color: '#00CED1',
    icon: '🌊',
    animation: 'flood-marker ripple-marker',
    name: 'Tsunami',
    gradient: 'linear-gradient(45deg, #00CED1, #40E0D0)'
  },
  volcano: {
    color: '#DC143C',
    icon: '🌋',
    animation: 'fire-marker alert-marker',
    name: 'Volcano',
    gradient: 'linear-gradient(45deg, #DC143C, #FF6347)'
  },
  landslide: {
    color: '#8B4513',
    icon: '⛰️',
    animation: 'shake-marker bloom-marker',
    name: 'Landslide',
    gradient: 'linear-gradient(45deg, #8B4513, #CD853F)'
  },
  tornado: {
    color: '#2F4F4F',
    icon: '🌪️',
    animation: 'hurricane-marker alert-marker',
    name: 'Tornado',
    gradient: 'linear-gradient(45deg, #2F4F4F, #708090)'
  },
  drought: {
    color: '#FFD700',
    icon: '🌵',
    animation: 'pulse-marker bloom-marker',
    name: 'Drought',
    gradient: 'linear-gradient(45deg, #FFD700, #FFEA00)'
  },

  default: {
    color: '#ff6b6b',
    icon: '⚠️',
    animation: 'pulse-marker',
    name: 'Alert',
    gradient: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'
  }
};

const createAnimatedIcon = (disasterType) => {
  const config = disasterConfig[disasterType?.toLowerCase()] || disasterConfig.default;

  const markerHtml = `
    <div class="animated-marker ${config.animation}" style="
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      background: ${config.gradient};
      position: relative;
      z-index: 10;
    ">
      ${config.icon}
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-animated-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// CSS Animations Component
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }

    @keyframes bloom {
      0% { transform: scale(0.5); opacity: 0.8; border-color: #ff4444; }
      25% { transform: scale(1); opacity: 0.6; border-color: #ff6644; }
      50% { transform: scale(1.5); opacity: 0.4; border-color: #ff8844; }
      75% { transform: scale(2); opacity: 0.2; border-color: #ffaa44; }
      100% { transform: scale(2.5); opacity: 0; border-color: #ffcc44; }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }

    @keyframes flicker {
      0% { filter: brightness(1) hue-rotate(0deg); transform: scale(1); }
      100% { filter: brightness(1.3) hue-rotate(10deg); transform: scale(1.1); }
    }

    @keyframes wave {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }

    @keyframes ripple {
      0% { width: 0; height: 0; opacity: 1; }
      100% { width: 60px; height: 60px; opacity: 0; }
    }

    /* Animation Classes */
    .pulse-marker {
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .bloom-marker {
      position: relative;
      border-radius: 50%;
    }
    
    .bloom-marker::before {
      content: '';
      position: absolute;
      top: -10px; left: -10px; right: -10px; bottom: -10px;
      border: 3px solid;
      border-radius: 50%;
      animation: bloom 3s infinite;
    }

    .shake-marker {
      animation: shake 0.5s infinite;
    }

    .fire-marker {
      position: relative;
      animation: flicker 1s infinite alternate;
    }

    .flood-marker {
      position: relative;
      overflow: hidden;
      border-radius: 50%;
    }
    
    .flood-marker::after {
      content: '';
      position: absolute;
      top: 60%; left: -100%; width: 200%; height: 200%;
      background: linear-gradient(45deg, transparent, rgba(0,150,255,0.3), transparent);
      animation: wave 2s infinite;
    }

    .hurricane-marker {
      animation: spin 2s linear infinite;
    }

    .alert-marker {
      animation: blink 1s infinite;
    }

    .ripple-marker {
      position: relative;
    }
    
    .ripple-marker::before,
    .ripple-marker::after {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      width: 0; height: 0;
      border: 2px solid #ff4444;
      border-radius: 50%;
      animation: ripple 2s infinite;
      transform: translate(-50%, -50%);
    }
    
    .ripple-marker::after {
      animation-delay: 1s;
    }

    /* Hover effects */
    .animated-marker:hover {
      transform: scale(1.2) !important;
      z-index: 1000 !important;
      transition: transform 0.2s ease;
    }

    /* Custom cluster styles */
    .marker-cluster-small {
      background: linear-gradient(45deg, #ff6b6b, #ff8e8e) !important;
      animation: pulse 2s infinite !important;
    }
    
    .marker-cluster-medium {
      background: linear-gradient(45deg, #ff4444, #ff6666) !important;
      animation: pulse 1.5s infinite !important;
    }
    
    .marker-cluster-large {
      background: linear-gradient(45deg, #ff0000, #ff4444) !important;
      animation: pulse 1s infinite !important;
    }
  `}</style>
);

// Add a new component to handle map focus
const MapFocus = ({ position, zoom }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, zoom || 12);
    }
  }, [position, zoom, map]);
  
  return null;
};

const MapView = ({ alerts, focusMarker }) => {
  const mapRef = useRef(null);
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

  // Get focus position if focusMarker is provided
  const focusPosition = focusMarker && focusMarker.coordinates ? 
    [focusMarker.coordinates.lat, focusMarker.coordinates.lng] : 
    null;

  return (
    <div className="map-section" style={{ position: 'relative' }}>
      <AnimationStyles />
      
      {/* Enhanced counter with animation toggle */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(12, 45, 92, 0.95)',
        color: 'white',
        padding: '0.8rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        zIndex: 401,
        border: '2px solid #4CAF50',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
      }}>
        🎯 <strong>{validAlerts.length}/{alerts.length}</strong> alerts mapped
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={zoomLevel} 
        style={{ height: "580px", width: "100%" }}
        className="disaster-map"
        ref={mapRef}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}@2x.png?key=nksRfzxRXRECvvz3HFsg"
        />

        <MarkerClusterGroup 
          chunkedLoading
          spiderfyOnMaxZoom={false}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          maxClusterRadius={50}
        >
          {validAlerts.map((alert, index) => {
            const disasterType = alert.analysis?.disaster_type || 'default';
            const config = disasterConfig[disasterType.toLowerCase()] || disasterConfig.default;
            
            return (
              <Marker
                key={`${alert.title}-${alert.timestamp}-${index}`}
                position={[alert.coordinates.lat, alert.coordinates.lng]}
                icon={createAnimatedIcon(disasterType)}
              >
                <Popup 
                  maxWidth={320}
                  className="disaster-popup"
                >
                  <div style={{ maxWidth: '300px' }}>
                    {/* Enhanced disaster type badge */}
                    <div style={{
                      background: config.gradient,
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginBottom: '0.8rem',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      {config.icon} {config.name}
                    </div>

                    <h4 style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '1rem',
                      color: '#2c3e50',
                      fontWeight: 'bold'
                    }}>
                      {alert.title}
                    </h4>

                    <p style={{ 
                      fontSize: '0.85rem', 
                      color: '#7f8c8d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      margin: '0.5rem 0'
                    }}>
                      📍 {alert.location || 'Unknown location'}
                    </p>

                    {alert.description && (
                      <p style={{ 
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        color: '#34495e',
                        margin: '0.5rem 0'
                      }}>
                        {alert.description.length > 120
                          ? `${alert.description.substring(0, 120)}...`
                          : alert.description}
                      </p>
                    )}

                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#95a5a6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      margin: '0.8rem 0 0.5rem 0'
                    }}>
                      🕒 {new Date(alert.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    {alert.link && (
                      <a 
                        href={alert.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#3498db', 
                          fontSize: '0.85rem', 
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontWeight: '500',
                          padding: '0.3rem 0',
                          borderBottom: '1px solid transparent',
                          transition: 'border-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.borderBottomColor = '#3498db'}
                        onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
                      >
                        🔗 Read full report
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
        
        {/* Add MapFocus component */}
        {focusPosition && (
          <MapFocus 
            position={focusPosition}
            zoom={12}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;