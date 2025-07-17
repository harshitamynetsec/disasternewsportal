import React, { useEffect, useState, useRef } from 'react';
import useSites from '../hooks/useSites';
import useAlertData from '../hooks/useAlertData';
import trimmedSirenSound from './463690__rvgerxini__emergency-alarm-with-reverb-[AudioTrimmer.com].mp3';
import NotificationToast from './NotificationToast';

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

const ProximityAlertNotification = ({ groupRadii, canEditGeofence }) => {
  const { sites, isLoading: isLoadingSites } = useSites();
  const { alerts } = useAlertData(undefined, !isLoadingSites);
  const [proximityNotifications, setProximityNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef(null);

  // Find all proximity alert-site pairs
  useEffect(() => {
    if (!sites || !alerts) return;
    const notifications = [];
    for (const site of sites) {
      const siteLat = site.latitude ?? site.lat;
      const siteLng = site.longitude ?? site.lng;
      if (!siteLat || !siteLng) continue;
      // Determine groupId for this site (use site.id as groupId for simplicity)
      const groupId = site.id;
      const radius = canEditGeofence ? (groupRadii && groupRadii[groupId] ? groupRadii[groupId] / 1000 : 50) : 50; // meters to km
      for (const alert of alerts) {
        // Skip mock test alerts
        if (alert.title && alert.title.startsWith('TEST: Mock Disaster')) continue;
        let alertLat, alertLng;
        if (Array.isArray(alert.coordinates)) {
          [alertLat, alertLng] = alert.coordinates;
        } else {
          alertLat = alert.latitude;
          alertLng = alert.longitude;
        }
        if (!alertLat || !alertLng) continue;
        const distance = getDistanceFromLatLonInKm(siteLat, siteLng, alertLat, alertLng);
        if (distance <= radius) {
          notifications.push({
            id: `${alert.title}-${alert.timestamp}-${site.id}`,
            title: alert.title,
            location: site.name,
            time: alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now',
            description: alert.description,
            severity: 'critical',
          });
        }
      }
    }
    setProximityNotifications(notifications);
    // Play siren if any new notifications
    if (notifications.length > 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      // Try to play, catch promise errors
      audioRef.current.play().catch((e) => {
        // Ignore play interruption errors
        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
          console.warn('Audio play error:', e);
        }
      });
      setTimeout(() => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, 2000);
    }
  }, [sites, alerts]);

  // Dismiss handler for individual alerts
  const handleDismiss = (id) => {
    setProximityNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Button style for top-right
  const buttonStyle = {
    position: 'absolute',
    top: '160px',
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
    maxWidth: 500,
    minWidth: 320,
  };

  return (
    <>
      <audio ref={audioRef} src={trimmedSirenSound} />
      {proximityNotifications.length > 0 && (
        <button style={buttonStyle} onClick={() => setShowModal(true)} title="Disaster Proximity Alert!">
          <span role="img" aria-label="siren" style={{ fontSize: 32 }}>🚨</span>
        </button>
      )}
      {showModal && (
        <div style={modalStyle}>
          <div style={{ ...modalBoxStyle, color: '#222' }}>
            <h2 style={{ color: '#d32f2f', marginBottom: 16 }}>🚨 Proximity Alerts</h2>
            {proximityNotifications.length === 0 ? (
              <p style={{ color: '#222', fontWeight: 'bold', fontSize: '1.1em' }}>
                No urgent alerts in the proximity of your sites.
              </p>
            ) : (
              <div style={{ maxHeight: 350, overflowY: 'auto', textAlign: 'left' }}>
                {proximityNotifications.map((alert) => (
                  <div key={alert.id} style={{
                    border: '1px solid #eee',
                    borderRadius: 8,
                    marginBottom: 16,
                    padding: 16,
                    background: '#fff8f8',
                    boxShadow: '0 2px 8px rgba(220,0,0,0.07)'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: 4 }}>{alert.title}</div>
                    <div style={{ color: '#d32f2f', fontWeight: 600, marginBottom: 4 }}>Near site: {alert.location}</div>
                    <div style={{ fontSize: '0.98em', marginBottom: 4 }}>Time: {alert.time}</div>
                    <div style={{ fontSize: '0.97em', marginBottom: 8 }}>
                      Description: {alert.description ? (alert.description.length > 120 ? alert.description.substring(0, 120) + '...' : alert.description) : 'No description'}
                    </div>
                    <button onClick={() => handleDismiss(alert.id)} style={{ padding: '4px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Dismiss</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowModal(false)} style={{ marginTop: 8, padding: '0.5rem 1.5rem', fontSize: '1.1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProximityAlertNotification; 