const API_KEY = 'YOUR_NEWSAPI_KEY';
const BASE_URL = 'https://newsapi.org/v2/everything?q=alert&language=en&pageSize=20';

export const fetchNewsAlerts = async () => {
  try {
    const response = await fetch(`${BASE_URL}&apiKey=${API_KEY}`);
    const data = await response.json();
    
    // Example transformation (you'll adapt this based on your alert card format)
    return data.articles.map((item, index) => ({
      id: index,
      title: item.title,
      description: item.description,
      location: extractLocationFromTitle(item.title), // write your own logic
      type: "news", // or "emergency", etc.
      time: new Date(item.publishedAt).toLocaleString()
    }));
  } catch (error) {
    console.error("Error fetching news alerts:", error);
    return [];
  }
};

// Dummy location extractor
function extractLocationFromTitle(title) {
  // Ideally, your backend should give proper geo info
  return {
    name: "Unknown Location",
    lat: 28.6139,  // fallback location (Delhi)
    lng: 77.2090
  };
}
