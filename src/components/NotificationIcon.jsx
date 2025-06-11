
// NotificationIcon.jsx
import React, { useState } from 'react';
import './css/NotificationIcon.css'; // We'll create this CSS file

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
    <div className="notification-icon-container">
      {/* Notification Bell Icon */}
      <button
        onClick={toggleDropdown}
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
      >
        🔔
        {/* Notification Count Badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3>Recent Notifications</h3>
            <button
              onClick={() => setIsDropdownOpen(false)}
              className="close-button"
            >
              ×
            </button>
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {notificationHistory.length === 0 ? (
              <div className="no-notifications">
                No notifications yet
              </div>
            ) : (
              notificationHistory.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  style={{ borderLeftColor: getNotificationColor(notification.severity) }}
                >
                  <div className="notification-content">
                    <span className="notification-icon">
                      {getNotificationIcon(notification.severity)}
                    </span>
                    <div className="notification-details">
                      <div className="notification-title">
                        {notification.title.length > 60 
                          ? notification.title.substring(0, 60) + '...'
                          : notification.title
                        }
                      </div>
                      <div className="notification-meta">
                        {notification.location && `📍 ${notification.location}`}
                        {notification.location && ' • '}
                        {formatTimeAgo(notification.receivedAt)}
                      </div>
                      {notification.description && (
                        <div className="notification-description">
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
            <div className="notification-footer">
              <span>
                {notificationHistory.length} total notification{notificationHistory.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;