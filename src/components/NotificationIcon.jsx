import React, { useState } from 'react';

const NotificationIcon = ({ notificationHistory, unreadCount, onMarkAllAsRead }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && unreadCount > 0) {
      // Mark all as read when opening dropdown
      onMarkAllAsRead();
    }
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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Notification Bell Icon */}
      <button
        onClick={toggleDropdown}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        🔔
        {/* Notification Count Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            width: '400px',
            maxHeight: '500px',
            backgroundColor: '#1a4480',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 1001,
            backdropFilter: 'blur(10px)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>
              Recent Notifications
            </h3>
            <button
              onClick={() => setIsDropdownOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                opacity: 0.7
              }}
              onMouseOver={(e) => e.target.style.opacity = '1'}
              onMouseOut={(e) => e.target.style.opacity = '0.7'}
            >
              ×
            </button>
          </div>

          {/* Notification List */}
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px'
            }}
          >
            {notificationHistory.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '14px'
                }}
              >
                No notifications yet
              </div>
            ) : (
              notificationHistory.map((notification, index) => (
                <div
                  key={notification.id}
                  style={{
                    padding: '12px',
                    margin: '4px 0',
                    backgroundColor: notification.isRead 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getNotificationColor(notification.severity)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = notification.isRead 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px', marginTop: '2px' }}>
                      {getNotificationIcon(notification.severity)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 'bold',
                          fontSize: '13px',
                          color: 'white',
                          marginBottom: '4px',
                          lineHeight: '1.3'
                        }}
                      >
                        {notification.title.length > 60 
                          ? notification.title.substring(0, 60) + '...'
                          : notification.title
                        }
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          marginBottom: '6px'
                        }}
                      >
                        {notification.location && `📍 ${notification.location}`}
                        {notification.location && ' • '}
                        {formatTimeAgo(notification.receivedAt)}
                      </div>
                      {notification.description && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.3'
                          }}
                        >
                          {notification.description.length > 80 
                            ? notification.description.substring(0, 80) + '...'
                            : notification.description
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificationHistory.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {notificationHistory.length} total notification{notificationHistory.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* CSS Animation for pulse effect */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `
      }} />
    </div>
  );
};

export default NotificationIcon;