const fetch = require('node-fetch');

// Simulated dummy APIs that return timestamps
const urls = {
  sourceA: 'https://api.sampleapis.com/futurama/characters', // replace with real API
  sourceB: 'https://api.sampleapis.com/futurama/info',
  sourceC: 'https://api.sampleapis.com/futurama/episodes'
};

async function fetchDataFromSources() {
  const responses = await Promise.all(
    Object.entries(urls).map(([key, url]) =>
      fetch(url)
        .then(res => res.json())
        .then(data => {
          // Attach fake timestamps for demo
          const enriched = Array.isArray(data)
            ? data.slice(0, 5).map((item, i) => ({
                ...item,
                timestamp: new Date(Date.now() - i * 60000).toISOString(),
                source: key,
              }))
            : [{
                ...data,
                timestamp: new Date().toISOString(),
                source: key,
              }];
          return enriched;
        })
        .catch(error => {
          console.error(`Error from ${key}:`, error);
          return [];
        })
    )
  );

  const allData = responses.flat();

  allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return allData;
}

fetchDataFromSources().then((data) => {
  console.log("Sorted Results (newest first):\n");
  console.log(data.map(item => ({
    source: item.source,
    timestamp: item.timestamp,
    title: item.name || item.title || "N/A"
  })));
});
