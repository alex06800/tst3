const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const query = req.query.q || 'conflict OR military OR protest';
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=50&format=json&timespan=24h`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.status(200).json({
      success: true,
      count: data.articles ? data.articles.length : 0,
      articles: data.articles || []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
