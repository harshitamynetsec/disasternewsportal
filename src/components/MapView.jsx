import React, { useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import './css/MapView.css';
import { MdOutlineHouseSiding, MdOutlineFlood, MdOutlineLocalFireDepartment, MdOutlineStorm, MdOutlineTsunami, MdOutlineWarning, MdOutlineReportProblem, MdBusiness } from 'react-icons/md';
import { FaMountain, FaWind, FaRegSun } from 'react-icons/fa';
import { WiHurricane, WiTornado, WiDaySunny, WiCloudyWindy } from 'react-icons/wi';
import { GiCactus, GiPoliceBadge } from 'react-icons/gi';
import { GiVolcano, GiDesert } from 'react-icons/gi';
import { IoLocationSharp } from 'react-icons/io5';
import { Polyline } from "react-leaflet";
import { useAuth } from '../context/AuthContext';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Stunning, glowing, theme-adaptive site icon
const buildingIcon = new L.DivIcon({
  html: `
    <div style="
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(30, 60, 150, 0.18);
      box-shadow: 0 0 8px 3px #2d98da66, 0 2px 6px #00c3ff88, 0 0 0 3px #2d98da22;
      border: 2.5px solid #2d98da;
      position: relative;
      z-index: 2;
      animation: siteBuildingGlow 2.2s infinite alternate;
      backdrop-filter: blur(2px) saturate(1.2);
    ">
      <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='currentColor' viewBox='0 0 24 24' style="display:block; color: #fff; filter: drop-shadow(0 0 4px #00eaff99);">
        <defs>
          <radialGradient id='site-glow' cx='50%' cy='50%' r='60%'>
            <stop offset='0%' stop-color='#aeefff' stop-opacity='1'/>
            <stop offset='80%' stop-color='#2d98da' stop-opacity='0.5'/>
            <stop offset='100%' stop-color='#2d98da' stop-opacity='0.12'/>
          </radialGradient>
        </defs>
        <circle cx='12' cy='12' r='11' fill='url(#site-glow)' opacity='0.6'/>
        <path d='M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z' fill='#fff' stroke='#2d98da' stroke-width='0.7'/>
      </svg>
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: 50%;
        box-shadow: 0 0 16px 4px #00eaff33, 0 0 6px 2px #2d98da55;
        pointer-events: none;
        opacity: 0.5;
        animation: siteBuildingPulse 2.2s infinite alternate;
      "></div>
    </div>
  `,
  className: '',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

// HP Site Icon (Blue theme)
const hpSiteIcon = new L.DivIcon({
  html: `
    <div style="
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(30, 60, 150, 0.18);
      box-shadow: 0 0 8px 3px #2d98da66, 0 2px 6px #00c3ff88, 0 0 0 3px #2d98da22;
      border: 2.5px solid #2d98da;
      position: relative;
      z-index: 2;
      animation: siteBuildingGlow 2.2s infinite alternate;
      backdrop-filter: blur(2px) saturate(1.2);
    ">
      <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' fill='currentColor' viewBox='0 0 24 24' style="display:block; color: #fff; filter: drop-shadow(0 0 4px #00eaff99);">
        <defs>
          <radialGradient id='hp-site-glow' cx='50%' cy='50%' r='60%'>
            <stop offset='0%' stop-color='#aeefff' stop-opacity='1'/>
            <stop offset='80%' stop-color='#2d98da' stop-opacity='0.5'/>
            <stop offset='100%' stop-color='#2d98da' stop-opacity='0.12'/>
          </radialGradient>
        </defs>
        <circle cx='12' cy='12' r='11' fill='url(#hp-site-glow)' opacity='0.6'/>
        <path d='M3 22v-18l9-4 9 4v18h-6v-6h-6v6h-6zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm4 12h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z' fill='#fff' stroke='#2d98da' stroke-width='0.7'/>
      </svg>
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: 50%;
        box-shadow: 0 0 16px 4px #00eaff33, 0 0 6px 2px #2d98da55;
        pointer-events: none;
        opacity: 0.5;
        animation: siteBuildingPulse 2.2s infinite alternate;
      "></div>
    </div>
  `,
  className: '',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
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
    iconSvg = renderIconToString((props) => <config.icon size={iconSize} color="white" {...props} />);
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

    /* Toggle Button Animations */
    @keyframes slideToggle {
      0% { transform: translateX(0); }
      100% { transform: translateX(26px); }
    }

    @keyframes buttonGlow {
      0% { box-shadow: 0 0 5px rgba(45, 152, 218, 0.3), 0 0 10px rgba(45, 152, 218, 0.2); }
      50% { box-shadow: 0 0 15px rgba(45, 152, 218, 0.6), 0 0 25px rgba(45, 152, 218, 0.4); }
      100% { box-shadow: 0 0 5px rgba(45, 152, 218, 0.3), 0 0 10px rgba(45, 152, 218, 0.2); }
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

    /* Toggle Button Styles */
    .site-toggle-container {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 401;
      background: rgba(12, 45, 92, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 20px 15px;
      border: 2px solid #2d98da;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      animation: buttonGlow 3s ease-in-out infinite;
      transition: all 0.3s ease;
    }

    .site-toggle-container:hover {
      transform: translateY(-50%) scale(1.05);
      box-shadow: 0 12px 35px rgba(45, 152, 218, 0.4);
    }

    .toggle-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      user-select: none;
    }

    .toggle-switch {
      position: relative;
      width: 54px;
      height: 28px;
      background: linear-gradient(45deg, #34495e, #2c3e50);
      border-radius: 14px;
      border: 2px solid #34495e;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .toggle-switch.active {
      background: linear-gradient(45deg, #2d98da, #3498db);
      border-color: #2d98da;
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        0 0 15px rgba(45, 152, 218, 0.5);
    }

    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
      border-radius: 50%;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .toggle-slider.active {
      transform: translateX(26px);
      background: linear-gradient(45deg, #ffffff, #f8f9fa);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
    }

    .toggle-icon {
      font-size: 18px;
      opacity: 0.9;
      transition: all 0.3s ease;
    }

    .toggle-text {
      font-size: 11px;
      opacity: 0.8;
      transition: all 0.3s ease;
    }

    .site-toggle-container:hover .toggle-icon {
      opacity: 1;
      transform: scale(1.1);
    }

    .site-toggle-container:hover .toggle-text {
      opacity: 1;
    }

    @keyframes siteBuildingGlow {
      0% { box-shadow: 0 0 6px 2px #00eaff66, 0 0 12px 4px #2d98da33, 0 2px 8px #0005; }
      100% { box-shadow: 0 0 16px 6px #00eaff88, 0 0 20px 8px #2d98da55, 0 4px 16px #0007; }
    }
    @keyframes siteBuildingPulse {
      0% { opacity: 0.5; transform: scale(1); }
      100% { opacity: 0.7; transform: scale(1.09); }
    }

    /* Enhanced site toggle styles */
    .site-toggles-container {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 401;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .individual-toggle {
      background: rgba(12, 45, 92, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 18px 12px;
      border: 2px solid #2d98da;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      animation: buttonGlow 3s ease-in-out infinite;
      transition: all 0.3s ease;
    }

    .individual-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 35px rgba(45, 152, 218, 0.4);
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

  // Function to detect specific disaster type for icon display
  const getSpecificDisasterType = (alert) => {
    const sources = [
      alert.title?.toLowerCase() || '',
      alert.description?.toLowerCase() || '',
      alert.type?.toLowerCase() || '',
      alert.category?.toLowerCase() || ''
    ];
    
    const text = sources.join(' ');
    
    // Specific disaster type detection for icons (keeping your original icon logic)
    if (text.includes('earthquake')) return 'earthquake';
    if (text.includes('tsunami')) return 'tsunami';
    if (text.includes('flood')) return 'flood';
    if (text.includes('hurricane') || text.includes('typhoon') || text.includes('cyclone')) return 'hurricane';
    if (text.includes('tornado')) return 'tornado';
    if (text.includes('wildfire') || text.includes('fire')) return 'wildfire';
    if (text.includes('volcano')) return 'volcano';
    if (text.includes('landslide')) return 'landslide';
    if (text.includes('drought')) return 'drought';
    if (text.includes('storm') || text.includes('severe thunderstorm')) return 'storm';
    if (text.includes('weather')) return 'weather';
    if (text.includes('incident') || text.includes('accident')) return 'incident';
    
    return 'default';
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
        
        // Use specific disaster type for icon selection
        const specificDisasterType = getSpecificDisasterType(alert);
        const config = disasterConfig[specificDisasterType?.toLowerCase()] || disasterConfig.default;

        // --- TRAIL LOGIC (unchanged) ---
        let trailPolyline = null;
        if (Array.isArray(alert.trail) && alert.trail.length >= 2) {
          const trailCoords = alert.trail.map(pt => [pt.latitude, pt.longitude]);
          trailPolyline = (
            <Polyline
              key={`trail-${alert.title}-${idx}`}
              positions={trailCoords}
              pathOptions={{
                color: "#00fff7",
                weight: 5,
                opacity: 0.8,
                dashArray: "8, 12",
                className: "storm-historical-trail"
              }}
            />
          );
        }

        return getWrappedLongitudes(lng).map((wrappedLng, i) => (
          <React.Fragment key={`${alert.title}-${alert.timestamp}-${idx}-wrap${i}`}>
            {i === 0 && trailPolyline}
            <Marker
              position={[lat, wrappedLng]}
              icon={createAnimatedIcon(specificDisasterType)}
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
          </React.Fragment>
        ));
      })}
    </>
  );
};

// Helper function to calculate distance between two lat/lng points in km
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Group sites whose geofence circles overlap (distance <= 100km)
function groupSitesByGeofence(sites) {
  // Filter out sites with invalid coordinates first
  const validSites = sites.filter(site => 
    typeof site.latitude === 'number' && 
    typeof site.longitude === 'number' && 
    !isNaN(site.latitude) && 
    !isNaN(site.longitude)
  );
  
  const groups = [];
  const visited = new Set();

  for (let i = 0; i < validSites.length; i++) {
    if (visited.has(i)) continue;
    const group = [i];
    visited.add(i);
    for (let j = 0; j < validSites.length; j++) {
      if (i !== j && !visited.has(j)) {
        const d = calculateDistance(validSites[i].latitude, validSites[i].longitude, validSites[j].latitude, validSites[j].longitude);
        if (d <= 100) {
          group.push(j);
          visited.add(j);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

const LocationMarkers = ({ locations, showHpSites, showCorebridgeSites, groupRadii, handleRadiusChange, canEditGeofence }) => {
  // Filter sites based on toggle states
  const hpSites = locations.filter(loc => 
    loc.type === 'site' && 
    loc.source === 'hp' &&
    showHpSites && 
    typeof loc.latitude === 'number' && 
    typeof loc.longitude === 'number' && 
    !isNaN(loc.latitude) && 
    !isNaN(loc.longitude)
  );

  const corebridgeSites = locations.filter(loc => 
    loc.type === 'site' && 
    loc.source === 'corebridge' &&
    showCorebridgeSites && 
    typeof loc.latitude === 'number' && 
    typeof loc.longitude === 'number' && 
    !isNaN(loc.latitude) && 
    !isNaN(loc.longitude)
  );

  const allVisibleSites = [...hpSites, ...corebridgeSites];

  // Group sites by overlapping geofence (same logic as before)
  const groups = groupSitesByGeofence(allVisibleSites);

  // Map site id to groupId
  const siteIdToGroupId = {};
  groups.forEach((groupIdxs, groupId) => {
    groupIdxs.forEach(idx => {
      siteIdToGroupId[allVisibleSites[idx].id] = groupId;
    });
  });

  const groupCircles = groups.map((groupIdxs, groupId) => {
    if (groupIdxs.length === 1) return null;
    const groupSites = groupIdxs.map(idx => allVisibleSites[idx]);
    const validGroupSites = groupSites.filter(s =>
      typeof s.latitude === 'number' &&
      typeof s.longitude === 'number' &&
      !isNaN(s.latitude) &&
      !isNaN(s.longitude)
    );
    if (validGroupSites.length === 0) return null;
    const lat = validGroupSites.reduce((sum, s) => sum + s.latitude, 0) / validGroupSites.length;
    const lng = validGroupSites.reduce((sum, s) => sum + s.longitude, 0) / validGroupSites.length;
    if (isNaN(lat) || isNaN(lng)) return null;
    const maxDist = Math.max(...validGroupSites.map(s => calculateDistance(lat, lng, s.latitude, s.longitude)));
    const radius = groupRadii[groupId] || Math.max(maxDist * 1000 + 50000, 50000); // at least 50km
    return {
      center: [lat, lng],
      radius,
      members: groupIdxs,
      groupId
    };
  }).filter(Boolean);

  const groupedMarkerIdxs = new Set(groupCircles.flatMap(g => g.members));

  return (
    <>
      {/* Draw group geofence circles */}
      {groupCircles.map((circle, i) => (
        <Circle
          key={`group-geofence-${i}`}
          center={circle.center}
          radius={circle.radius}
          pathOptions={{
            color: '#ffff00',
            weight: 3,
            opacity: 0.7,
            fillColor: '#ffff00',
            fillOpacity: 0.08,
            className: 'site-geofence-ring neon-ring'
          }}
        />
      ))}
      
      {/* HP Site markers */}
      {hpSites.map((site, idx) => {
        const originalIdx = allVisibleSites.findIndex(s => s.id === site.id);
        const groupId = siteIdToGroupId[site.id];
        const groupRadius = groupRadii[groupId] || 50000;
        return (
          <React.Fragment key={`hp-${site.id}`}>
            {!groupedMarkerIdxs.has(originalIdx) && (
              <Circle
                center={[site.latitude, site.longitude]}
                radius={groupRadius}
                pathOptions={{
                  color: '#ffff00',
                  weight: 2,
                  opacity: 0.5,
                  fillColor: '#ffff00',
                  fillOpacity: 0.09,
                  className: 'neon-ring'
                }}
              />
            )}
            <Marker
              position={[site.latitude, site.longitude]}
              icon={hpSiteIcon}
            >
              <Popup>
                <div style={{ minWidth: '220px', maxWidth: '260px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    <IoLocationSharp size={20} color="#2d98da" />
                    <span>HP Site</span>
                  </div>
                  <div>
                    <strong>{site.name}</strong>
                    {site.address && (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                        📍 {site.address}
                      </div>
                    )}
                    {site.phone && (
                      <div style={{ marginTop: '4px', fontSize: '14px' }}>
                        📞 {site.phone}
                      </div>
                    )}
                    {site.email && (
                      <div style={{ marginTop: '4px', fontSize: '14px' }}>
                        📧 {site.email}
                      </div>
                    )}
                  </div>
                  {canEditGeofence && (
                    <div style={{ marginTop: 16, marginBottom: 4 }}>
                      <label style={{ color: '#00fff7', fontWeight: 600, fontSize: '0.98em', display: 'block', marginBottom: 4 }}>
                        Geofence Radius: {Math.round((groupRadii[groupId] || 50000) / 1000)} km
                      </label>
                      <input
                        type="range"
                        min={1000}
                        max={200000}
                        step={1000}
                        value={groupRadii[groupId] || 50000}
                        onChange={e => handleRadiusChange(groupId, Number(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: '#00fff7',
                          filter: 'drop-shadow(0 0 4px #00fff7cc)',
                          marginTop: 2,
                          marginBottom: 2
                        }}
                      />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}

      {/* CoreBridge Site markers (repeat the same slider logic) */}
      {corebridgeSites.map((site, idx) => {
        const originalIdx = allVisibleSites.findIndex(s => s.id === site.id);
        const groupId = siteIdToGroupId[site.id];
        const groupRadius = groupRadii[groupId] || 50000;
        return (
          <React.Fragment key={`cb-${site.id}`}>
            {!groupedMarkerIdxs.has(originalIdx) && (
              <Circle
                center={[site.latitude, site.longitude]}
                radius={groupRadius}
                pathOptions={{
                  color: '#ffff00',
                  weight: 2,
                  opacity: 0.5,
                  fillColor: '#ffff00',
                  fillOpacity: 0.09,
                  className: 'neon-ring'
                }}
              />
            )}
            <Marker
              position={[site.latitude, site.longitude]}
              icon={hpSiteIcon}
            >
              <Popup>
                <div style={{ minWidth: '220px', maxWidth: '260px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    <MdBusiness size={20} color="#2d98da" />
                    <span>HP Site</span>
                  </div>
                  <div>
                    <strong>{site.name}</strong>
                    {site.address && (
                      <div style={{ marginTop: '4px', fontSize: '14px', color: '#666' }}>
                        📍 {site.address}
                      </div>
                    )}
                    {site.phone && (
                      <div style={{ marginTop: '4px', fontSize: '14px' }}>
                        📞 {site.phone}
                      </div>
                    )}
                    {site.email && (
                      <div style={{ marginTop: '4px', fontSize: '14px' }}>
                        📧 {site.email}
                      </div>
                    )}
                  </div>
                  {canEditGeofence && (
                    <div style={{ marginTop: 16, marginBottom: 4 }}>
                      <label style={{ color: '#00fff7', fontWeight: 600, fontSize: '0.98em', display: 'block', marginBottom: 4 }}>
                        Geofence Radius: {Math.round((groupRadii[groupId] || 50000) / 1000)} km
                      </label>
                      <input
                        type="range"
                        min={1000}
                        max={200000}
                        step={1000}
                        value={groupRadii[groupId] || 50000}
                        onChange={e => handleRadiusChange(groupId, Number(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: '#00fff7',
                          filter: 'drop-shadow(0 0 4px #00fff7cc)',
                          marginTop: 2,
                          marginBottom: 2
                        }}
                      />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

const MapView = ({ alerts, focusMarker, sites = [], showHpSites, showCorebridgeSites, groupRadii, handleRadiusChange, canEditGeofence }) => {
  const mapRef = useRef(null);
  
  const validAlerts = alerts.filter(alert =>
    alert.coordinates &&
    typeof alert.coordinates.lat === "number" &&
    typeof alert.coordinates.lng === "number"
  );

  // Use sites for locations
  const locationsToShow = sites || [];
  
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
      
      <MapContainer
        key={JSON.stringify(mapCenter) + zoomLevel}
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
          url="https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}@2x.png?key=kPmWPiwugT5DMGRl4liL"
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
        <LocationMarkers 
          locations={locationsToShow} 
          showHpSites={showHpSites} 
          showCorebridgeSites={showCorebridgeSites} 
          groupRadii={groupRadii} 
          handleRadiusChange={handleRadiusChange} 
          canEditGeofence={canEditGeofence} 
        />
        
        {/* Add MapFocus component */}
        {focusPosition && (
          <MapFocus 
            position={focusPosition}
            zoom={12}
          />
        )}
      </MapContainer>
      
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
    </div>
  );
};

export default MapView;
