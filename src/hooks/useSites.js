import { useState, useEffect, useRef } from 'react';

const useSites = () => {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [error, setError] = useState(null);
  const previousSitesRef = useRef([]);

  const USE_MOCK_PROXIMITY_DATA = true;

  // Sort sites by name
  const sortSitesByName = (sitesArray) => {
    return [...sitesArray].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  // Transform HP sites data to match MapView expectations
  const transformHPSiteData = (apiData) => {
    return apiData.map((site, index) => ({
      id: `hp-site-${index}`,
      name: site.name || `HP Site ${index + 1}`,
      latitude: parseFloat(site.lat),
      longitude: parseFloat(site.lon),
      address: site.address || '',
      phone: site.phone || '',
      email: site.email || '',
      type: 'site', // This is important for MapView filtering
      source: 'hp' // Track the source
    })).filter(site => !isNaN(site.latitude) && !isNaN(site.longitude));
  };

  // Transform CoreBridge sites data to match MapView expectations
  const transformCoreBridgeSiteData = (apiData) => {
    return apiData.map((site, index) => ({
      id: `corebridge-site-${index}`,
      name: site.name || `CoreBridge Site ${index + 1}`,
      latitude: parseFloat(site.lat),
      longitude: parseFloat(site.lon),
      address: site.address || '',
      phone: site.phone || '',
      email: site.email || '',
      type: 'site', // This is important for MapView filtering
      source: 'corebridge' // Track the source
    })).filter(site => !isNaN(site.latitude) && !isNaN(site.longitude));
  };

  // Fetch HP sites
  const fetchHPSites = async () => {
    try {
      console.log('Fetching HP sites...');
      const response = await fetch("https://disaster-api-dohm.onrender.com/hp-sites");
      if (!response.ok) {
        throw new Error(`HP Sites API error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedSites = transformHPSiteData(data);
      console.log(`Fetched ${transformedSites.length} HP sites`);
      return transformedSites;
    } catch (error) {
      console.error("Failed to fetch HP sites:", error);
      throw error;
    }
  };

  // Fetch CoreBridge sites
  const fetchCoreBridgeSites = async () => {
    try {
      console.log('Fetching CoreBridge sites...');
      const response = await fetch("https://disaster-api-dohm.onrender.com/corebridge-sites");
      if (!response.ok) {
        throw new Error(`CoreBridge Sites API error! status: ${response.status}`);
      }
      const data = await response.json();
      const transformedSites = transformCoreBridgeSiteData(data);
      console.log(`Fetched ${transformedSites.length} CoreBridge sites`);
      return transformedSites;
    } catch (error) {
      console.error("Failed to fetch CoreBridge sites:", error);
      throw error;
    }
  };

  // Fetch all sites data from both endpoints
  const fetchAllSitesData = async () => {
    try {
      // Fetch both HP and CoreBridge sites in parallel
      const [hpSites, coreBridgeSites] = await Promise.allSettled([
        fetchHPSites(),
        fetchCoreBridgeSites()
      ]);

      let allSites = [];

      // Process HP sites results
      if (hpSites.status === 'fulfilled') {
        allSites = [...allSites, ...hpSites.value];
      } else {
        console.error('HP Sites fetch failed:', hpSites.reason);
      }

      // Process CoreBridge sites results
      if (coreBridgeSites.status === 'fulfilled') {
        allSites = [...allSites, ...coreBridgeSites.value];
      } else {
        console.error('CoreBridge Sites fetch failed:', coreBridgeSites.reason);
      }

      // Sort the combined sites
      const sortedSites = sortSitesByName(allSites);
      setSites(sortedSites);
      
      // Save for future comparison
      previousSitesRef.current = [...sortedSites];
      
      console.log(`Total sites fetched: ${sortedSites.length} (HP: ${hpSites.status === 'fulfilled' ? hpSites.value.length : 0}, CoreBridge: ${coreBridgeSites.status === 'fulfilled' ? coreBridgeSites.value.length : 0})`);
      
      return sortedSites;
    } catch (error) {
      console.error("Failed to fetch sites data:", error);
      setError(error.message);
      return [];
    }
  };

  // Main fetch function
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const sitesData = await fetchAllSitesData();
      setLastFetchTime(new Date());
      console.log(`Data fetch completed: ${sitesData.length} total sites`);
    } catch (error) {
      console.error("Failed to fetch all data:", error);
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  // Filter sites by source if needed
  const getHPSites = () => sites.filter(site => site.source === 'hp');
  const getCoreBridgeSites = () => sites.filter(site => site.source === 'corebridge');

  // Initial fetch on component mount
  useEffect(() => {
    fetchAllData();

    // Optional: Set up periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(() => {
      fetchAllData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Add a mock site near the mock alert for testing
  const mockTestSite = {
    name: 'Test Site Manila',
    latitude: 14.5995,
    longitude: 120.9842,
    id: 'test-site-manila'
  };

  if (USE_MOCK_PROXIMITY_DATA) {
    sites.push(mockTestSite);
  }

  return {
    sites,
    isLoading,
    lastFetchTime,
    error,
    sortSitesByName,
    refetch: fetchAllData,
    refetchSites: fetchAllSitesData,
    getHPSites,
    getCoreBridgeSites,
    // Stats
    totalSites: sites.length,
    hpSitesCount: getHPSites().length,
    coreBridgeSitesCount: getCoreBridgeSites().length,
  };
};

export default useSites;