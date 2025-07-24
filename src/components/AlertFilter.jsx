import React, { useState, useEffect } from "react";
import "./css/AlertFilter.css";

const AlertFilter = ({ alerts, onFilter }) => {
  // Initialize from localStorage or use defaults
  const [search, setSearch] = useState(() => 
    localStorage.getItem('alertFilter_search') || ""
  );
  const [region, setRegion] = useState(() => 
    localStorage.getItem('alertFilter_region') || "All"
  );
  const [disasterType, setDisasterType] = useState(() => 
    localStorage.getItem('alertFilter_disasterType') || "All"
  );

  // Save to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem('alertFilter_search', search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('alertFilter_region', region);
  }, [region]);

  useEffect(() => {
    localStorage.setItem('alertFilter_disasterType', disasterType);
  }, [disasterType]);

  
  const handleReset = () => {
    setSearch("");
    setRegion("All");
    setDisasterType("All");
    // Clear localStorage on reset
    localStorage.removeItem('alertFilter_search');
    localStorage.removeItem('alertFilter_region');
    localStorage.removeItem('alertFilter_disasterType');
    onFilter(alerts);
  };
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

  // Enhanced disaster type detection function
  const getDisasterType = (alert) => {
    // Check multiple possible sources for disaster type
    const sources = [
      alert.analysis?.disaster_type,  // Match MapView's field name
      alert.analysis?.disaster_category, // Keep as fallback
      alert.disaster_type,
      alert.type,
      alert.category,
      alert.title,
      alert.description
    ];

    // Natural disaster keywords (enhanced to match App.js)
    const naturalKeywords = [
      'earthquake', 'tsunami', 'flood', 'hurricane', 'typhoon', 'cyclone',
      'tornado', 'wildfire', 'fire', 'volcano', 'landslide', 'drought',
      'blizzard', 'avalanche', 'storm', 'lightning', 'hail', 'natural',
      'severe thunderstorm', 'weather'
    ];

    // Man-made disaster keywords (enhanced to match App.js)
    const manMadeKeywords = [
      'explosion', 'accident', 'chemical', 'nuclear', 'oil spill', 'terrorist',
      'attack', 'bombing', 'industrial', 'man made', 'man-made', 'anthropogenic',
      'pollution', 'toxic', 'hazmat', 'cyber', 'infrastructure', 'incident'
    ];

    // Check each source
    for (const source of sources) {
      if (!source) continue;
      
      const text = source.toString().toLowerCase();
      
      // Direct match first
      if (text === 'natural' || text.includes('natural disaster')) {
        return 'natural';
      }
      if (text === 'man made' || text === 'man-made' || text.includes('man-made') || text.includes('anthropogenic')) {
        return 'man made';
      }
      
      // Keyword matching
      if (naturalKeywords.some(keyword => text.includes(keyword))) {
        return 'natural';
      }
      if (manMadeKeywords.some(keyword => text.includes(keyword))) {
        return 'man made';
      }
    }
    
    return 'unknown';
  };

  // Debug logging (temporary - remove after testing)
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      console.log('AlertFilter - Sample alert structure:', alerts[0]);
      console.log('AlertFilter - Available properties:', Object.keys(alerts[0]));
      if (alerts[0].analysis) {
        console.log('AlertFilter - Analysis properties:', Object.keys(alerts[0].analysis));
        console.log('AlertFilter - Disaster type:', alerts[0].analysis.disaster_type);
        console.log('AlertFilter - Disaster category:', alerts[0].analysis.disaster_category);
      }
      
      // Test disaster type detection on first few alerts
      const sampleAlerts = alerts.slice(0, 3);
      sampleAlerts.forEach((alert, index) => {
        const detectedType = getDisasterType(alert);
        console.log(`AlertFilter - Alert ${index + 1}: "${alert.title}" -> Detected type: ${detectedType}`);
      });
    }
  }, [alerts]);

  const handleFilter = () => {
    let filtered = alerts;

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

    // Enhanced disaster type filter
    if (disasterType !== "All") {
      console.log(`AlertFilter - Filtering for disaster type: ${disasterType}`);
      filtered = filtered.filter(alert => {
        const alertType = getDisasterType(alert);
        const matches = alertType === disasterType.toLowerCase();
        
        // Debug logging for filtering
        if (process.env.NODE_ENV === 'development') {
          console.log(`AlertFilter - Alert: "${alert.title.substring(0, 50)}..." | Detected: ${alertType} | Looking for: ${disasterType.toLowerCase()} | Matches: ${matches}`);
        }
        
        return matches;
      });
      console.log(`AlertFilter - Found ${filtered.length} alerts matching disaster type: ${disasterType}`);
    }

    onFilter(filtered);
  };


  // Auto-apply filters when inputs change (optional enhancement)
  useEffect(() => {
    handleFilter();
  }, [search, region, disasterType, alerts]);

  return (
    <div className="alert-filter">
      <input
        type="text"
        placeholder="Search alerts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 220 }}
      />
      
      <select value={region} onChange={e => setRegion(e.target.value)}>
        <option value="All">All Regions</option>
        <option value="APJ">APJ (Asia Pacific & Japan)</option>
        <option value="AMS">AMS (Americas)</option>
        <option value="EMEA">EMEA (Europe, Middle East, Africa)</option>
      </select>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
        <select
          value={disasterType}
          onChange={e => setDisasterType(e.target.value)}
          style={{ width: 220 }}
          title="Filter by disaster category"
        >
          <option value="All">All Types</option>
          <option value="natural">Natural Disasters</option>
          <option value="man made">Man-Made Disasters</option>
          <option value="unknown">Uncategorized</option>
        </select>
        <button onClick={handleFilter}>Apply</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default AlertFilter;
