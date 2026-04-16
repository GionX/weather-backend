const express = require('express');
const app = express();

// ============ YOUR MAJOR CITIES ============
// Add as many as you want! Format: 'cityname': { lat: number, lon: number }
const cities = {
  'newyork': { lat: 40.7128, lon: -74.0060 },
  'losangeles': { lat: 34.0522, lon: -118.2437 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'philadelphia': { lat: 39.9526, lon: -75.1652 },
  'sanantonio': { lat: 29.4241, lon: -98.4936 },
  'sandiego': { lat: 32.7157, lon: -117.1611 },
  'dallas': { lat: 32.7767, lon: -96.7970 },
  'austin': { lat: 30.2672, lon: -97.7431 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'berlin': { lat: 52.5200, lon: 13.4050 },
  'moscow': { lat: 55.7558, lon: 37.6173 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'beijing': { lat: 39.9042, lon: 116.4074 },
  'cairo': { lat: 30.0444, lon: 31.2357 },
  'mexicocity': { lat: 19.4326, lon: -99.1332 }
  // Add more cities here following the same format
};

// In-memory cache (stores weather data for 4 hours)
const cache = new Map();

// Enable CORS so your React Native app can call this
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Weather endpoint
app.get('/weather/:city', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ 
      error: 'City not found',
      availableCities: Object.keys(cities)
    });
  }
  
  // Check cache (4 hour TTL)
  const cached = cache.get(cityName);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < 14400000) { // 4 hours
    console.log(`✅ Cache hit: ${cityName} (${Math.round((now - cached.timestamp) / 1000 / 60)} minutes old)`);
    return res.json(cached.weather);
  }
  
  console.log(`🌐 Fetching fresh weather for: ${cityName}`);
  
  try {
    // Round to 4 decimals as required by MET Norway
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    // Call MET Norway API
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'WeatherEffectsApp/1.0 (your-email@example.com)' // CHANGE THIS EMAIL
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`MET API error: ${response.status}`);
    }
    
    const data = await response.json();
    const current = data.properties.timeseries[0].data;
    const symbolCode = current.next_1_hours?.summary.symbol_code ||
                       current.current?.summary.symbol_code;
    
    // Map MET Norway codes to your weather modes
    const weatherMap = {
      'clearsky': 'clear',
      'fair': 'clear',
      'fair_day': 'clear',
      'fair_night': 'clear',
      'partlycloudy': 'cloudy',
      'partlycloudy_day': 'cloudy',
      'partlycloudy_night': 'cloudy',
      'cloudy': 'cloudy',
      'rain': 'rain',
      'heavyrain': 'rain',
      'lightrain': 'rain',
      'rainandfog': 'rain',
      'snow': 'snow',
      'heavysnow': 'snow',
      'lightsnow': 'snow',
      'snowandfog': 'snow',
      'fog': 'fog',
      'thunderstorm': 'rain'
    };
    
    const weather = {
      condition: weatherMap[symbolCode] || 'clear',
      temperature: Math.round(current.instant.details.air_temperature),
      updatedAt: new Date().toISOString(),
      city: cityName
    };
    
    // Store in cache
    cache.set(cityName, {
      weather: weather,
      timestamp: now
    });
    
    res.json(weather);
    
  } catch (error) {
    console.error(`❌ Error fetching weather for ${cityName}:`, error.message);
    res.status(500).json({ 
      error: 'Weather service unavailable',
      message: error.message
    });
  }
});

// List all available cities
app.get('/cities', (req, res) => {
  res.json({
    count: Object.keys(cities).length,
    cities: Object.keys(cities)
  });
});

// Cache statistics
app.get('/stats', (req, res) => {
  const stats = {};
  const now = Date.now();
  for (const [city, data] of cache.entries()) {
    const ageMinutes = Math.round((now - data.timestamp) / 1000 / 60);
    stats[city] = {
      age: `${ageMinutes} minutes`,
      condition: data.weather.condition,
      temperature: data.weather.temperature
    };
  }
  res.json({
    cachedCities: Object.keys(stats).length,
    details: stats
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Weather API is running',
    cacheDuration: '4 hours',
    availableCities: Object.keys(cities).length
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Weather API running on port ${port}`);
  console.log(`📡 Cache duration: 4 hours`);
  console.log(`🌆 Cities available: ${Object.keys(cities).length}`);
});