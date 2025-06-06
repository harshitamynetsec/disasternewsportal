import React from "react";
import "./css/AlertStats.css"; // Assuming you have a CSS file for styling

const AlertStats = ({ alerts }) => {
  const total = alerts.length;
  const byType = alerts.reduce((acc, alert) => {
    const type = alert.type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const bySeverity = alerts.reduce((acc, alert) => {
    const severity = alert.severity || "Unknown";
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="alert-stats-container">
      <h2>📊 Alert Summary</h2>
      <div className="alert-stats-cards">
        <div className="stat-card total">
          <h3>Total Alerts</h3>
          <p>{total}</p>
        </div>

        {Object.entries(byType).map(([type, count]) => (
          <div className="stat-card type" key={type}>
            <h3>{type} Alerts</h3>
            <p>{count}</p>
          </div>
        ))}

        {Object.entries(bySeverity).map(([severity, count]) => (
          <div className="stat-card severity" key={severity}>
            <h3>{severity} Severity</h3>
            <p>{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertStats;
