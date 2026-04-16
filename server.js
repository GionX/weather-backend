const express = require('express');
const app = express();

// Cities database
const cities = {
  'newyork': { lat: 40.7128, lon: -74.0060 },
  'losangeles': { lat: 34.0522, lon: -118.2437 },
  'chicago': { lat: 41.8781, lon: -87.6298 },
  'houston': { lat: 29.7604, lon: -95.3698 },
  'phoenix': { lat: 33.4484, lon: -112.0740 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'paris': { lat: 48.8566, lon: 2.3522 },
  'tokyo': { lat: 35.6762, lon: 139.6503 },
  'sydney': { lat: -33.8688, lon: 151.2093 },
  'berlin': { lat: 52.5200, lon: 13.4050 }
};

// Caches
const weatherCache = new Map();
const sunCache = new Map();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ============ WEATHER ENDPOINT ============
app.get('/weather/:city', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ error: 'City not found', availableCities: Object.keys(cities) });
  }
  
  // Check cache (4 hours)
  const cached = weatherCache.get(cityName);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < 14400000) {
    return res.json(cached.data);
  }
  
  try {
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    const response = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'WeatherApp/1.0 (your@email.com)' } }
    );
    
    const data = await response.json();
    const current = data.properties.timeseries[0].data;
    const symbolCode = current.next_1_hours?.summary.symbol_code || 'clearsky';
    
    const weatherMap = {
      'clearsky': 'clear', 'fair': 'clear', 'partlycloudy': 'cloudy',
      'cloudy': 'cloudy', 'rain': 'rain', 'heavyrain': 'rain',
      'lightrain': 'rain', 'snow': 'snow', 'heavysnow': 'snow',
      'lightsnow': 'snow', 'fog': 'fog'
    };
    
    const weather = {
      condition: weatherMap[symbolCode] || 'clear',
      temperature: Math.round(current.instant.details.air_temperature),
      updatedAt: new Date().toISOString(),
      city: cityName
    };
    
    weatherCache.set(cityName, { data: weather, timestamp: now });
    res.json(weather);
    
  } catch (error) {
    res.status(500).json({ error: 'Weather service unavailable' });
  }
});

// ============ SUNRISE/SUNSET ENDPOINT ============
app.get('/sun/:city', async (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const city = cities[cityName];
  
  if (!city) {
    return res.status(404).json({ error: 'City not found' });
  }
  
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const cacheKey = `${cityName}_${date}`;
  const cached = sunCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < 86400000) {
    return res.json(cached.data);
  }
  
  try {
    const lat = city.lat.toFixed(4);
    const lon = city.lon.toFixed(4);
    
    const response = await fetch(
      `https://api.met.no/weatherapi/sunrise/2.0/?lat=${lat}&lon=${lon}&date=${date}`,
      { headers: { 'User-Agent': 'WeatherApp/1.0 (your@email.com)' } }
    );
    
    const data = await response.json();
    
    let dayDuration = null;
    let nightDuration = null;
    
    if (data.properties.sunrise?.time && data.properties.sunset?.time) {
      const sunrise = new Date(data.properties.sunrise.time);
      const sunset = new Date(data.properties.sunset.time);
      const dayMs = sunset - sunrise;
      const dayHours = Math.floor(dayMs / 3600000);
      const dayMinutes = Math.floor((dayMs % 3600000) / 60000);
      dayDuration = `${dayHours}h ${dayMinutes}m`;
      
      const nightMs = 86400000 - dayMs;
      const nightHours = Math.floor(nightMs / 3600000);
      const nightMinutes = Math.floor((nightMs % 3600000) / 60000);
      nightDuration = `${nightHours}h ${nightMinutes}m`;
    }
    
    const sunData = {
      city: cityName,
      date: date,
      sunrise: data.properties.sunrise?.time || null,
      sunset: data.properties.sunset?.time || null,
      dayDuration: dayDuration,
      nightDuration: nightDuration,
      moonPhase: data.properties.moon_phase?.description || null
    };
    
    sunCache.set(cacheKey, { data: sunData, timestamp: now });
    res.json(sunData);
    
  } catch (error) {
    console.error('Sun API error:', error.message);
    res.status(500).json({ error: 'Sun data service unavailable' });
  }
});

// ============ LIST CITIES ============
app.get('/cities', (req, res) => {
  res.json({ count: Object.keys(cities).length, cities: Object.keys(cities) });
});

// ============ HEALTH CHECK ============
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Weather & Sun API is running',
    endpoints: {
      weather: '/weather/:city',
      sun: '/sun/:city',
      cities: '/cities'
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ API running on port ${port}`);
  console.log(`🌆 Cities: ${Object.keys(cities).length}`);
});
