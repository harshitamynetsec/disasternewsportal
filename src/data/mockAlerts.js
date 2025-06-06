const mockAlerts = [
  {
    id: 1,
    title: "Flood Warning",
    type: "Weather", // ✅ added
    time: "2025-06-04 10:00", // ✅ added
    location: "Punjab, India",
    severity: "High",
    description: "Heavy rainfall expected. Stay indoors and avoid travel.",
    lat: 31.1471,
    lng: 75.3412,
  },
  {
    id: 2,
    title: "Heatwave Alert",
    type: "Weather",
    time: "2025-06-04 11:00",
    location: "Rajasthan, India",
    severity: "Moderate",
    description: "Temperatures exceeding 45°C. Stay hydrated.",
    lat: 27.0238,
    lng: 74.2179,
  },
  {
    id: 3,
    title: "Air Quality Alert",
    type: "Emergency",
    time: "2025-06-04 12:00",
    location: "Delhi, India",
    severity: "Severe",
    description: "Air quality is hazardous. Wear masks outdoors.",
    lat: 28.7041,
    lng: 77.1025,
  },
];

export default mockAlerts;
