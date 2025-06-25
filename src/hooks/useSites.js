import { useState, useEffect, useRef } from 'react';

const useSites = () => {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const previousSitesRef = useRef([]);

  // Sort sites by name
  const sortSitesByName = (sitesArray) => {
    return [...sitesArray].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  // Transform the API data to match MapView expectations
  const transformSiteData = (apiData) => {
    return apiData.map((site, index) => ({
      id: `site-${index}`, // Add unique ID
      name: site.name,
      latitude: site.lat, // Transform lat to latitude
      longitude: site.lon, // Transform lon to longitude
      address: site.address || '', // Add address field if available
      type: 'site' // Add type identifier
    }));
  };

  // Fetch sites data
  const fetchSitesData = async () => {
    try {
      const response = await fetch("https://disaster-api-dohm.onrender.com/hp-sites");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Transform and sort the data
      const transformedSites = transformSiteData(data);
      const sortedSites = sortSitesByName(transformedSites);
      setSites(sortedSites);
      
      // Save for future comparison
      previousSitesRef.current = [...sortedSites];
      
      console.log(`Fetched ${sortedSites.length} sites`);
      return sortedSites;
    } catch (error) {
      console.error("Failed to fetch sites:", error);
      return [];
    }
  };

  // Fetch all data (only sites in this case)
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const sitesData = await fetchSitesData();
      setLastFetchTime(new Date());
      console.log(`Total data fetched: ${sitesData.length} sites`);
    } catch (error) {
      console.error("Failed to fetch all data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();

    // Optional: periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchAllData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  return {
    sites,
    isLoading,
    lastFetchTime,
    sortSitesByName,
    refetch: fetchAllData,
    refetchSites: fetchSitesData,
  };
};

export default useSites;