import { useState, useEffect, useRef } from 'react';
import GeocodingService from '../services/geocodingService';
import mockAlerts from '../data/mockAlerts';

const useAlertData = (showNotification) => {
  const [alerts, setAlerts] = useState([]);
  const [geocodedAlerts, setGeocodedAlerts] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
  const geocodingServiceRef = useRef(null);
  const previousAlertsRef = useRef([]);

  const USE_MOCK_PROXIMITY_DATA = true;
  const mockProximityAlert = {
    title: 'TEST: Mock Disaster Near Site',
    description: 'This is a test alert for proximity detection.',
    coordinates: [14.5995, 120.9842], // Manila
    timestamp: new Date().toISOString(),
    analysis: { disaster_type: 'Test' }
  };

  // Function to sort alerts by date (most recent first)
  const sortAlertsByDate = (alertsArray) => {
    return [...alertsArray].sort((a, b) => {
      const getTimestamp = (alert) => {
        if (alert.timestamp) {
          return new Date(alert.timestamp).getTime();
        }
        if (alert.time) {
          return new Date(alert.time).getTime();
        }
        const utcMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+UTC/);
        if (utcMatch) {
          const [, date, time] = utcMatch;
          const [day, month, year] = date.split('/');
          return new Date(`${month}/${day}/${year} ${time} UTC`).getTime();
        }
        const dateMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split('/');
          return new Date(`${month}/${day}/${year}`).getTime();
        }
        return 0;
      };
      
      const timestampA = getTimestamp(a);
      const timestampB = getTimestamp(b);
      
      return timestampB - timestampA;
    });
  };

  // Function to create a unique identifier for alerts
  const getAlertId = (alert) => {
    return `${alert.title}-${alert.timestamp || alert.time || 'no-time'}`;
  };

  // Function to check for new alerts and trigger notifications
  const checkForNewAlerts = (currentAlerts, previousAlerts) => {
    if (!showNotification || currentAlerts.length === 0) return;

    // If it's the initial load, show notifications for the 2 most recent alerts
    if (isInitialLoad) {
      const recentAlerts = currentAlerts.slice(0, 2);
      recentAlerts.forEach((alert, index) => {
        setTimeout(() => {
          console.log('Showing initial notification for:', alert.title);
          showNotification(alert);
        }, index * 1000); // Stagger notifications by 1 second
      });
      return;
    }

    // For subsequent fetches, find truly new alerts
    const previousAlertIds = new Set(previousAlerts.map(getAlertId));
    const newAlerts = currentAlerts.filter(alert => {
      const alertId = getAlertId(alert);
      return !previousAlertIds.has(alertId);
    });

    // Show notifications for new alerts (max 3 to avoid spam)
    if (newAlerts.length > 0) {
      console.log(`Found ${newAlerts.length} new alerts:`, newAlerts.map(a => a.title));
      const alertsToShow = newAlerts.slice(0, 3);
      
      alertsToShow.forEach((alert, index) => {
        setTimeout(() => {
          console.log('Showing notification for new alert:', alert.title);
          showNotification(alert);
        }, index * 1500); // Stagger notifications by 1.5 seconds
      });
    }
  };

  // Fetch and process alert data
  const fetchAlertData = async () => {
    try {
      console.log('Fetching alert data...');
      const response = await fetch("https://disaster-api-dohm.onrender.com/disaster-news");
      const data = await response.json();

      console.log("Raw data received:", data.length, "alerts");

      const sortedAlerts = sortAlertsByDate(data);
      setAlerts(sortedAlerts);
      
      // Process alerts with existing coordinates
      const alertsWithExistingCoords = sortedAlerts.map(alert => {
        let processedAlert = { ...alert };
        
        if (alert.coordinates && alert.coordinates.lat && alert.coordinates.lng) {
          processedAlert.coordinates = {
            lat: parseFloat(alert.coordinates.lat),
            lng: parseFloat(alert.coordinates.lng),
            country: alert.coordinates.country || alert.country || 'Unknown',
            source: 'provided'
          };
        } else if (alert.lat && alert.lng) {
          processedAlert.coordinates = {
            lat: parseFloat(alert.lat),
            lng: parseFloat(alert.lng),
            country: alert.country || 'Unknown',
            source: 'provided'
          };
        } else if (alert.latitude && alert.longitude) {
          processedAlert.coordinates = {
            lat: parseFloat(alert.latitude),
            lng: parseFloat(alert.longitude),
            country: alert.country || 'Unknown',
            source: 'provided'
          };
        }
        
        return processedAlert;
      });

      // Check for new alerts before updating state
      const previousAlerts = previousAlertsRef.current;
      
      // Update the geocoded alerts state
      setGeocodedAlerts(alertsWithExistingCoords);
      
      // Check for new alerts and show notifications
      checkForNewAlerts(alertsWithExistingCoords, previousAlerts);
      
      // Update the reference for next comparison
      previousAlertsRef.current = [...alertsWithExistingCoords];
      
      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }

      const existingCoordsCount = alertsWithExistingCoords.filter(alert => alert.coordinates).length;
      console.log(`${existingCoordsCount} alerts already have coordinates`);

      // Continue with geocoding if needed
      if (existingCoordsCount < sortedAlerts.length) {
        setIsGeocoding(true);
        setGeocodingProgress(0);

        const finalProcessedAlerts = [];
        let processed = 0;
        
        for (const alert of alertsWithExistingCoords) {
          let finalAlert = { ...alert };
          
          if (!finalAlert.coordinates) {
            try {
              console.log(`Geocoding alert: ${alert.title}`);
              const geocoded = await geocodingServiceRef.current.geocodeAlert(alert);
              if (geocoded && geocoded.coordinates && geocoded.coordinates.lat && geocoded.coordinates.lng) {
                finalAlert.coordinates = {
                  lat: parseFloat(geocoded.coordinates.lat),
                  lng: parseFloat(geocoded.coordinates.lng),
                  country: geocoded.coordinates.country || 'Unknown',
                  source: 'geocoded'
                };
                console.log("Geocoded successfully:", finalAlert.coordinates);
              } else {
                console.log("Geocoding failed for:", alert.title);
              }
            } catch (error) {
              console.warn(`Failed to geocode alert: ${alert.title}`, error);
            }
          }
          
          finalProcessedAlerts.push(finalAlert);
          processed++;
          
          const progress = Math.round((processed / sortedAlerts.length) * 100);
          setGeocodingProgress(progress);

          // Update state periodically during geocoding
          if (processed % 5 === 0 || processed === sortedAlerts.length) {
            const sortedFinalAlerts = sortAlertsByDate(finalProcessedAlerts);
            setGeocodedAlerts([...sortedFinalAlerts]);
          }
        }

        const sortedFinalAlerts = sortAlertsByDate(finalProcessedAlerts);
        setGeocodedAlerts(sortedFinalAlerts);
        setIsGeocoding(false);

        const finalCoordsCount = sortedFinalAlerts.filter(alert => alert.coordinates).length;
        console.log(`Final result: ${finalCoordsCount} alerts have coordinates`);
      }

      setLastFetchTime(new Date());
      
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    geocodingServiceRef.current = new GeocodingService();
    
    // Initial fetch
    fetchAlertData();

    // Set up periodic refresh to check for new alerts
    const refreshInterval = setInterval(() => {
      console.log('Checking for new alerts...');
      fetchAlertData();
    }, 60000); // Check every 60 seconds (increased from 30 to be less aggressive)

    return () => clearInterval(refreshInterval);
  }, []); // Empty dependency array

  // Separate effect to handle showNotification changes
  useEffect(() => {
    // This effect runs when showNotification changes
    // but we don't want to refetch data, just update the reference
  }, [showNotification]);

  if (USE_MOCK_PROXIMITY_DATA) {
    alerts.push(mockProximityAlert);
  }

  return {
    alerts,
    geocodedAlerts,
    isGeocoding,
    geocodingProgress,
    sortAlertsByDate,
    lastFetchTime
  };
};

export default useAlertData;