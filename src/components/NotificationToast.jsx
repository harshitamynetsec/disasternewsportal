import React, { useState, useEffect } from 'react';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          setIsVisible(false);
          setTimeout(onClose, 300);
          return 0;
        }
        return prev - 2; // Decrease by 2% every 100ms (5 seconds total)
      });
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getNotificationIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📰';
    }
  };

  const getNotificationColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffaa00';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: isVisible ? '20px' : '-400px',
        width: '350px',
        backgroundColor: '#1a4480',
        border: `2px solid ${getNotificationColor(notification.severity)}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: getNotificationColor(notification.severity)
        }}>
          {getNotificationIcon(notification.severity)}
          NEW ALERT
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            opacity: 0.7,
            borderRadius: '4px'
          }}
          onMouseOver={(e) => e.target.style.opacity = '1'}
          onMouseOut={(e) => e.target.style.opacity = '0.7'}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '6px',
          color: '#fff'
        }}>
          {notification.title.length > 80 
            ? notification.title.substring(0, 80) + '...'
            : notification.title
          }
        </div>
        
        <div style={{ 
          opacity: 0.8, 
          marginBottom: '8px',
          fontSize: '12px'
        }}>
          {notification.location && `📍 ${notification.location}`}
          {notification.location && notification.time && ' • '}
          {notification.time && `🕒 ${notification.time}`}
        </div>

        {notification.description && (
          <div style={{ 
            opacity: 0.9,
            fontSize: '12px',
            color: '#e0e0e0'
          }}>
            {notification.description.length > 120 
              ? notification.description.substring(0, 120) + '...'
              : notification.description
            }
          </div>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '3px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '0 0 10px 10px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: getNotificationColor(notification.severity),
            transition: 'width 0.1s linear'
          }}
        />
      </div>
    </div>
  );
};

export default NotificationToast;