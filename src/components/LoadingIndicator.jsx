import React from 'react';

const LoadingIndicator = ({ isGeocoding, geocodingProgress }) => {
  if (!isGeocoding) return null;

  return (
    <div style={{
      backgroundColor: "#1a4480",
      padding: "1rem",
      borderRadius: "8px",
      marginBottom: "1rem",
      textAlign: "center"
    }}>
      <div>🌍 Processing locations for map display... ({geocodingProgress}%)</div>
      <div style={{
        width: "100%",
        backgroundColor: "#0c2d5c",
        borderRadius: "4px",
        marginTop: "0.5rem"
      }}>
        <div style={{
          width: `${geocodingProgress}%`,
          backgroundColor: "#4CAF50",
          height: "8px",
          borderRadius: "4px",
          transition: "width 0.3s ease"
        }}></div>
      </div>
      <div className="runner-loader"></div>
    </div>
  );
};

export default LoadingIndicator;