
// import React from "react";
// import "./css/AlertCard.css";

// const AlertCard = ({ alert }) => {
//   if (!alert || !alert.analysis || !alert.title) {
//     return <div className="alert-card error">⚠️ Invalid alert data</div>;
//   }

//   const alertType = alert.analysis.disaster_type?.toUpperCase() || "UNKNOWN";
//   const alertTime = new Date(alert.timestamp).toLocaleString("en-IN", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
//   const alertLocation =
//     alert.title.match(/in ([^,]+)/i)?.[1] || "Unknown location";

//   return (
//     <div className="alert-card">
//       <div className="alert-header">
//         <span className={`alert-badge badge-${alertType.toLowerCase()}`}>
//           {alertType}
//         </span>
//         <span className="alert-time">{alertTime}</span>
//       </div>

//       <h3 className="alert-title">{alert.title}</h3>
//       <p className="alert-description">{alert.description || "No description available."}</p>

//       <div className="alert-location">
//         📍 <span>{alertLocation}</span>
//       </div>

//       <div className="alert-footer">
//         🔗 <a href={alert.link} target="_blank" rel="noopener noreferrer">More Info</a>
//       </div>
//     </div>
//   );
// };

// export default AlertCard;



import React, { useState } from "react";
import "./css/AlertCard.css";

const AlertCard = ({ alert, onFeedback }) => {
  const [feedback, setFeedback] = useState(null); // 'helpful' or 'not-helpful'
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFeedback = async (feedbackType) => {
    if (feedback || isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    
    try {
      // Call the parent component's feedback handler
      if (onFeedback) {
        await onFeedback(alert.id || alert._id, feedbackType, alert);
      }
      
      setFeedback(feedbackType);
      
      // Optional: Show success message briefly
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setIsSubmitting(false);
    }
  };

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
        <div className="alert-link">
          🔗 <a href={alert.link} target="_blank" rel="noopener noreferrer">More Info</a>
        </div>
        
        <div className="feedback-section">
          <span className="feedback-label">Was this helpful?</span>
          <div className="feedback-buttons">
            <button
              className={`feedback-btn helpful ${feedback === 'helpful' ? 'selected' : ''} ${isSubmitting ? 'submitting' : ''}`}
              onClick={() => handleFeedback('helpful')}
              disabled={feedback || isSubmitting}
              title="Mark as helpful"
            >
              <span className="btn-icon">👍</span>
              <span className="btn-text">Helpful</span>
              {feedback === 'helpful' && <span className="checkmark">✓</span>}
            </button>
            
            <button
              className={`feedback-btn not-helpful ${feedback === 'not-helpful' ? 'selected' : ''} ${isSubmitting ? 'submitting' : ''}`}
              onClick={() => handleFeedback('not-helpful')}
              disabled={feedback || isSubmitting}
              title="Mark as not helpful"
            >
              <span className="btn-icon">👎</span>
              <span className="btn-text">Not Helpful</span>
              {feedback === 'not-helpful' && <span className="checkmark">✓</span>}
            </button>
          </div>
          
          {feedback && (
            <div className="feedback-thanks">
              <span className="thanks-icon">💫</span>
              Thanks for your feedback!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCard;