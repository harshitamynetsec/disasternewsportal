import React, { useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import './css/MapView.css';
import { MdOutlineHouseSiding, MdOutlineFlood, MdOutlineLocalFireDepartment, MdOutlineStorm, MdOutlineTsunami, MdOutlineWarning, MdOutlineReportProblem } from 'react-icons/md';
import { FaMountain, FaWind, FaRegSun } from 'react-icons/fa';
import { WiHurricane, WiTornado, WiDaySunny, WiCloudyWindy } from 'react-icons/wi';
import { GiCactus, GiPoliceBadge, GiVolcano, GiDesert } from 'react-icons/gi';
import { IoLocationSharp } from 'react-icons/io5';
import { MdLocalHospital } from 'react-icons/md';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Building/Site icon
const buildingIcon = new L.DivIcon({
  html: `<div style="font-size: 2rem; color: #2d98da;"><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' viewBox='0 0 24 24'><path d='M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z'/></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Emergency contact icon
const emergencyIcon = new L.DivIcon({
  html: `<div style="font-size: 2rem; color: #e74c3c;"><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' viewBox='0 0 24 24'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Enhanced disaster configuration with animations and icons
const disasterConfig = {
  earthquake: {
    color: '#8B4513',
    icon: MdOutlineHouseSiding,
    animation: 'shake-marker bloom-marker',
    name: 'Earthquake',
    gradient: 'linear-gradient(45deg, #8B4513, #D2691E)'
  },
  flood: {
    color: '#0066CC',
    icon: MdOutlineFlood,
    animation: 'flood-marker pulse-marker',
    name: 'Flood',
    gradient: 'linear-gradient(45deg, #0066CC, #4D9FFF)'
  },
  fire: {
    color: '#FF4500',
    icon: MdOutlineLocalFireDepartment,
    animation: 'fire-marker bloom-marker',
    name: 'Fire',
    gradient: 'linear-gradient(45deg, #FF4500, #FF8C00)'
  },
  storm: {
    color: '#666666',
    icon: MdOutlineStorm,
    animation: 'hurricane-marker ripple-marker',
    name: 'Storm',
    gradient: 'linear-gradient(45deg, #666666, #999999)'
  },
  hurricane: {
    color: '#2F4F4F',
    icon: WiHurricane,
    animation: 'hurricane-marker alert-marker',
    name: 'Cyclone',
    gradient: 'linear-gradient(45deg, #2F4F4F, #708090)'
  },
  wildfire:{
    color: '#FF6347',
    icon: MdOutlineLocalFireDepartment,
    animation: 'fire-marker bloom-marker',
    name: 'Wildfire',
    gradient: 'linear-gradient(45deg, #FF6347, #FF4500)'
  },
  tsunami: {
    color: '#00CED1',
    icon: MdOutlineTsunami,
    animation: 'flood-marker ripple-marker',
    name: 'Tsunami',
    gradient: 'linear-gradient(45deg, #00CED1, #40E0D0)'
  },
  volcano: {
    color: '#DC143C',
    icon: GiVolcano,
    animation: 'fire-marker alert-marker',
    name: 'Volcano',
    gradient: 'linear-gradient(45deg, #DC143C, #FF6347)'
  },
  landslide: {
    color: '#8B4513',
    icon: FaMountain,
    animation: 'shake-marker bloom-marker',
    name: 'Landslide',
    gradient: 'linear-gradient(45deg, #8B4513, #CD853F)'
  },
  tornado: {
    color: '#2F4F4F',
    icon: WiTornado,
    animation: 'hurricane-marker alert-marker',
    name: 'Tornado',
    gradient: 'linear-gradient(45deg, #2F4F4F, #708090)'
  },
  drought: {
    color: '#FFD700',
    icon: GiDesert,
    animation: 'shake-marker',
    name: 'Drought',
    gradient: '#FFD700'
  },
  "severe thunderstorm" : {
    color: '#808080',
    icon: MdOutlineStorm,
    animation: 'hurricane-marker ripple-marker',
    name: 'severe thunderstorm',
    gradient: 'linear-gradient(45deg, #808080, #C0C0C0)'
  },
  weather: {
    color: '#808080',
    icon: WiCloudyWindy,
    animation: 'ripple-marker',
    name: 'severe thunderstorm',
    gradient: 'linear-gradient(45deg, #808080, #C0C0C0)'
  },
  incident: {
    color: '#FF8C00',
    icon: GiPoliceBadge,
    animation: 'pulse-marker',
    name: 'Incident',
    gradient: 'linear-gradient(45deg, #FF8C00, #FFA500)'
  },
  default: {
    color: '#ff6b6b',
    icon: MdOutlineWarning,
    animation: 'pulse-marker',
    name: 'Alert',
    gradient: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)'
  }
};

// Helper to render icon as SVG string for Leaflet
const renderIconToString = (IconComponent) => {
  // Use ReactDOMServer to render to string
  const ReactDOMServer = require('react-dom/server');
  return ReactDOMServer.renderToStaticMarkup(<IconComponent size={20} color="white" />);
};

const createAnimatedIcon = (disasterType) => {
  const config = disasterConfig[disasterType?.toLowerCase()] || disasterConfig.default;
  const iconSize = disasterType?.toLowerCase() === 'drought' ? 24 : 20;
  let iconSvg;
  if (disasterType?.toLowerCase() === 'drought') {
    iconSvg = renderIconToString((props) => (
      <span style={{ filter: 'drop-shadow(0 0 2px #000) drop-shadow(0 1px 2px #000)' }}>
        <config.icon size={iconSize} color="#fff" {...props} />
      </span>
    ));
  } else {
    iconSvg = renderIconToString((props) => <config.icon size={iconSize} color="#8B4513" {...props} />);
  }
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
      ${iconSvg}
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

    /* New neon glow animation for site rings */
    @keyframes neonGlow {
      0% { box-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00, 0 0 15px #ffff00; }
      50% { box-shadow: 0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 30px #ffff00; }
      100% { box-shadow: 0 0 5px #ffff00, 0 0 10px #ffff00, 0 0 15px #ffff00; }
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

    .drought-glow-marker {
      box-shadow: 0 0 16px 6px #FFD700, 0 0 32px 12px #FFB30044;
      border: 3px solid #FFB300;
    }

    /* Neon ring styles */
    .neon-ring {
      animation: neonGlow 2s ease-in-out infinite;
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

// Helper component to render wrapped markers
const WrappedMarkers = ({ alerts, createAnimatedIcon }) => {
  const map = useMap();
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const east = bounds.getEast();

  // Helper: get all visible longitudes for a marker
  const getWrappedLongitudes = (lng) => {
    const markers = [];
    for (let offset = -2; offset <= 2; offset++) {
      const wrappedLng = lng + offset * 360;
      if (wrappedLng >= west - 360 && wrappedLng <= east + 360) {
        markers.push(wrappedLng);
      }
    }
    return markers;
  };

  return (
    <>
      {alerts.map((alert, idx) => {
        if (
          !alert.coordinates ||
          typeof alert.coordinates.lat !== "number" ||
          typeof alert.coordinates.lng !== "number"
        ) {
          return null;
        }
        const lat = alert.coordinates.lat;
        const lng = alert.coordinates.lng;
        const disasterType = alert.analysis?.disaster_type || "default";
        const config = disasterConfig[disasterType?.toLowerCase()] || disasterConfig.default;
        return getWrappedLongitudes(lng).map((wrappedLng, i) => (
          <Marker
            key={`${alert.title}-${alert.timestamp}-${idx}-wrap${i}`}
            position={[lat, wrappedLng]}
            icon={createAnimatedIcon(disasterType)}
          >
            <Popup>
              <div className="custom-popup">
                <div className="popup-header">
                  <span className="popup-icon"><config.icon size={20} color={config.color || 'white'} /></span>
                  <span className="popup-type">{config.name}</span>
                  <span className="popup-severity">
                    {alert.severity || 'Medium'}
                  </span>
                </div>
                <div className="popup-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.description}</p>
                  <div className="popup-meta">
                    <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                    {alert.location && (
                      <span>📍 {alert.location}</span>
                    )}
                  </div>
                  {alert.link && (
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                      <a
                        href={alert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#00fff7',
                          textDecoration: 'underline',
                          fontWeight: 600,
                          fontSize: '0.98em',
                          textShadow: '0 0 6px #00fff7cc',
                          transition: 'color 0.2s',
                        }}
                      >
                        🔗 More Info
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ));
      })}
    </>
  );
};

// Component to render static location markers (sites and emergency contacts) with neon rings
const LocationMarkers = ({ locations }) => {
  return (
    <>
      {locations.map((location) => {
        if (!location.latitude || !location.longitude) {
          return null;
        }

        // Choose icon based on type
        const icon = location.type === 'emergency_contact' ? emergencyIcon : buildingIcon;
        
        return (
          <React.Fragment key={location.id}>
            {/* Add yellow neon ring around site markers only */}
            {location.type === 'site' && (
              <Circle
                center={[location.latitude, location.longitude]}
                radius={50000} // 50km in meters
                pathOptions={{
                  color: '#ffff00', // Yellow color
                  weight: 2,
                  opacity: 0.5,
                  fillColor: '#ffff00',
                  fillOpacity: 0.09,
                  className: 'neon-ring'
                }}
              />
            )}
            
            {/* The marker itself */}
            <Marker
              position={[location.latitude, location.longitude]}
              icon={icon}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {location.type === 'emergency_contact' ? (
                      <MdLocalHospital size={20} color="#e74c3c" />
                    ) : (
                      <IoLocationSharp size={20} color="#2d98da" />
                    )}
                    <span>{location.type === 'emergency_contact' ? 'Emergency Contact' : 'Site'}</span>
                  </div>
                  <div>
                    <strong>{location.name}</strong>
                    {location.address && (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                        📍 {location.address}
                      </div>
                    )}
                    {location.phone && (
                      <div style={{ marginTop: '4px', fontSize: '14px' }}>
                        📞 {location.phone}
                      </div>
                    )}
                    {location.email && (
                      <div style={{ marginTop: '4px', fontSize: '14px' }}>
                        📧 {location.email}
                      </div>
                    )}
                    
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

const MapView = ({ alerts, focusMarker, sites, emergencyContacts, allLocations }) => {
  const mapRef = useRef(null);
  const validAlerts = alerts.filter(alert =>
    alert.coordinates &&
    typeof alert.coordinates.lat === "number" &&
    typeof alert.coordinates.lng === "number"
  );

  // Use allLocations if provided, otherwise combine sites and emergencyContacts
  const locationsToShow = allLocations || [...(sites || []), ...(emergencyContacts || [])];

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
        <br />
        🏢 <strong>{locationsToShow.length}</strong> locations shown
        <br />
        
      </div>

      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        minZoom={2}
        maxBounds={[[-85, -Infinity], [85, Infinity]]}
        maxBoundsViscosity={1.0}
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
          <WrappedMarkers alerts={validAlerts} createAnimatedIcon={createAnimatedIcon} />
        </MarkerClusterGroup>
        
        {/* Render location markers (sites and emergency contacts) with neon rings */}
        <LocationMarkers locations={locationsToShow} />
        
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