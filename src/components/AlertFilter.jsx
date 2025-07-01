import React, { useState, useEffect } from "react";
import "./css/AlertFilter.css";

const AlertFilter = ({ alerts, onFilter }) => {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");

  const getAlertTimestamp = (alert) => {
    // Handle different timestamp formats
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

  // Helper: Map country/location to region
  const getRegion = (alert) => {
    const location = (alert.location || alert.country || alert.title || "").toLowerCase();
    // APJ: Asia Pacific and Japan
    const apjKeywords = [
      "asia", "japan", "china", "india", "indonesia", "malaysia", "singapore", "thailand", "vietnam", "philippines", "korea", "australia", "new zealand", "pakistan", "bangladesh", "sri lanka", "nepal", "myanmar", "taiwan", "hong kong", "mongolia", "cambodia", "laos", "brunei", "fiji", "papua", "solomon", "micronesia", "palau", "timor", "maldives", "bhutan"
    ];
    // AMS: Americas
    const amsKeywords = [
      "america", "usa", "united states", "canada", "mexico", "brazil", "argentina", "chile", "colombia", "peru", "venezuela", "ecuador", "bolivia", "paraguay", "uruguay", "guyana", "suriname", "panama", "cuba", "jamaica", "haiti", "dominican", "puerto rico", "trinidad", "barbados", "bahamas", "belize", "guatemala", "honduras", "el salvador", "nicaragua", "costa rica"
    ];
    // EMEA: Europe, Middle East, Africa
    const emeaKeywords = [
      "europe", "france", "germany", "uk", "united kingdom", "italy", "spain", "portugal", "netherlands", "belgium", "sweden", "norway", "finland", "denmark", "switzerland", "austria", "poland", "czech", "slovakia", "hungary", "romania", "bulgaria", "greece", "russia", "ukraine", "turkey", "israel", "saudi", "uae", "emirates", "iran", "iraq", "egypt", "south africa", "nigeria", "kenya", "morocco", "algeria", "tunisia", "libya", "sudan", "ethiopia", "ghana", "tanzania", "angola", "zambia", "zimbabwe", "cameroon", "ivory coast", "senegal", "mozambique", "madagascar", "congo", "somalia", "chad", "niger", "mali", "rwanda", "burundi", "benin", "botswana", "gabon", "lesotho", "malawi", "mauritania", "namibia", "sierra leone", "togo", "uganda"
    ];
    if (apjKeywords.some(k => location.includes(k))) return "APJ";
    if (amsKeywords.some(k => location.includes(k))) return "AMS";
    if (emeaKeywords.some(k => location.includes(k))) return "EMEA";
    return "Other";
  };

  const handleFilter = () => {
    let filtered = alerts;
    const now = new Date().getTime();

    // Search filter
    if (search) {
      filtered = filtered.filter(alert => {
        const title = alert.title?.toLowerCase() || '';
        const description = alert.description?.toLowerCase() || '';
        const location = alert.location?.toLowerCase() || '';
        const searchTerm = search.toLowerCase();
        return title.includes(searchTerm) || 
               description.includes(searchTerm) || 
               location.includes(searchTerm);
      });
    }

    // Region filter
    if (region !== "All") {
      filtered = filtered.filter(alert => getRegion(alert) === region);
    }

    onFilter(filtered);
  };

  const handleReset = () => {
    setSearch("");
    setRegion("All");
    onFilter(alerts);
  };

  return (
    <div className="alert-filter">
      <input
        type="text"
        placeholder="Search alerts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <select value={region} onChange={e => setRegion(e.target.value)}>
        <option value="All">All Regions</option>
        <option value="APJ">APJ (Asia Pacific & Japan)</option>
        <option value="AMS">AMS (Americas)</option>
        <option value="EMEA">EMEA (Europe, Middle East, Africa)</option>
      </select>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={handleFilter}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default AlertFilter;