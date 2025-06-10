// import { useState, useCallback, useRef } from 'react';

// const useNotifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const processedAlerts = useRef(new Set()); // Track processed alerts to avoid duplicates

//   // Function to determine alert severity
//   const getAlertSeverity = (alert) => {
//     const title = alert.title?.toLowerCase() || '';
//     const description = alert.description?.toLowerCase() || '';
//     const content = title + ' ' + description;

//     if (content.includes('tsunami') || content.includes('earthquake') ||
//         content.includes('hurricane') || content.includes('emergency') ||
//         content.includes('evacuation') || content.includes('critical')) {
//       return 'critical';
//     }
//     if (content.includes('warning') || content.includes('severe') ||
//         content.includes('storm') || content.includes('flood')) {
//       return 'high';
//     }
//     if (content.includes('watch') || content.includes('advisory') ||
//         content.includes('alert')) {
//       return 'medium';
//     }
//     return 'low';
//   };

//   // Function to create notification from alert
//   const createNotification = (alert) => {
//     const severity = getAlertSeverity(alert);
    
//     return {
//       id: `${alert.id || Date.now()}-${Math.random()}`,
//       title: alert.title || 'New Alert',
//       description: alert.description || alert.summary || '',
//       location: alert.coordinates?.country || alert.location || 'Unknown Location',
//       time: alert.time ? new Date(alert.time).toLocaleTimeString() : 'Just now',
//       severity: severity,
//       originalAlert: alert
//     };
//   };

//   // Function to show notification
//   const showNotification = useCallback((alert) => {
//     // Create a unique identifier for the alert
//     const alertId = alert.id || `${alert.title}-${alert.time}`;
    
//     // Check if we've already processed this alert
//     if (processedAlerts.current.has(alertId)) {
//       return;
//     }
    
//     // Mark as processed
//     processedAlerts.current.add(alertId);
    
//     const notification = createNotification(alert);
//     setNotifications(prev => {
//       // Keep only the latest 3 notifications
//       const newNotifications = [notification, ...prev.slice(0, 2)];
//       return newNotifications;
//     });
//   }, []);

//   // Function to show multiple notifications (for initial load)
//   const showMultipleNotifications = useCallback((alerts) => {
//     if (!alerts || alerts.length === 0) return;
    
//     // Get the latest 2 alerts that haven't been processed
//     const newAlerts = alerts
//       .filter(alert => {
//         const alertId = alert.id || `${alert.title}-${alert.time}`;
//         return !processedAlerts.current.has(alertId);
//       })
//       .slice(0, 2); // Only show 2 at a time to avoid overwhelming
    
//     newAlerts.forEach((alert, index) => {
//       setTimeout(() => {
//         showNotification(alert);
//       }, index * 1000); // Stagger notifications by 1 second
//     });
//   }, [showNotification]);

//   // Function to dismiss notification
//   const dismissNotification = useCallback((id) => {
//     setNotifications(prev => prev.filter(n => n.id !== id));
//   }, []);

//   // Function to clear all notifications
//   const clearAllNotifications = useCallback(() => {
//     setNotifications([]);
//   }, []);

//   // Function to check for new alerts and show notifications
//   const checkForNewAlerts = useCallback((newAlerts, previousAlerts = []) => {
//     if (!newAlerts || newAlerts.length === 0) return;
    
//     // If no previous alerts (initial load), show latest alerts
//     if (previousAlerts.length === 0) {
//       showMultipleNotifications(newAlerts);
//       return;
//     }
    
//     // Find truly new alerts by comparing with previous alerts
//     const previousAlertIds = new Set(
//       previousAlerts.map(alert => alert.id || `${alert.title}-${alert.time}`)
//     );
    
//     const reallyNewAlerts = newAlerts.filter(alert => {
//       const alertId = alert.id || `${alert.title}-${alert.time}`;
//       return !previousAlertIds.has(alertId);
//     });
    
//     // Show notifications for new alerts
//     reallyNewAlerts.forEach((alert, index) => {
//       setTimeout(() => {
//         showNotification(alert);
//       }, index * 1500); // Stagger by 1.5 seconds
//     });
//   }, [showNotification, showMultipleNotifications]);

//   return {
//     notifications,
//     showNotification,
//     showMultipleNotifications,
//     dismissNotification,
//     clearAllNotifications,
//     checkForNewAlerts
//   };
// };

// export default useNotifications;

import { useState, useCallback, useRef } from 'react';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]); // Active notifications queue
  const [notificationHistory, setNotificationHistory] = useState([]); // All notifications history
  const [unreadCount, setUnreadCount] = useState(0);
  const processedAlerts = useRef(new Set()); // Track processed alerts to avoid duplicates

  // Function to determine alert severity
  const getAlertSeverity = (alert) => {
    const title = alert.title?.toLowerCase() || '';
    const description = alert.description?.toLowerCase() || '';
    const content = title + ' ' + description;

    if (content.includes('tsunami') || content.includes('earthquake') ||
        content.includes('hurricane') || content.includes('emergency') ||
        content.includes('evacuation') || content.includes('critical')) {
      return 'critical';
    }
    if (content.includes('warning') || content.includes('severe') ||
        content.includes('storm') || content.includes('flood')) {
      return 'high';
    }
    if (content.includes('watch') || content.includes('advisory') ||
        content.includes('alert')) {
      return 'medium';
    }
    return 'low';
  };

  // Function to create notification from alert
  const createNotification = (alert) => {
    const severity = getAlertSeverity(alert);
    
    return {
      id: `${alert.id || Date.now()}-${Math.random()}`,
      title: alert.title || 'New Alert',
      description: alert.description || alert.summary || '',
      location: alert.coordinates?.country || alert.location || 'Unknown Location',
      time: alert.time ? new Date(alert.time).toLocaleTimeString() : 'Just now',
      severity: severity,
      originalAlert: alert,
      receivedAt: new Date().toISOString(),
      isRead: false
    };
  };

  // Function to show notification (adds to queue for sequential display)
  const showNotification = useCallback((alert) => {
    // Create a unique identifier for the alert
    const alertId = alert.id || `${alert.title}-${alert.time}`;
    
    // Check if we've already processed this alert
    if (processedAlerts.current.has(alertId)) {
      return;
    }
    
    // Mark as processed
    processedAlerts.current.add(alertId);
    
    const notification = createNotification(alert);
    
    // Add to active notifications queue (for sequential display)
    setNotifications(prev => [...prev, notification]);
    
    // Add to history (for persistent storage)
    setNotificationHistory(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);
    
    console.log('Added notification to queue:', notification.title);
  }, []);

  // Function to show multiple notifications (for initial load)
  const showMultipleNotifications = useCallback((alerts) => {
    if (!alerts || alerts.length === 0) return;
    
    // Get the latest 3 alerts that haven't been processed
    const newAlerts = alerts
      .filter(alert => {
        const alertId = alert.id || `${alert.title}-${alert.time}`;
        return !processedAlerts.current.has(alertId);
      })
      .slice(0, 3); // Only process 3 at a time
    
    newAlerts.forEach((alert, index) => {
      setTimeout(() => {
        showNotification(alert);
      }, index * 500); // Stagger adding to queue by 500ms
    });
  }, [showNotification]);

  // Function to dismiss notification (removes from active queue)
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    console.log('Dismissed notification:', id);
  }, []);

  // Function to mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotificationHistory(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  // Function to clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Function to clear notification history
  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
    setUnreadCount(0);
  }, []);

  // Function to check for new alerts and show notifications
  const checkForNewAlerts = useCallback((newAlerts, previousAlerts = []) => {
    if (!newAlerts || newAlerts.length === 0) return;
    
    // If no previous alerts (initial load), show latest alerts
    if (previousAlerts.length === 0) {
      showMultipleNotifications(newAlerts);
      return;
    }
    
    // Find truly new alerts by comparing with previous alerts
    const previousAlertIds = new Set(
      previousAlerts.map(alert => alert.id || `${alert.title}-${alert.time}`)
    );
    
    const reallyNewAlerts = newAlerts.filter(alert => {
      const alertId = alert.id || `${alert.title}-${alert.time}`;
      return !previousAlertIds.has(alertId);
    });
    
    // Show notifications for new alerts
    reallyNewAlerts.forEach((alert, index) => {
      setTimeout(() => {
        showNotification(alert);
      }, index * 1000); // Stagger by 1 second
    });
  }, [showNotification, showMultipleNotifications]);

  return {
    notifications, // Active notifications queue (for toast display)
    notificationHistory, // All notifications history (for dropdown)
    unreadCount, // Count of unread notifications
    showNotification,
    showMultipleNotifications,
    dismissNotification,
    markAllAsRead,
    clearAllNotifications,
    clearNotificationHistory,
    checkForNewAlerts
  };
};

export default useNotifications;