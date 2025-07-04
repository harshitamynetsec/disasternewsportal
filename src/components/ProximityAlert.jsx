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

const SIREN_SOUND = trimmedSirenSound;

const ProximityAlert = () => {
  const { sites } = useSites();
  const { alerts } = useAlertData();
  const [showAlert, setShowAlert] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    console.log('ProximityAlert: sites', sites);
    console.log('ProximityAlert: alerts', alerts);
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
            console.log('Proximity match found:', {site, alert, distance});
            found = true;
            matchedAlert = alert;
            matchedSite = site;
            break;
          }
        }
      }
      if (found) break;
    }
    if (found) {
      setAlertInfo({ alert: matchedAlert, site: matchedSite });
      setShowAlert(true);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      setShowAlert(false);
      setAlertInfo(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [sites, alerts]);

  const handleClose = () => {
    setShowAlert(false);
    setAlertInfo(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <>
      <audio ref={audioRef} src={SIREN_SOUND} loop />
      {showAlert && alertInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 0 20px #f00',
            textAlign: 'center',
            maxWidth: 400,
          }}>
            <h2 style={{ color: '#d32f2f' }}>🚨 Disaster Alert! 🚨</h2>
            <p><b>{alertInfo.alert.title}</b></p>
            <p>Near site: <b>{alertInfo.site.name}</b></p>
            <p>Distance: {getDistanceFromLatLonInKm(alertInfo.site.latitude, alertInfo.site.longitude, alertInfo.alert.coordinates[0], alertInfo.alert.coordinates[1]).toFixed(2)} km</p>
            <button onClick={handleClose} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', fontSize: '1.1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Dismiss</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProximityAlert;
 