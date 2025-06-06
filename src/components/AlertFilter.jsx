import React, { useState } from "react";
import "./css/AlertFilter.css"; // Assuming you have a CSS file for styling

const AlertFilter = ({ alerts, onFilter }) => {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [type, setType] = useState("All");

  const handleFilter = () => {
    let filtered = alerts;

    if (search) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(search.toLowerCase()) ||
        alert.description.toLowerCase().includes(search.toLowerCase()) ||
        alert.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (severity !== "All") {
      filtered = filtered.filter(alert => alert.severity === severity);
    }

    if (type !== "All") {
      filtered = filtered.filter(alert => alert.type === type);
    }

    onFilter(filtered);
  };

  return (
    <div className="alert-filter">
      <input
        type="text"
        placeholder="Search alerts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option>All</option>
        <option>High</option>
        <option>Moderate</option>
        <option>Low</option>
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option>All</option>
        <option>Weather</option>
        <option>Emergency</option>
        <option>Traffic</option>
      </select>

      <button onClick={handleFilter}>Apply</button>
      <button onClick={() => {
        setSearch("");
        setSeverity("All");
        setType("All");
        onFilter(alerts); // Reset filter
      }}>Reset</button>
    </div>
  );
};

export default AlertFilter;
