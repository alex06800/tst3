// /api/acled.js - Proxy pour ACLED API (Armed Conflict Location & Event Data)
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const limit = req.query.limit || 100;
    const country = req.query.country || '';
    
    // ACLED API (free tier - requires registration but works)
    // For demo, we'll use their public sample endpoint
    let url = `https://api.acleddata.com/acled/read?terms=accept&limit=${limit}`;
    
    if (country) {
      url += `&country=${encodeURIComponent(country)}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ACLED responded with ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json({
      success: true,
      source: 'ACLED',
      timestamp: new Date().toISOString(),
      count: data.data ? data.data.length : 0,
      events: data.data || []
    });

  } catch (error) {
    console.error('ACLED API Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      source: 'ACLED'
    });
  }
};
