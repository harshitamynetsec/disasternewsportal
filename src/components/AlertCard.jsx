// import React from "react";
// import "./css/AlertCard.css";

// const AlertCard = ({ alert }) => {
//   // Guard clause: Don't render if alert is missing or malformed
//   if (!alert || !alert.type || !alert.title) {
//     return (
//       <div className="alert-card error">
//         ⚠️ Invalid alert data
//       </div>
//     );
//   }

//   const alertType = alert.type.toLowerCase();
//   const alertTime = alert.time || "Unknown time";
//   const alertLocation = alert.location || "Unknown location";

//   return (
//     <div className="alert-card">
//       <div className="alert-header">
//         <span className={`alert-badge badge-${alertType}`}>
//           {alert.type}
//         </span>
//         <span className="alert-time">{alertTime}</span>
//       </div>

//       <h3 className="alert-title">{alert.title}</h3>
//       <p className="alert-description">{alert.description || "No description available."}</p>

//       <div className="alert-location">
//         📍 <span>{alertLocation}</span>
//       </div>
//     </div>
//   );
// };

// export default AlertCard;
import React from "react";
import "./css/AlertCard.css";

const AlertCard = ({ alert }) => {
  if (!alert || !alert.analysis || !alert.title) {
    return <div className="alert-card error">⚠️ Invalid alert data</div>;
  }

  const alertType = alert.analysis.disaster_type?.toUpperCase() || "UNKNOWN";
  const alertTime = new Date(alert.timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const alertLocation =
    alert.title.match(/in ([^,]+)/i)?.[1] || "Unknown location";

  return (
    <div className="alert-card">
      <div className="alert-header">
        <span className={`alert-badge badge-${alertType.toLowerCase()}`}>
          {alertType}
        </span>
        <span className="alert-time">{alertTime}</span>
      </div>

      <h3 className="alert-title">{alert.title}</h3>
      <p className="alert-description">{alert.description || "No description available."}</p>

      <div className="alert-location">
        📍 <span>{alertLocation}</span>
      </div>

      <div className="alert-footer">
        🔗 <a href={alert.link} target="_blank" rel="noopener noreferrer">More Info</a>
      </div>
    </div>
  );
};

export default AlertCard;
