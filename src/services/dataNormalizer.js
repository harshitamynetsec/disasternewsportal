// src/utils/dataNormalizer.js

/**
 * Parses various date formats from alert titles or descriptions.
 * This is a helper for when date properties like 'timestamp' or 'time' are missing.
 * @param {string} text - The text to parse the date from.
 * @returns {Date|null} - A Date object if found, otherwise null.
 */
const parseDateFromText = (text) => {
    if (!text || typeof text !== 'string') return null;

    // Try to extract UTC date from title (format: 05/06/2025 00:09 UTC)
    const utcMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+UTC/);
    if (utcMatch) {
        const [, date, time] = utcMatch;
        const [day, month, year] = date.split('/');
        return new Date(`${month}/${day}/${year} ${time} UTC`);
    }

    // Try to extract standard date (DD/MM/YYYY)
    const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch) {
        const [day, month, year] = dateMatch[1].split('/');
        return new Date(`${month}/${day}/${year}`);
    }
    
    // Attempt to parse ISO strings if present (e.g., from EONET)
    try {
        const isoDate = new Date(text);
        if (!isNaN(isoDate.getTime())) {
            return isoDate;
        }
    } catch (e) {
        // Ignore parsing errors for non-ISO strings
    }

    return null;
};


/**
 * Normalizes data from the /disaster-news route.
 * @param {Array} rawData - The raw array of disaster news alerts.
 * @returns {Array} - An array of normalized alert objects.
 */
export const normalizeDisasterNews = (rawData) => {
    if (!Array.isArray(rawData)) {
        console.warn("normalizeDisasterNews: Expected an array, received:", rawData);
        return [];
    }
    return rawData.map(item => ({
        // Use an existing ID or generate a unique one if needed
        id: item.id || `disaster-news-${item.title}-${item.timestamp || Math.random()}`,
        title: item.title || 'No Title',
        description: item.description || item.body || 'No description available.',
        // Prefer existing timestamp, then 'time', then parse from title/description
        timestamp: item.timestamp || item.time || parseDateFromText(item.title || item.description)?.toISOString(),
        category: item.category || 'General Disaster',
        sourceApi: 'disaster-news', // Identify the source
        url: item.url || null,
        // Check for existing coordinates in various formats
        coordinates: (item.coordinates && item.coordinates.lat && item.coordinates.lng) ? {
            lat: parseFloat(item.coordinates.lat),
            lng: parseFloat(item.coordinates.lng),
            country: item.coordinates.country || item.country || 'Unknown'
        } : (item.lat && item.lng) ? {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            country: item.country || 'Unknown'
        } : (item.latitude && item.longitude) ? {
            lat: parseFloat(item.latitude),
            lng: parseFloat(item.longitude),
            country: item.country || 'Unknown'
        } : null,
        // Add raw data for full context if needed (optional)
        _rawData: item
    }));
};

/**
 * Normalizes data from the /eonet-events route.
 * Assumes EONET data has 'events' array, each event has 'title', 'description', 'geometries' etc.
 * @param {Object} rawData - The raw EONET data object.
 * @returns {Array} - An array of normalized alert objects.
 */
export const normalizeEonetEvents = (rawData) => {
    if (!rawData || !Array.isArray(rawData.events)) {
        console.warn("normalizeEonetEvents: Expected object with 'events' array, received:", rawData);
        return [];
    }
    return rawData.events.map(event => {
        // EONET geometries can be complex; pick the first one with coordinates
        const geometry = event.geometries?.[0];
        const coordinates = (geometry && geometry.coordinates && geometry.type === 'Point') ? {
            lat: geometry.coordinates[1], // EONET is [lon, lat]
            lng: geometry.coordinates[0],
            country: 'Unknown' // EONET doesn't always provide country directly, might need reverse geocoding
        } : null;

        return {
            id: event.id,
            title: event.title,
            description: event.description || event.title,
            timestamp: event.geometries?.[0]?.date || event.times?.[0] || parseDateFromText(event.title)?.toISOString(),
            category: event.categories?.[0]?.title || 'EONET Event',
            sourceApi: 'eonet-events',
            url: event.link || null,
            coordinates: coordinates,
            _rawData: event
        };
    });
};

/**
 * Normalizes data from the /usgs-earthquakes route.
 * Assumes USGS data is GeoJSON, with 'features' array.
 * @param {Object} rawData - The raw USGS earthquake data object.
 * @returns {Array} - An array of normalized alert objects.
 */
export const normalizeUsgsEarthquakes = (rawData) => {
    if (!rawData || !Array.isArray(rawData.features)) {
        console.warn("normalizeUsgsEarthquakes: Expected object with 'features' array, received:", rawData);
        return [];
    }
    return rawData.features.map(feature => ({
        id: feature.id,
        title: feature.properties.title,
        description: `Magnitude: ${feature.properties.mag}, Place: ${feature.properties.place}`,
        timestamp: new Date(feature.properties.time).toISOString(), // USGS time is Unix timestamp in ms
        category: 'Earthquake',
        sourceApi: 'usgs-earthquakes',
        url: feature.properties.url,
        coordinates: (feature.geometry && feature.geometry.coordinates && feature.geometry.type === 'Point') ? {
            lat: feature.geometry.coordinates[1], // GeoJSON is [lon, lat, alt]
            lng: feature.geometry.coordinates[0],
            country: 'Unknown' // USGS might not provide country directly
        } : null,
        _rawData: feature
    }));
};

/**
 * Normalizes data from the /noaa-alerts route.
 * Assumes NOAA data has 'features' array.
 * @param {Object} rawData - The raw NOAA alerts data object.
 * @returns {Array} - An array of normalized alert objects.
 */
export const normalizeNoaaAlerts = (rawData) => {
    if (!rawData || !Array.isArray(rawData.features)) {
        console.warn("normalizeNoaaAlerts: Expected object with 'features' array, received:", rawData);
        return [];
    }
    return rawData.features.map(feature => {
        const properties = feature.properties;
        const geometry = feature.geometry; // Can be Point, Polygon, or null
        let coordinates = null;

        if (geometry && geometry.type === 'Point' && geometry.coordinates) {
            coordinates = {
                lat: geometry.coordinates[1], // GeoJSON is [lon, lat]
                lng: geometry.coordinates[0],
                country: 'Unknown' // NOAA might not provide country directly
            };
        } else if (geometry && geometry.type === 'Polygon' && geometry.coordinates) {
            // For polygons, you might take the centroid or just the first point
            // For simplicity, let's take the first point of the first linear ring
            const firstPoint = geometry.coordinates[0][0];
            coordinates = {
                lat: firstPoint[1],
                lng: firstPoint[0],
                country: 'Unknown'
            };
        }

        return {
            id: feature.id,
            title: properties.event || properties.headline || 'NOAA Alert',
            description: properties.description || properties.headline,
            timestamp: properties.sent || properties.effective || properties.onset || parseDateFromText(properties.headline)?.toISOString(),
            category: properties.event || properties.areaDesc || 'Weather Alert',
            sourceApi: 'noaa-alerts',
            url: properties.url || null,
            coordinates: coordinates,
            _rawData: feature
        };
    });
};

// Add more normalization functions for /gdacs-nasa, /google-news if you use them.
// The /weather?city= route is typically for single-city weather, not map-based alerts,
// so it might be handled separately or not normalized into the alert list.

// Example of a common alert structure:
// {
//   id: string, // Unique identifier
//   title: string,
//   description: string,
//   timestamp: string (ISO date string),
//   category: string (e.g., 'Flood', 'Earthquake', 'Wildfire'),
//   sourceApi: string (e.g., 'disaster-news', 'eonet-events'),
//   url: string (link to original alert),
//   coordinates: {
//     lat: number,
//     lng: number,
//     country: string (e.g., 'USA', 'India', 'Unknown'),
//     source: 'provided' | 'geocoded' | 'cached' // Added by App.js/GeocodingService
//   } | null,
//   _rawData: Object (optional, for debugging or full context)
// }