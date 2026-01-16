// /api/events.js - Combined endpoint for all OSINT sources
const fetch = require('node-fetch');

// Country coordinates mapping
const countryCoords = {
  'Afghanistan': [33.93, 67.71], 'Ukraine': [48.38, 31.17], 'Russia': [61.52, 105.32],
  'Syria': [34.80, 39.00], 'Iraq': [33.22, 43.68], 'Iran': [32.43, 53.69],
  'Israel': [31.05, 34.85], 'Palestine': [31.95, 35.23], 'Lebanon': [33.85, 35.86],
  'Yemen': [15.55, 48.52], 'Libya': [26.34, 17.23], 'Sudan': [12.86, 30.22],
  'South Sudan': [6.88, 31.31], 'Somalia': [5.15, 46.20], 'Ethiopia': [9.15, 40.49],
  'Nigeria': [9.08, 8.68], 'Mali': [17.57, -4.00], 'Niger': [17.61, 8.08],
  'Burkina Faso': [12.24, -1.56], 'Chad': [15.45, 18.73], 'Cameroon': [7.37, 12.35],
  'Central African Republic': [6.61, 20.94], 'Democratic Republic of the Congo': [-4.04, 21.76],
  'Mozambique': [-18.67, 35.53], 'Myanmar': [21.92, 95.96], 'Pakistan': [30.38, 69.35],
  'India': [20.59, 78.96], 'China': [35.86, 104.20], 'North Korea': [40.34, 127.51],
  'South Korea': [35.91, 127.77], 'Taiwan': [23.70, 120.96], 'Philippines': [12.88, 121.77],
  'Indonesia': [-0.79, 113.92], 'Thailand': [15.87, 100.99], 'Mexico': [23.63, -102.55],
  'Colombia': [4.57, -74.30], 'Venezuela': [6.42, -66.59], 'Brazil': [-14.24, -51.93],
  'Haiti': [18.97, -72.29], 'United States': [37.09, -95.71], 'United Kingdom': [55.38, -3.44],
  'France': [46.23, 2.21], 'Germany': [51.17, 10.45], 'Poland': [51.92, 19.15],
  'Turkey': [38.96, 35.24], 'Georgia': [42.32, 43.36], 'Armenia': [40.07, 45.04],
  'Azerbaijan': [40.14, 47.58], 'Kazakhstan': [48.02, 66.92], 'Uzbekistan': [41.38, 64.59],
  'Tajikistan': [38.86, 71.28], 'Kyrgyzstan': [41.20, 74.77], 'Turkmenistan': [38.97, 59.56],
  'Egypt': [26.82, 30.80], 'Tunisia': [33.89, 9.54], 'Algeria': [28.03, 1.66],
  'Morocco': [31.79, -7.09], 'Saudi Arabia': [23.89, 45.08], 'United Arab Emirates': [23.42, 53.85],
  'Jordan': [30.59, 36.24], 'Kuwait': [29.31, 47.48], 'Qatar': [25.35, 51.18],
  'Bahrain': [26.07, 50.56], 'Oman': [21.47, 55.98]
};

function getCoords(country) {
  // Try exact match
  if (countryCoords[country]) return countryCoords[country];
  
  // Try partial match
  for (const [name, coords] of Object.entries(countryCoords)) {
    if (country.includes(name) || name.includes(country)) {
      return coords;
    }
  }
  
  return null;
}

function categorizeEvent(title, themes) {
  const text = ((title || '') + ' ' + (themes || '')).toLowerCase();
  
  if (text.includes('military') || text.includes('army') || text.includes('troops') || 
      text.includes('strike') || text.includes('drone') || text.includes('missile') ||
      text.includes('war') || text.includes('combat') || text.includes('soldier')) {
    return 'military';
  }
  if (text.includes('terror') || text.includes('bomb') || text.includes('explosion') ||
      text.includes('attack') || text.includes('isis') || text.includes('al-qaeda')) {
    return 'terrorism';
  }
  if (text.includes('protest') || text.includes('demonstrat') || text.includes('riot') ||
      text.includes('rally') || text.includes('march') || text.includes('unrest')) {
    return 'protest';
  }
  if (text.includes('earthquake') || text.includes('flood') || text.includes('hurricane') ||
      text.includes('disaster') || text.includes('tsunami') || text.includes('storm')) {
    return 'disaster';
  }
  if (text.includes('cyber') || text.includes('hack') || text.includes('breach') ||
      text.includes('ransomware') || text.includes('malware')) {
    return 'cyber';
  }
  
  return 'political';
}

function getPriority(tone, title) {
  const text = (title || '').toLowerCase();
  
  // Critical keywords
  if (text.includes('breaking') || text.includes('urgent') || text.includes('massacre') ||
      text.includes('invasion') || text.includes('nuclear') || text.includes('crisis')) {
    return 'critical';
  }
  
  // Use tone if available
  if (tone !== undefined) {
    if (tone <= -5) return 'critical';
    if (tone <= -3) return 'high';
    if (tone <= -1) return 'medium';
  }
  
  // High priority keywords
  if (text.includes('kill') || text.includes('dead') || text.includes('attack') ||
      text.includes('strike') || text.includes('bomb')) {
    return 'high';
  }
  
  return 'medium';
}

function getVerificationScore(domain) {
  const d = (domain || '').toLowerCase();
  
  if (d.includes('reuters') || d.includes('apnews') || d.includes('afp.com')) return 90;
  if (d.includes('bbc') || d.includes('aljazeera') || d.includes('france24')) return 85;
  if (d.includes('.gov') || d.includes('un.org') || d.includes('nato.int')) return 95;
  if (d.includes('nytimes') || d.includes('guardian') || d.includes('washingtonpost')) return 80;
  if (d.includes('cnn') || d.includes('foxnews') || d.includes('msnbc')) return 70;
  
  return 50;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const query = req.query.q || 'conflict OR military OR protest OR crisis';
    const limit = parseInt(req.query.limit) || 50;
    const timespan = req.query.timespan || '24h';

    // Fetch from GDELT
    const params = new URLSearchParams({
      query: query,
      mode: 'ArtList',
      maxrecords: Math.min(limit * 2, 100), // Fetch more to filter
      format: 'json',
      timespan: timespan,
      sort: 'DateDesc'
    });

    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
    
    const response = await fetch(gdeltUrl, {
      headers: { 'User-Agent': 'OSINT-Globe/1.0' },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`GDELT error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.articles || data.articles.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        events: [],
        message: 'No articles found'
      });
    }

    // Process and transform articles into events
    const events = data.articles
      .filter(article => article.title && article.sourcecountry)
      .map((article, index) => {
        const coords = getCoords(article.sourcecountry);
        if (!coords) return null;

        const tone = parseFloat(article.tone) || 0;
        
        return {
          id: index + 1,
          title: article.title.substring(0, 120),
          category: categorizeEvent(article.title, article.themes),
          priority: getPriority(tone, article.title),
          lat: coords[0] + (Math.random() - 0.5) * 2,
          lng: coords[1] + (Math.random() - 0.5) * 2,
          location: article.sourcecountry,
          description: article.title,
          source: {
            name: article.domain || 'Unknown',
            url: article.url,
            type: 'news'
          },
          verificationScore: getVerificationScore(article.domain),
          timestamp: article.seendate || new Date().toISOString(),
          tone: tone
        };
      })
      .filter(e => e !== null)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      source: 'GDELT',
      timestamp: new Date().toISOString(),
      count: events.length,
      events: events
    });

  } catch (error) {
    console.error('API Error:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
