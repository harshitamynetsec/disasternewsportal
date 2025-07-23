// src/services/alertProcessor.js
export const categorizeDisaster = (alert) => {
  // Natural disaster keywords
  const naturalKeywords = [
    'earthquake', 'tsunami', 'flood', 'hurricane', 'typhoon', 'cyclone',
    'tornado', 'wildfire', 'fire', 'volcano', 'landslide', 'drought',
    'blizzard', 'avalanche', 'storm', 'lightning', 'hail', 'natural'
  ];

  // Man-made disaster keywords
  const manMadeKeywords = [
    'explosion', 'accident', 'chemical', 'nuclear', 'oil spill', 'terrorist',
    'attack', 'bombing', 'industrial', 'man made', 'man-made', 'anthropogenic',
    'pollution', 'toxic', 'hazmat', 'cyber', 'infrastructure'
  ];

  // Check multiple sources for disaster type
  const sources = [
    alert.title,
    alert.description,
    alert.type,
    alert.category
  ];

  for (const source of sources) {
    if (!source) continue;
    
    const text = source.toString().toLowerCase();
    
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

export const processAlert = (rawAlert) => {
  const disasterCategory = categorizeDisaster(rawAlert);
  
  return {
    ...rawAlert,
    analysis: {
      ...rawAlert.analysis,
      disaster_type: disasterCategory,
      disaster_category: disasterCategory
    }
  };
};

export const processAlerts = (rawAlerts) => {
  return rawAlerts.map(processAlert);
};
