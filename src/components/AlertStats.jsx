// import React from "react";
// import "./css/AlertStats.css"; // Assuming you have a CSS file for styling

// const AlertStats = ({ alerts }) => {
//   const total = alerts.length;
//   const byType = alerts.reduce((acc, alert) => {
//     const type = alert.type || "Unknown";
//     acc[type] = (acc[type] || 0) + 1;
//     return acc;
//   }, {});

//   const bySeverity = alerts.reduce((acc, alert) => {
//     const severity = alert.severity || "Unknown";
//     acc[severity] = (acc[severity] || 0) + 1;
//     return acc;
//   }, {});

//   return (
//     <div className="alert-stats-container">
//       <h2>📊 Alert Summary</h2>
//       <div className="alert-stats-cards">
//         <div className="stat-card total">
//           <h3>Total Alerts</h3>
//           <p>{total}</p>
//         </div>

//         {Object.entries(byType).map(([type, count]) => (
//           <div className="stat-card type" key={type}>
//             <h3>{type} Alerts</h3>
//             <p>{count}</p>
//           </div>
//         ))}

//         {Object.entries(bySeverity).map(([severity, count]) => (
//           <div className="stat-card severity" key={severity}>
//             <h3>{severity} Severity</h3>
//             <p>{count}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AlertStats;





import React from "react";
import "./css/AlertStats.css";

const AlertStats = ({ alerts }) => {
  const total = alerts.length;

  // Function to get alert timestamp
  const getAlertTimestamp = (alert) => {
    if (alert.timestamp) {
      return new Date(alert.timestamp).getTime();
    }
    
    if (alert.time) {
      return new Date(alert.time).getTime();
    }
    
    // Try to extract UTC date from title (format: 05/06/2025 00:09 UTC)
    const utcMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+UTC/);
    if (utcMatch) {
      const [, date, time] = utcMatch;
      const [day, month, year] = date.split('/');
      return new Date(`${month}/${day}/${year} ${time} UTC`).getTime();
    }
    
    // Try to extract date from title
    const dateMatch = alert.title?.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) {
      const [day, month, year] = dateMatch[1].split('/');
      return new Date(`${month}/${day}/${year}`).getTime();
    }
    
    return 0;
  };

  // Calculate today's alerts (last 24 hours)
  const now = new Date().getTime();
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  
  const todaysAlerts = alerts.filter(alert => {
    const alertTime = getAlertTimestamp(alert);
    return alertTime > twentyFourHoursAgo;
  }).length;

  // Placeholder for critical alerts - will be implemented with NLP in future
  // For now, using basic keyword detection as placeholder
  const getCriticalAlertsCount = () => {
    // TODO: Replace with NLP-based severity analysis
    // This is a temporary implementation using basic keywords
    const criticalKeywords = [
      'major', 'severe', 'critical', 'emergency', 'disaster',
      'catastrophic', 'devastating', 'massive', 'intense',
      'magnitude 6', 'magnitude 7', 'magnitude 8', 'magnitude 9',
      'category 4', 'category 5', 'extreme', 'unprecedented'
    ];
    
    return alerts.filter(alert => {
      const text = `${alert.title} ${alert.description}`.toLowerCase();
      return criticalKeywords.some(keyword => text.includes(keyword));
    }).length;
  };

  const criticalAlerts = getCriticalAlertsCount();

  return (
    <div className="alert-stats-container">
      <h2>📊 Alert Summary</h2>
      <div className="alert-stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">🌍</div>
          <h3>Total Alerts</h3>
          <p>{total}</p>
          <span className="stat-label">Worldwide</span>
        </div>

        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <h3>Today's Alerts</h3>
          <p>{todaysAlerts}</p>
          <span className="stat-label">Last 24 Hours</span>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">🚨</div>
          <h3>Critical Alerts</h3>
          <p>{criticalAlerts}</p>
          <span className="stat-label">
            {process.env.NODE_ENV === 'development' ? 'NLP Analysis (Beta)' : 'High Priority'}
          </span>
        </div>
      </div>
      
      {/* Development note - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-note">
          <small>💡 For critical alerts currently use keyword detection. NLP implementation coming soon.</small>
        </div>
      )}
    </div>
  );
};

export default AlertStats;