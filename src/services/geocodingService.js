// src/services/geocodingService.js
class GeocodingService {
  constructor() {
    this.cache = new Map(); // Cache to avoid repeated API calls
    this.rateLimitDelay = 1000; // 1 second delay between requests
    this.lastRequestTime = 0;
  }

  // Extract location from news title/description - WORLDWIDE VERSION
  extractLocation(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();
    
    // Enhanced regex patterns for GLOBAL location extraction
    const patterns = [
      // Pattern 1: "in [location]" (most common globally)
      /\bin\s+([a-z\s,'-]+?)(?:\s*,|\s*\.|$|\s+(?:state|province|region|district|county|city|area|village|town|country))/i,
      
      // Pattern 2: "at/near [location]"
      /(?:near|at|from|across)\s+([a-z\s,'-]+?)(?:\s*,|\s*\.|$|\s+(?:state|province|region|district|county))/i,
      
      // Pattern 3: "[location] + disaster type"
      /([a-z\s,'-]+?)\s+(?:earthquake|flood|fire|disaster|storm|cyclone|tsunami|landslide|drought|hurricane|tornado|wildfire|blizzard|avalanche)/i,
      
      // Pattern 4: "hits/strikes [location]"
      /(?:hits|strikes|affects|impacts)\s+([a-z\s,'-]+?)(?:\s*,|\s*\.|$)/i,
      
      // Pattern 5: "[location] experiences/faces"
      /([a-z\s,'-]+?)\s+(?:experiences|faces|witnesses|reports|suffers)\s+/i,
      
      // Pattern 6: Location with country/state format "City, Country" or "City, State"
      /([a-z\s'-]+?),\s*([a-z\s'-]+?)(?:\s*,|\s*\.|$)/i,
      
      // Pattern 7: Country-specific patterns
      /(?:across|throughout)\s+([a-z\s,'-]+?)(?:\s*,|\s*\.|$)/i,
      
      // Pattern 8: Directional references "northern [location]", "eastern [location]"
      /(?:northern|southern|eastern|western|central|north|south|east|west|northeast|northwest|southeast|southwest)\s+([a-z\s,'-]+?)(?:\s*,|\s*\.|$)/i
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = text.match(patterns[i]);
      if (match && match[1]) {
        let location = match[1].trim();
        
        // For pattern 6 (City, Country format), combine both parts
        if (i === 5 && match[2]) {
          location = `${location}, ${match[2].trim()}`;
        }
        
        // Clean up the location
        location = this.cleanLocationName(location);
        
        // Skip if too short or contains common non-location words
        if (location.length > 2 && !this.isNonLocation(location)) {
          console.log(`🌍 Pattern ${i + 1} extracted: "${location}" from: "${title}"`);
          return location;
        }
      }
    }

    // Final fallback: Look for known global locations in the text
    const foundLocation = this.findKnownLocation(text);
    if (foundLocation) {
      console.log(`🔍 Fallback found: "${foundLocation}" from: "${title}"`);
      return foundLocation;
    }

    console.log(`❌ No location found in: "${title}"`);
    return null;
  }

  // Clean up extracted location names - GLOBAL VERSION
  cleanLocationName(location) {
    // Remove common prefixes/suffixes
    location = location.replace(/^(the|a|an)\s+/i, '');
    location = location.replace(/\s+(area|region|district|state|province|county|city|town|village|country|prefecture|canton|oblast)$/i, '');
    
    // Remove extra whitespace and normalize
    location = location.replace(/\s+/g, ' ').trim();
    
    // Remove trailing punctuation
    location = location.replace(/[.,;:!?]+$/, '');
    
    // Capitalize appropriately (preserve existing capitalization for proper nouns)
    if (location === location.toLowerCase()) {
      location = location.replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return location;
  }

  // Check if extracted text is likely not a location - GLOBAL VERSION
  isNonLocation(text) {
    const nonLocationWords = [
      // News/Alert terms
      'alert', 'warning', 'news', 'report', 'update', 'latest', 'breaking', 'urgent',
      
      // People/Casualties
      'people', 'victims', 'rescue', 'relief', 'damage', 'death', 'injury', 'casualties',
      'residents', 'evacuees', 'survivors', 'missing', 'trapped',
      
      // Organizations
      'government', 'officials', 'authority', 'department', 'ministry', 'agency',
      'police', 'military', 'forces', 'team', 'crew', 'volunteers',
      
      // Time references
      'today', 'yesterday', 'morning', 'evening', 'night', 'hours', 'days',
      'week', 'month', 'year', 'recently', 'now', 'current', 'ongoing',
      
      // Quantities/Descriptors
      'many', 'several', 'multiple', 'various', 'different', 'major', 'minor',
      'heavy', 'severe', 'massive', 'strong', 'powerful', 'intense', 'widespread',
      'devastating', 'catastrophic', 'unprecedented',
      
      // Actions
      'emergency', 'response', 'operations', 'efforts', 'measures', 'assistance',
      'aid', 'help', 'support', 'reconstruction', 'recovery',
      
      // Common words that appear in disaster news
      'areas', 'regions', 'parts', 'sections', 'zones', 'districts'
    ];
    
    const lowerText = text.toLowerCase();
    return nonLocationWords.some(word => lowerText.includes(word));
  }

  // Find known global locations in text - WORLDWIDE VERSION
  findKnownLocation(text) {
    // Global locations database (expandable)
    const knownLocations = [
      // Major world cities
      'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
      'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
      'london', 'birmingham', 'glasgow', 'liverpool', 'leeds', 'sheffield',
      'edinburgh', 'bristol', 'manchester', 'leicester',
      'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes',
      'berlin', 'hamburg', 'munich', 'cologne', 'frankfurt', 'stuttgart',
      'tokyo', 'yokohama', 'osaka', 'nagoya', 'sapporo', 'fukuoka',
      'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'tianjin', 'wuhan',
      'moscow', 'saint petersburg', 'novosibirsk', 'yekaterinburg',
      'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra',
      'toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa',
      'sao paulo', 'rio de janeiro', 'brasilia', 'salvador', 'fortaleza',
      'mexico city', 'guadalajara', 'monterrey', 'puebla', 'tijuana',
      
      // Indian cities (keeping your original focus)
      'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata',
      'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal',
      'visakhapatnam', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
      
      // Countries
      'afghanistan', 'albania', 'algeria', 'argentina', 'armenia', 'australia',
      'austria', 'azerbaijan', 'bangladesh', 'belarus', 'belgium', 'bolivia',
      'bosnia', 'brazil', 'bulgaria', 'cambodia', 'canada', 'chile', 'china',
      'colombia', 'croatia', 'czech republic', 'denmark', 'ecuador', 'egypt',
      'estonia', 'finland', 'france', 'georgia', 'germany', 'ghana', 'greece',
      'guatemala', 'honduras', 'hungary', 'iceland', 'india', 'indonesia',
      'iran', 'iraq', 'ireland', 'israel', 'italy', 'japan', 'jordan',
      'kazakhstan', 'kenya', 'latvia', 'lebanon', 'lithuania', 'malaysia',
      'mexico', 'morocco', 'nepal', 'netherlands', 'new zealand', 'nigeria',
      'norway', 'pakistan', 'peru', 'philippines', 'poland', 'portugal',
      'romania', 'russia', 'saudi arabia', 'serbia', 'singapore', 'slovakia',
      'slovenia', 'south africa', 'south korea', 'spain', 'sri lanka', 'sweden',
      'switzerland', 'taiwan', 'thailand', 'turkey', 'ukraine', 'united kingdom',
      'united states', 'uruguay', 'venezuela', 'vietnam',
      
      // US States
      'california', 'texas', 'florida', 'new york', 'pennsylvania', 'illinois',
      'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia',
      'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana', 'maryland',
      'missouri', 'wisconsin', 'colorado', 'minnesota', 'south carolina', 'alabama',
      'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'utah',
      'iowa', 'nevada', 'arkansas', 'mississippi', 'kansas', 'new mexico',
      'nebraska', 'west virginia', 'idaho', 'hawaii', 'new hampshire', 'maine',
      'montana', 'rhode island', 'delaware', 'south dakota', 'north dakota',
      'alaska', 'vermont', 'wyoming',
      
      // European countries/regions
      'united kingdom', 'great britain', 'england', 'scotland', 'wales', 'ireland',
      'northern ireland', 'isle of man',
      
      // Asian regions
      'southeast asia', 'south asia', 'east asia', 'central asia',
      'middle east', 'asia pacific'
    ];

    // Sort by length (longer names first to avoid partial matches)
    const sortedLocations = knownLocations.sort((a, b) => b.length - a.length);
    
    for (const location of sortedLocations) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        return this.cleanLocationName(location);
      }
    }

    return null;
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  // Geocode using OpenStreetMap Nominatim - WORLDWIDE VERSION
  async geocodeWithNominatim(location) {
    await this.waitForRateLimit();

    try {
      // Don't add ", India" anymore - let it search globally
      const query = location;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      
      console.log(`🌍 Geocoding globally: "${location}" -> ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DisasterAlertApp/1.0'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          country: data[0].address?.country || 'Unknown'
        };
        console.log(`✅ Geocoded "${location}":`, result);
        return result;
      } else {
        console.log(`❌ No results for "${location}"`);
      }
    } catch (error) {
      console.warn(`❌ Geocoding failed for "${location}":`, error);
    }

    return null;
  }

  // Main geocoding function
  async getCoordinates(alert) {
    try {
      const location = this.extractLocation(alert.title, alert.description);
      
      if (!location) {
        return null;
      }

      // Check cache first
      const cacheKey = location.toLowerCase();
      if (this.cache.has(cacheKey)) {
        console.log(`📍 Cache hit for "${location}"`);
        return this.cache.get(cacheKey);
      }

      // Geocode the location
      const coordinates = await this.geocodeWithNominatim(location);
      
      // Cache the result (even if null to avoid repeated failures)
      this.cache.set(cacheKey, coordinates);
      
      return coordinates;
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      return null;
    }
  }

  // Process multiple alerts
  async geocodeAlerts(alerts, onProgress = null) {
    const results = [];
    console.log(`🌍 Starting to geocode ${alerts.length} alerts worldwide...`);
    
    for (let i = 0; i < alerts.length; i++) {
      const alert = alerts[i];
      const coordinates = await this.getCoordinates(alert);
      const extractedLocation = this.extractLocation(alert.title, alert.description);
      
      results.push({
        ...alert,
        coordinates,
        location: extractedLocation || "Unknown location"
      });

      if (onProgress) {
        onProgress((i + 1) / alerts.length * 100);
      }
      
      // Log progress every 10 alerts
      if ((i + 1) % 10 === 0) {
        const successCount = results.slice(0, i + 1).filter(r => r.coordinates).length;
        console.log(`📊 Processed ${i + 1}/${alerts.length} alerts (${successCount} geocoded)`);
      }
    }

    const successCount = results.filter(r => r.coordinates).length;
    const countries = [...new Set(results.filter(r => r.coordinates).map(r => r.coordinates.country))];
    console.log(`✅ Geocoding complete: ${successCount}/${alerts.length} alerts have coordinates`);
    console.log(`🌏 Countries found: ${countries.join(', ')}`);
    
    return results;
  }
  
  // Get cache statistics
  getCacheStats() {
    const totalEntries = this.cache.size;
    const successfulEntries = Array.from(this.cache.values()).filter(v => v !== null).length;
    
    return {
      totalCached: totalEntries,
      successful: successfulEntries,
      failed: totalEntries - successfulEntries
    };
  }
}

export default GeocodingService;