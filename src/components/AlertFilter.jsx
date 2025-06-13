import React, { useState, useEffect } from "react";
import "./css/AlertFilter.css";

const AlertFilter = ({ alerts, onFilter }) => {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("All");
  const [disasterType, setDisasterType] = useState("All");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [region, setRegion] = useState("All");

  // Extract unique disaster types from alerts
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const types = new Set();
      
      alerts.forEach(alert => {
        // Try different ways to get disaster type
        if (alert.analysis?.disaster_type) {
          types.add(alert.analysis.disaster_type.toUpperCase());
        } else if (alert.type) {
          types.add(alert.type.toUpperCase());
        } else {
          // Extract from title - look for common disaster keywords
          const title = alert.title?.toLowerCase() || '';
          if (title.includes('earthquake')) types.add('EARTHQUAKE');
          else if (title.includes('flood')) types.add('FLOOD');
          else if (title.includes('fire') || title.includes('wildfire')) types.add('WILDFIRE');
          else if (title.includes('storm') || title.includes('hurricane') || title.includes('cyclone')) types.add('STORM');
          else if (title.includes('tsunami')) types.add('TSUNAMI');
          else if (title.includes('volcano')) types.add('VOLCANIC');
          else if (title.includes('landslide')) types.add('LANDSLIDE');
          else if (title.includes('drought')) types.add('DROUGHT');
          else types.add('OTHER');
        }
      });
      
      setAvailableTypes(Array.from(types).sort());
    }
  }, [alerts]);

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

  const getAlertDisasterType = (alert) => {
    if (alert.analysis?.disaster_type) {
      return alert.analysis.disaster_type.toUpperCase();
    } else if (alert.type) {
      return alert.type.toUpperCase();
    } else {
      // Extract from title
      const title = alert.title?.toLowerCase() || '';
      if (title.includes('earthquake')) return 'EARTHQUAKE';
      if (title.includes('flood')) return 'FLOOD';
      if (title.includes('fire') || title.includes('wildfire')) return 'WILDFIRE';
      if (title.includes('storm') || title.includes('hurricane') || title.includes('cyclone')) return 'STORM';
      if (title.includes('tsunami')) return 'TSUNAMI';
      if (title.includes('volcano')) return 'VOLCANIC';
      if (title.includes('landslide')) return 'LANDSLIDE';
      if (title.includes('drought')) return 'DROUGHT';
      return 'OTHER';
    }
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

    // Time filter
    if (timeFilter !== "All") {
      const timeThresholds = {
        "1h": 1 * 60 * 60 * 1000,     // 1 hour in milliseconds
        "24h": 24 * 60 * 60 * 1000,   // 24 hours in milliseconds
        "48h": 48 * 60 * 60 * 1000    // 48 hours in milliseconds
      };
      
      const threshold = timeThresholds[timeFilter];
      if (threshold) {
        filtered = filtered.filter(alert => {
          const alertTime = getAlertTimestamp(alert);
          return alertTime > 0 && (now - alertTime) <= threshold;
        });
      }
    }

    // Disaster type filter
    if (disasterType !== "All") {
      filtered = filtered.filter(alert => {
        return getAlertDisasterType(alert) === disasterType;
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
    setTimeFilter("All");
    setDisasterType("All");
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
      
      <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
        <option value="All">All Time</option>
        <option value="1h">Last 1 Hour</option>
        <option value="24h">Last 24 Hours</option>
        <option value="48h">Last 48 Hours</option>
      </select>

      <select value={disasterType} onChange={(e) => setDisasterType(e.target.value)}>
        <option value="All">All Disasters</option>
        {availableTypes.map(type => (
          <option key={type} value={type}>
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      {/* Region filter dropdown */}
      <select value={region} onChange={e => setRegion(e.target.value)}>
        <option value="All">All Regions</option>
        <option value="APJ">APJ (Asia Pacific & Japan)</option>
        <option value="AMS">AMS (Americas)</option>
        <option value="EMEA">EMEA (Europe, Middle East, Africa)</option>
      </select>

      <button onClick={handleFilter}>Apply</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default AlertFilter;