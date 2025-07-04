import React, { useEffect, useState, useRef } from 'react';
import useSites from '../hooks/useSites';
import useAlertData from '../hooks/useAlertData';
import trimmedSirenSound from './463690__rvgerxini__emergency-alarm-with-reverb-[AudioTrimmer.com].mp3';

// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

const ProximityAlertNotification = () => {
  const { sites } = useSites();
  const { alerts } = useAlertData();
  const [activeAlert, setActiveAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef(null);
  const [lastAlertKey, setLastAlertKey] = useState(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Helper to uniquely identify an alert-site pair
  const getAlertKey = (alert, site) => {
    if (!alert || !site) return null;
    return `${alert.title}-${alert.timestamp}-${site.id}`;
  };

  // Proximity detection
  useEffect(() => {
    if (!sites || !alerts) return;
    let found = false;
    let matchedAlert = null;
    let matchedSite = null;
    for (const site of sites) {
      for (const alert of alerts) {
        if (site.latitude && site.longitude && alert.coordinates) {
          const [alertLat, alertLng] = alert.coordinates;
          const distance = getDistanceFromLatLonInKm(site.latitude, site.longitude, alertLat, alertLng);
          if (distance <= 50) {
            found = true;
            matchedAlert = alert;
            matchedSite = site;
            break;
          }
        }
      }
      if (found) break;
    }
    // Always set both alert and site, even if one is missing
    setActiveAlert({ alert: matchedAlert, site: matchedSite });
    if (found) {
      const newAlertKey = getAlertKey(matchedAlert, matchedSite);
      // Only reset hasPlayed if this is a new alert
      if (newAlertKey !== lastAlertKey) {
        setHasPlayed(false);
        setLastAlertKey(newAlertKey);
        console.log('New proximity alert detected:', newAlertKey);
      }
    } else {
      setShowModal(false);
      setHasPlayed(false);
      setLastAlertKey(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites, alerts]);

  // Set siren volume on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2; // 20% volume
    }
  }, []);

  // Play siren only once for a new alert, never loop or repeat
  useEffect(() => {
    if (activeAlert && audioRef.current && !hasPlayed) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setHasPlayed(true);
      console.log('Siren played for alert:', getAlertKey(activeAlert.alert, activeAlert.site));
      // Stop after 2 seconds (or the length of your trimmed siren)
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlert, hasPlayed]);

  // Stop siren when modal is opened or dismissed
  const handleButtonClick = () => {
    setShowModal(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('Siren stopped on modal open');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('Siren stopped on modal dismiss');
    }
    setHasPlayed(true); // Prevent replay for this alert
  };

  // Button style for top-right
  const buttonStyle = {
    position: 'absolute',
    top: '160px', // moved further down
    right: '40px',
    zIndex: 2000,
    background: '#d32f2f',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px #f00',
    cursor: 'pointer',
   // animation: 'pulse 1.2s infinite',
  };

  // Modal style
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 3000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const modalBoxStyle = {
    background: '#fff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 0 20px #f00',
    textAlign: 'center',
    maxWidth: 400,
  };

  console.log('ProximityAlertNotification render, activeAlert:', activeAlert, 'showModal:', showModal);

  return (
    <>
      <audio ref={audioRef} src={trimmedSirenSound} />
      {activeAlert && (
        <button style={buttonStyle} onClick={handleButtonClick} title="Disaster Proximity Alert!">
          <span role="img" aria-label="siren" style={{ fontSize: 32 }}>🚨</span>
        </button>
      )}
      {showModal && (
        <div style={modalStyle}>
          <div style={{ ...modalBoxStyle, color: '#222' }}>
            <h2 style={{ color: '#d32f2f' }}>🚨 Disaster Alert! 🚨</h2>
            {activeAlert && activeAlert.alert ? (
              <>
                <p style={{ color: '#222' }}><b>{activeAlert.alert.title || 'No title'}</b></p>
                <p style={{ color: '#222' }}>Near site: <b>{activeAlert.site?.name || 'Unknown Site'}</b></p>
                <p style={{ color: '#222' }}>Time: {activeAlert.alert.timestamp ? new Date(activeAlert.alert.timestamp).toLocaleTimeString() : 'Just now'}</p>
                <p style={{ color: '#222' }}>Description: {activeAlert.alert.description || 'No description'}</p>
              </>
            ) : (
              <p style={{ color: 'red' }}>No alert details available. (activeAlert: {JSON.stringify(activeAlert)})</p>
            )}
            <button onClick={handleCloseModal} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '1.1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Dismiss</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 #f00; }
          70% { box-shadow: 0 0 0 10px rgba(255,0,0,0.3); }
          100% { box-shadow: 0 0 0 0 #f00; }
        }
      `}</style>
    </>
  );
};

export default ProximityAlertNotification; 