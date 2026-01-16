// /api/gdelt.js - Proxy pour GDELT API
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get query parameter or use default
    const query = req.query.q || 'conflict OR military OR protest OR attack';
    const maxrecords = req.query.limit || 75;
    const timespan = req.query.timespan || '24h';

    const params = new URLSearchParams({
      query: query,
      mode: 'ArtList',
      maxrecords: maxrecords,
      format: 'json',
      timespan: timespan,
      sort: 'DateDesc'
    });

    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
    
    console.log('Fetching GDELT:', gdeltUrl);

    const response = await fetch(gdeltUrl, {
      headers: {
        'User-Agent': 'OSINT-Globe/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GDELT responded with ${response.status}`);
    }

    const data = await response.json();

    // Return the data
    res.status(200).json({
      success: true,
      source: 'GDELT',
      timestamp: new Date().toISOString(),
      count: data.articles ? data.articles.length : 0,
      articles: data.articles || []
    });

  } catch (error) {
    console.error('GDELT API Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'GDELT'
    });
  }
};
